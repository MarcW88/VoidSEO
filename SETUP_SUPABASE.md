# 🔧 Configuration Supabase - Étapes Exactes

## 📝 **Étape 1 : Créer le Projet Supabase**

### **1.1 Inscription**
```
1. Aller sur https://supabase.com
2. Cliquer "Start your project"
3. Se connecter avec GitHub (recommandé)
4. Créer une nouvelle organisation si demandé
```

### **1.2 Nouveau Projet**
```
1. Cliquer "New Project"
2. Nom: "voidseo-production"
3. Database Password: NOTER LE MOT DE PASSE !
4. Région: Europe West (Ireland) - pour RGPD
5. Plan: Free (suffisant pour commencer)
6. Cliquer "Create new project"
```

### **1.3 Attendre la Création**
```
⏳ Attendre 2-3 minutes que le projet soit prêt
✅ Vous verrez "Project is ready"
```

## 🔑 **Étape 2 : Récupérer les Clés**

### **2.1 API Keys**
```
1. Aller dans Settings → API
2. Noter ces 3 valeurs :

Project URL: https://xxxxxxxxx.supabase.co
anon public key: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
service_role key: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### **2.2 Créer .env.local**
```bash
# Dans /Users/marc/Desktop/VOIDSEO/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
JWT_SECRET=votre-secret-ultra-long-minimum-32-caracteres
```

## 🗄️ **Étape 3 : Créer la Base de Données**

### **3.1 SQL Editor**
```
1. Dans Supabase Dashboard → SQL Editor
2. Cliquer "New query"
3. Copier TOUT le contenu de supabase/schema.sql
4. Coller dans l'éditeur
5. Cliquer "Run" (en bas à droite)
```

### **3.2 Vérifier la Création**
```
1. Aller dans Table Editor
2. Vous devriez voir :
   - profiles
   - api_usage
   - download_logs
   - admin_logs
```

## 🔐 **Étape 4 : Configurer l'Auth**

### **4.1 Email Settings**
```
1. Authentication → Settings
2. Enable email confirmations: OFF (pour les tests)
3. Enable secure email change: ON
4. Session timeout: 24 hours
```

### **4.2 Site URL**
```
1. Authentication → URL Configuration
2. Site URL: http://localhost:3000 (pour dev)
3. Redirect URLs: 
   - http://localhost:3000/dashboard/free.html
   - https://votre-site.vercel.app/dashboard/free.html
```

## 📁 **Étape 5 : Storage pour Téléchargements**

### **5.1 Créer Bucket**
```
1. Storage → Create bucket
2. Name: "downloads"
3. Public: OFF (privé)
4. Cliquer "Create bucket"
```

### **5.2 Upload Fichiers Test**
```
1. Cliquer sur bucket "downloads"
2. Upload quelques fichiers PDF test
3. Nommer: void-loop-guide.pdf, templates-pack.zip
```

## 🧪 **Étape 6 : Test Initial**

### **6.1 Test Base de Données**
```sql
-- Dans SQL Editor, tester :
SELECT * FROM profiles;
-- Doit retourner une table vide (normal)
```

### **6.2 Test Auth**
```sql
-- Tester la fonction de création d'utilisateur
SELECT auth.users();
-- Doit retourner une table vide (normal)
```

## ✅ **Étape 7 : Créer Votre Compte Admin**

### **7.1 Premier Signup**
```
1. Aller sur http://localhost:3000/signup/
2. S'inscrire avec VOTRE email
3. Mot de passe fort (8+ caractères)
4. Cocher newsletter si souhaité
```

### **7.2 Promouvoir en Admin**
```sql
-- Dans Supabase SQL Editor :
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'votre-email@example.com';
```

### **7.3 Vérifier**
```sql
-- Vérifier votre rôle :
SELECT email, role FROM profiles WHERE email = 'votre-email@example.com';
-- Doit retourner : votre-email@example.com | admin
```

## 🚀 **Étape 8 : Test Complet**

### **8.1 Test Login**
```
1. Aller sur http://localhost:3000/login/
2. Se connecter avec vos identifiants
3. Doit rediriger vers /dashboard/free.html
```

### **8.2 Test Admin**
```
1. Aller sur http://localhost:3000/admin/
2. Doit afficher le dashboard admin
3. Voir vos stats et votre compte
```

### **8.3 Test API**
```bash
# Test dans le navigateur (F12 Console) :
fetch('/api/admin/stats')
  .then(r => r.json())
  .then(console.log)
# Doit retourner les stats admin
```

## 🔧 **Dépannage**

### **Problème : "Invalid API key"**
```
- Vérifier .env.local
- Redémarrer le serveur : npm run dev
- Vérifier que les clés sont correctes dans Supabase
```

### **Problème : "Table doesn't exist"**
```
- Re-exécuter supabase/schema.sql
- Vérifier dans Table Editor que les tables existent
```

### **Problème : "Access denied"**
```
- Vérifier que votre email est bien en role 'admin'
- Vérifier la policy RLS dans Supabase
```

## ✅ **Checklist Final**

- [ ] Projet Supabase créé
- [ ] Clés API récupérées
- [ ] .env.local configuré
- [ ] Schema SQL exécuté
- [ ] Tables créées (profiles, api_usage, etc.)
- [ ] Auth configuré
- [ ] Storage bucket créé
- [ ] Premier compte créé
- [ ] Compte promu admin
- [ ] Login fonctionne
- [ ] Dashboard admin accessible

**Une fois ces étapes terminées, tout fonctionnera parfaitement ! 🎉**
