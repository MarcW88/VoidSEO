# 🚀 Déploiement Mono-Repo VoidSEO

## 🎯 **Architecture Finale**

```
voidseo.dev/
├── index.html                    # Site principal
├── apps/paa-explorer/           # Page marketing PAA
├── apps/paa-explorer-app/       # App fonctionnelle PAA
├── dashboard/                   # Dashboard utilisateur
├── netlify/functions/           # API serverless
└── netlify.toml                # Config déploiement
```

## 🔗 **URLs Finales**

- **Site principal** : `voidseo.dev`
- **Page marketing PAA** : `voidseo.dev/apps/paa-explorer/`
- **App fonctionnelle PAA** : `voidseo.dev/app/paa-explorer`
- **API** : `voidseo.dev/api/jobs`

## 🚀 **Déploiement sur Netlify**

### **1. Connecter le Repo Existant**
1. Va sur **netlify.com**
2. **"New site from Git"**
3. Connecte ton repo GitHub VoidSEO existant
4. **Build settings** :
   - Build command : `echo "Building VoidSEO..."`
   - Publish directory : `.` (racine)
   - Functions directory : `netlify/functions`

### **2. Variables d'Environnement**
Dans Netlify → Site settings → Environment variables :
```
OPENAI_API_KEY = ta-clé-openai-ici
```

### **3. Domaine Custom**
Dans Netlify → Domain settings :
- Ajouter ton domaine : `voidseo.dev`
- Configurer DNS selon les instructions Netlify

## ✅ **Avantages de cette Architecture**

1. **Un seul déploiement** : Site + apps ensemble
2. **URLs cohérentes** : Tout sous voidseo.dev
3. **Gestion simplifiée** : Un seul repo à maintenir
4. **SEO optimisé** : Pas de sous-domaines externes
5. **Coût réduit** : Un seul plan Netlify

## 🔄 **Workflow de Développement**

```bash
# Modifier le site ou les apps
git add .
git commit -m "Update site/apps"
git push

# Netlify redéploie automatiquement
# Site ET apps mis à jour ensemble
```

## 📊 **Structure des Apps**

Pour ajouter de nouvelles apps :
```
apps/
├── paa-explorer/           # Page marketing
├── paa-explorer-app/       # App fonctionnelle
├── ai-detector/           # Nouvelle page marketing
├── ai-detector-app/       # Nouvelle app fonctionnelle
└── keyword-clusterer-app/ # Autre app
```

## 🎯 **Prochaines Étapes**

1. **Commit les changements** dans ton repo VoidSEO
2. **Connecter à Netlify** 
3. **Configurer la clé OpenAI**
4. **Tester** : `voidseo.dev/app/paa-explorer`

**Prêt à committer et déployer ?** 🚀
