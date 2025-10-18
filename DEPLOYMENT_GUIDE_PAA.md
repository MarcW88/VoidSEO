# 🚀 PAA Explorer - Guide de Déploiement Complet

> Déploiement de PAA Explorer : de MVP à Production avec accessibilité complète

## 📋 Vue d'ensemble

PAA Explorer est maintenant prêt pour le déploiement ! Voici l'architecture complète :

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Backend   │    │   Database      │
│   Next.js       │◄──►│   FastAPI       │◄──►│   PostgreSQL    │
│   (Vercel)      │    │   (Railway)     │    │   (Supabase)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/Assets    │    │   Job Queue     │    │   File Storage  │
│   (Vercel)      │    │   Redis         │    │   S3/Supabase   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 Étapes de Déploiement

### 1. **Préparation de l'environnement**

#### Variables d'environnement requises :

**API (.env)**:
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/paa_explorer
REDIS_URL=redis://host:6379/0

# External APIs
OPENAI_API_KEY=sk-...
GOOGLE_SHEETS_CREDENTIALS_PATH=./credentials/google-sheets.json

# Security
SECRET_KEY=your-super-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key

# Features
ENABLE_LIVE_SCRAPING=true
ENABLE_EXPORTS=true
MAX_QUESTIONS_PER_KEYWORD=10

# Monitoring
SENTRY_DSN=https://...
```

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 2. **Déploiement Base de Données (Supabase)**

1. **Créer un projet Supabase** :
```bash
# Via Supabase CLI
supabase init
supabase start
supabase db push
```

2. **Exécuter le schéma** :
```sql
-- Copier le contenu de api/database/schema.sql
-- L'exécuter dans l'éditeur SQL Supabase
```

3. **Configurer RLS** :
```sql
-- Les politiques RLS sont déjà dans le schéma
-- Vérifier que l'authentification est activée
```

### 3. **Déploiement API (Railway/Render)**

#### Option A : Railway (Recommandé)

1. **Connecter le repository** :
```bash
railway login
railway link
```

2. **Configurer les variables** :
```bash
railway variables set DATABASE_URL=postgresql://...
railway variables set OPENAI_API_KEY=sk-...
railway variables set SECRET_KEY=your-secret
```

3. **Déployer** :
```bash
railway up
```

#### Option B : Render

1. **Créer un Web Service** sur render.com
2. **Connecter le repository** GitHub
3. **Configurer** :
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Root Directory: `api`

### 4. **Déploiement Frontend (Vercel)**

1. **Connecter le repository** :
```bash
vercel --prod
```

2. **Configurer les variables** dans le dashboard Vercel :
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Configurer le build** :
   - Framework: Next.js
   - Root Directory: `apps/paa-explorer`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 5. **Configuration Redis (Upstash)**

1. **Créer une base Redis** sur upstash.com
2. **Récupérer l'URL** de connexion
3. **Ajouter** `REDIS_URL` aux variables d'environnement API

## 🔧 Configuration Avancée

### Authentification (Supabase Auth)

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Rate Limiting

```python
# api/middleware/rate_limit.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/jobs")
@limiter.limit("10/minute")
async def create_job(request: Request, ...):
    # Job creation logic
```

### Monitoring (Sentry)

```python
# api/main.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    integrations=[FastApiIntegration()],
    traces_sample_rate=1.0,
)
```

## ♿ Accessibilité (WCAG 2.1 AA)

### Tests d'accessibilité automatisés :

```bash
# Installation
npm install -D @axe-core/playwright

# Tests
npm run test:a11y
```

### Checklist d'accessibilité :

- ✅ **Contraste** : Ratio 4.5:1 minimum
- ✅ **Navigation clavier** : Tous les éléments accessibles
- ✅ **Screen readers** : ARIA labels et descriptions
- ✅ **Focus management** : Indicateurs visibles
- ✅ **Formulaires** : Labels associés
- ✅ **Images** : Textes alternatifs
- ✅ **Animations** : Respect de `prefers-reduced-motion`

### Configuration Lighthouse CI :

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Audit URLs using Lighthouse
        uses: treosh/lighthouse-ci-action@v9
        with:
          configPath: './lighthouserc.json'
```

## 🌐 Mise en Production

### 1. **Domaine personnalisé**

```bash
# Vercel
vercel domains add paa-explorer.voidseo.dev

# Railway
railway domain paa-api.voidseo.dev
```

### 2. **SSL/TLS**

- **Vercel** : SSL automatique
- **Railway** : SSL automatique
- **Supabase** : SSL par défaut

### 3. **CDN et Cache**

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=300' },
        ],
      },
    ]
  },
}
```

### 4. **Monitoring Production**

```python
# api/monitoring.py
from prometheus_client import Counter, Histogram, generate_latest

REQUEST_COUNT = Counter('requests_total', 'Total requests', ['method', 'endpoint'])
REQUEST_LATENCY = Histogram('request_duration_seconds', 'Request latency')

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    REQUEST_LATENCY.observe(process_time)
    return response
```

## 🚀 Déploiement en Un Clic

### Script de déploiement automatisé :

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Déploiement PAA Explorer..."

# 1. Build et test
echo "📦 Build et tests..."
cd apps/paa-explorer
npm run build
npm run test

# 2. Déploiement API
echo "🔧 Déploiement API..."
cd ../../api
railway up

# 3. Déploiement Frontend
echo "🌐 Déploiement Frontend..."
cd ../apps/paa-explorer
vercel --prod

# 4. Tests post-déploiement
echo "✅ Tests post-déploiement..."
curl -f https://paa-api.voidseo.dev/health
curl -f https://paa-explorer.voidseo.dev

echo "🎉 Déploiement terminé !"
```

## 📊 Métriques et Monitoring

### Dashboard Grafana :

```yaml
# grafana/dashboard.json
{
  "dashboard": {
    "title": "PAA Explorer Metrics",
    "panels": [
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, request_duration_seconds_bucket)"
          }
        ]
      },
      {
        "title": "Job Success Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(jobs_completed_total[5m]) / rate(jobs_total[5m])"
          }
        ]
      }
    ]
  }
}
```

### Alertes :

```yaml
# alerts.yml
groups:
  - name: paa-explorer
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        annotations:
          summary: "High error rate detected"
      
      - alert: DatabaseDown
        expr: up{job="postgres"} == 0
        for: 1m
        annotations:
          summary: "Database is down"
```

## 🔐 Sécurité

### 1. **API Security**

```python
# api/security.py
from fastapi.security import HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://paa-explorer.voidseo.dev"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Trusted hosts
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["paa-api.voidseo.dev"]
)
```

### 2. **Rate Limiting**

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/jobs")
@limiter.limit("10/minute")
async def create_job(...):
    pass
```

### 3. **Input Validation**

```python
from pydantic import BaseModel, validator

class JobRequest(BaseModel):
    keywords: List[str]
    
    @validator('keywords')
    def validate_keywords(cls, v):
        if len(v) > 10:
            raise ValueError('Maximum 10 keywords allowed')
        return v
```

## 📈 Scaling

### Horizontal Scaling :

```yaml
# railway.toml
[build]
builder = "DOCKERFILE"

[deploy]
replicas = 3
healthcheckPath = "/health"
healthcheckTimeout = 30
```

### Database Scaling :

```sql
-- Partitioning par date
CREATE TABLE jobs_2024 PARTITION OF jobs
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Index pour performance
CREATE INDEX CONCURRENTLY idx_jobs_user_created 
ON jobs(user_id, created_at DESC);
```

## 🎉 Résultat Final

Une fois déployé, PAA Explorer sera accessible via :

- **Demo** : `https://paa-explorer.voidseo.dev` (mode démo gratuit)
- **Builder** : `https://paa-explorer.voidseo.dev` (avec authentification)
- **API** : `https://paa-api.voidseo.dev/docs` (documentation Swagger)
- **Status** : `https://status.voidseo.dev` (page de statut)

### Fonctionnalités disponibles :

✅ **Mode Démo** : Dataset statique "SEO Tools"  
✅ **Mode Builder** : Scraping live + clustering  
✅ **Exports** : CSV, JSON, Google Sheets  
✅ **API** : Accès programmatique  
✅ **Monitoring** : Métriques temps réel  
✅ **Accessibilité** : WCAG 2.1 AA  
✅ **Performance** : Lighthouse 90+  

**PAA Explorer est maintenant prêt pour la production ! 🚀**
