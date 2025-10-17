# 🔒 Plan de Sécurisation VoidSEO

## 🚨 **Problème Actuel**
- Dashboard accessible sans auth
- Admin panel ouvert à tous
- Téléchargements en liens directs
- Clés API potentiellement exposées
- Aucune protection serveur

## ✅ **Solution Minimale (Sans Tout Refaire)**

### 1. **Auth & Rôles (Supabase)**

#### Configuration Supabase
```sql
-- Table users avec rôles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'free' CHECK (role IN ('free', 'builder', 'admin')),
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  newsletter_opt_in BOOLEAN DEFAULT false
);

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy : users peuvent voir leur profil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy : admins peuvent tout voir
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### Middleware Vercel (middleware.ts)
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Vérifier la session
  const { data: { session } } = await supabase.auth.getSession()

  // Routes protégées
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Admin uniquement
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*']
}
```

### 2. **Téléchargements Sécurisés**

#### Fonction Serverless (api/download/[file].ts)
```typescript
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res })
  const { file } = req.query

  // Vérifier auth
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Vérifier le rôle pour les fichiers premium
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const premiumFiles = ['templates-pack.zip', 'prd-framework.pdf']
  if (premiumFiles.includes(file as string) && profile?.role === 'free') {
    return res.status(403).json({ error: 'Upgrade required' })
  }

  // Générer URL signée (valide 10 minutes)
  const { data, error } = await supabase.storage
    .from('downloads')
    .createSignedUrl(file as string, 600)

  if (error) {
    return res.status(404).json({ error: 'File not found' })
  }

  // Log du téléchargement
  await supabase.from('download_logs').insert({
    user_id: session.user.id,
    file_name: file,
    downloaded_at: new Date()
  })

  res.redirect(data.signedUrl)
}
```

### 3. **Apps Sécurisées (Proxy API)**

#### Fonction PAA Explorer (api/paa-explorer.ts)
```typescript
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res })
  
  // Vérifier auth
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Rate limiting (Free tier : 30 req/jour)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role === 'free') {
    // Vérifier quota
    const { count } = await supabase
      .from('api_usage')
      .select('*', { count: 'exact' })
      .eq('user_id', session.user.id)
      .eq('endpoint', 'paa-explorer')
      .gte('created_at', new Date(Date.now() - 24*60*60*1000).toISOString())

    if (count && count >= 30) {
      return res.status(429).json({ error: 'Daily quota exceeded' })
    }
  }

  // Appel API avec clé serveur
  const response = await fetch('https://api.serpapi.com/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SERPAPI_KEY}`, // Clé côté serveur
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(req.body)
  })

  const data = await response.json()

  // Log usage
  await supabase.from('api_usage').insert({
    user_id: session.user.id,
    endpoint: 'paa-explorer',
    created_at: new Date()
  })

  res.json(data)
}
```

### 4. **Headers de Sécurité**

#### next.config.js
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co"
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}
```

### 5. **Admin Sécurisé**

#### Sous-domaine admin.voidseo.dev
```typescript
// pages/admin/index.tsx
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { GetServerSideProps } from 'next'

export default function AdminDashboard({ users, stats }) {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      {/* Interface admin sécurisée */}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const supabase = createServerSupabaseClient({ req, res })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return { redirect: { destination: '/login', permanent: false } }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { redirect: { destination: '/dashboard', permanent: false } }
  }

  // Récupérer données admin
  const { data: users } = await supabase.from('profiles').select('*')
  const { data: stats } = await supabase.from('usage_stats').select('*')

  return { props: { users, stats } }
}
```

## 🚀 **Migration Plan**

### Phase 1 : Sécurisation Immédiate
1. ✅ Setup Supabase Auth
2. ✅ Middleware pour /dashboard et /admin
3. ✅ Headers de sécurité
4. ✅ Téléchargements via URLs signées

### Phase 2 : Apps Sécurisées
1. ✅ Proxy API pour PAA Explorer
2. ✅ Rate limiting par rôle
3. ✅ Logs d'usage
4. ✅ Quotas Free tier

### Phase 3 : Admin Professionnel
1. ✅ Interface admin sécurisée
2. ✅ Gestion des rôles
3. ✅ Analytics usage
4. ✅ Export sécurisé

## 📋 **Checklist MVP Sécurisé**

- [ ] Supabase Auth configuré
- [ ] Middleware Vercel/Cloudflare
- [ ] /dashboard protégé (login requis)
- [ ] /admin protégé (role admin)
- [ ] Téléchargements via URLs signées
- [ ] Apps via proxy serverless
- [ ] Headers de sécurité (CSP, HSTS)
- [ ] Rate limiting Free tier
- [ ] Logs d'usage
- [ ] Privacy Policy + RGPD

## 🎯 **Résultat**

✅ **Pages marketing** → HTML statique (rapide, SEO)
🔒 **Dashboard/Admin** → Auth + protection serveur
🔐 **Téléchargements** → URLs signées temporaires
⚡ **Apps** → Proxy sécurisé avec quotas
📊 **Analytics** → Logs d'usage protégés

**Sécurité réelle sans casser l'existant !**
