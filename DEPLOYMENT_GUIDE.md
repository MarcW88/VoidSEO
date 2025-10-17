# 🚀 Guide de Déploiement Sécurisé - VoidSEO

## 📋 **Checklist Pré-Déploiement**

### 1. **Configuration Supabase**

#### Créer le Projet
```bash
1. Aller sur https://supabase.com
2. Créer un nouveau projet
3. Choisir région EU (pour RGPD)
4. Noter les clés API
```

#### Configurer la Base de Données
```sql
-- Copier/coller le contenu de supabase/schema.sql
-- Dans l'éditeur SQL de Supabase
-- Exécuter le script complet
```

#### Configurer l'Authentification
```bash
1. Authentication > Settings
2. Enable email confirmations: ON
3. Enable email change confirmations: ON
4. Secure email change: ON
5. Session timeout: 24 hours
```

#### Configurer le Storage
```bash
1. Storage > Create bucket: "downloads"
2. Public: OFF (privé)
3. Upload vos fichiers PDF/ZIP
```

### 2. **Variables d'Environnement**

#### Créer `.env.local`
```bash
# Supabase (remplacer par vos vraies valeurs)
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key

# API Keys (garder secret)
SERPAPI_KEY=votre-serpapi-key
OPENAI_API_KEY=votre-openai-key

# Security
JWT_SECRET=votre-jwt-secret-ultra-long-et-complexe
ADMIN_IP_ALLOWLIST=127.0.0.1,votre-ip-publique

# Newsletter (optionnel)
BEEHIIV_API_KEY=votre-beehiiv-key

# Environment
NODE_ENV=production
```

### 3. **Déploiement Vercel**

#### Installation
```bash
npm install -g vercel
cd /Users/marc/Desktop/VOIDSEO
vercel login
```

#### Configuration
```bash
# Première fois
vercel

# Questions Vercel :
# - Project name: voidseo
# - Framework: Next.js
# - Root directory: ./
# - Build command: npm run build
# - Output directory: .next
```

#### Variables d'Environnement Vercel
```bash
# Via dashboard Vercel ou CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add SERPAPI_KEY
vercel env add JWT_SECRET
vercel env add ADMIN_IP_ALLOWLIST
```

#### Déploiement
```bash
vercel --prod
```

### 4. **Alternative : Déploiement Netlify**

#### Netlify Functions
```bash
# Créer netlify/functions/ pour les API routes
# Adapter les API routes pour Netlify Functions
```

#### netlify.toml
```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/dashboard"
  to = "/dashboard/free.html"
  status = 302

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    X-XSS-Protection = "1; mode=block"
```

## 🔐 **Configuration Sécurité Post-Déploiement**

### 1. **Supabase RLS Policies**
```sql
-- Vérifier que toutes les policies sont actives
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 2. **Test de Sécurité**
```bash
# Tester les endpoints protégés
curl -X GET https://votre-site.vercel.app/api/admin/stats
# Doit retourner 401 Unauthorized

# Tester rate limiting
for i in {1..20}; do
  curl -X POST https://votre-site.vercel.app/api/auth/signup \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"password"}'
done
# Doit être rate limité après 5 tentatives
```

### 3. **Monitoring**
```bash
# Supabase Dashboard
1. Vérifier les logs d'authentification
2. Monitorer l'usage API
3. Vérifier les erreurs RLS

# Vercel Dashboard
1. Vérifier les logs de fonctions
2. Monitorer les performances
3. Vérifier les erreurs 500
```

## 🎯 **URLs Finales**

### **Production**
```
Site principal: https://votre-site.vercel.app
Dashboard client: https://votre-site.vercel.app/dashboard/
Admin panel: https://votre-site.vercel.app/admin/
API endpoints: https://votre-site.vercel.app/api/
```

### **Test de Fonctionnement**
```bash
# 1. Signup
curl -X POST https://votre-site.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@votre-domaine.com","password":"motdepasse123","name":"Test User"}'

# 2. Login
curl -X POST https://votre-site.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@votre-domaine.com","password":"motdepasse123"}'

# 3. Test app protégée
curl -X POST https://votre-site.vercel.app/api/protected/paa-explorer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_JWT_TOKEN" \
  -d '{"query":"SEO automation"}'
```

## ✅ **Checklist Final**

- [ ] Projet Supabase créé et configuré
- [ ] Schema SQL exécuté
- [ ] Storage configuré avec fichiers uploadés
- [ ] Variables d'environnement configurées
- [ ] Site déployé sur Vercel/Netlify
- [ ] Tests de sécurité passés
- [ ] Monitoring configuré
- [ ] DNS configuré (si domaine custom)
- [ ] SSL/HTTPS activé
- [ ] Rate limiting testé
- [ ] Admin panel accessible
- [ ] Dashboard client fonctionnel

## 🚨 **Sécurité Post-Déploiement**

### **Surveillance Continue**
1. **Logs Supabase** → Tentatives de connexion suspectes
2. **Logs Vercel** → Erreurs 500, pics de trafic
3. **Rate limiting** → Ajuster si nécessaire
4. **Backups** → Supabase backup automatique activé

### **Mises à Jour**
1. **Dependencies** → `npm audit` régulièrement
2. **Supabase** → Suivre les mises à jour de sécurité
3. **Headers** → Ajuster CSP si nouveaux services

**Votre VoidSEO sera ultra-sécurisé et prêt pour la production ! 🔒🚀**
