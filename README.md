# VoidSEO - Secure Free Tier Platform

VoidSEO is a comprehensive SEO automation platform built around the VOID Loop methodology. It provides tools, templates, and frameworks to help SEO professionals and agencies automate their workflows and scale their operations.

## 🚀 Quick Start (Post-Setup)

### 1. Configuration Supabase
```bash
# 1. Créer un projet sur https://supabase.com
# 2. Récupérer vos clés API
# 3. Remplacer dans .env.local :
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
```

### 2. Initialiser la Base de Données
```bash
# Copier le contenu de supabase/schema.sql
# L'exécuter dans l'éditeur SQL de Supabase
```

### 3. Lancer le Site
```bash
npm run dev
# Aller sur http://localhost:3000
```

### 4. Créer Votre Compte Admin
```bash
# 1. S'inscrire sur /signup/
# 2. Dans Supabase SQL Editor :
UPDATE profiles SET role = 'admin' WHERE email = 'votre-email@example.com';
```

## 🔐 Sécurité Implémentée

- ✅ **Authentification Supabase** réelle
- ✅ **Protection des routes** par middleware
- ✅ **Rate limiting** sur les APIs
- ✅ **Headers de sécurité** (CSP, HSTS, etc.)
- ✅ **URLs signées** pour téléchargements
- ✅ **RLS (Row Level Security)**

## 📱 URLs Importantes

- **Site principal:** http://localhost:3000
- **Inscription:** http://localhost:3000/signup/
- **Connexion:** http://localhost:3000/login/
- **Dashboard client:** http://localhost:3000/dashboard/free.html
- **Dashboard admin:** http://localhost:3000/admin/

## Features

- **VOID Loop Framework**: A systematic approach to SEO automation
- **SEO Apps**: Collection of tools for keyword research, content optimization, and technical SEO
- **Secure Authentication**: Supabase-powered auth with role-based access
- **Admin Dashboard**: Complete user management and analytics
- **Templates & Guides**: Ready-to-use templates for common SEO tasks
- **Community**: Connect with other SEO professionals and share insights
- **Lab**: Experimental features and cutting-edge SEO techniques

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Lancer en développement
npm run build        # Build pour production
npm run start        # Lancer en production
```

## 🚀 Déploiement

### Vercel (Recommandé)
```bash
# 1. Pousser sur GitHub
git add .
git commit -m "Add secure authentication"
git push

# 2. Connecter Vercel à votre repo GitHub
# 3. Configurer les variables d'environnement
# 4. Déployer
```

## Documentation

- [Framework Documentation](docs/index.html)
- [App Guides](apps/)
- [Security Implementation](SECURITY_IMPLEMENTATION.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Security Checklist](SECURITY_CHECKLIST.md)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏗️ Project Structure

```
VOIDSEO/
├── index.html              # Homepage
├── css/
│   └── style.css           # Main stylesheet with dark theme
├── js/
│   └── main.js             # Interactive functionality
├── framework/
│   └── index.html          # VOID Loop methodology
├── apps/
│   ├── index.html          # Apps overview
│   ├── paa-explorer/       # PAA Explorer app page
│   ├── ai-overview-detector/
│   └── keyword-cluster/
├── lab/
│   └── index.html          # Research & experiments
├── docs/
│   └── index.html          # Documentation
├── about/
│   └── index.html          # About & philosophy
└── README.md               # This file
```

## 🎨 Design System

### Typography
- **Primary Font**: Space Mono (headings)
- **Body Font**: IBM Plex Mono
- **Monospace**: For code and technical content

### Colors
- **Background**: `#0a0a0a` (void-black)
- **Cards/Surfaces**: `#1a1a1a` (void-dark)
- **Text**: `#ffffff` (void-white)
- **Accent**: `#00ff99` (void-accent)
- **Muted Text**: `#666666` (void-light-gray)

### Components
- **Cards**: Elevated surfaces with hover effects
- **Buttons**: Primary (accent) and secondary (outline) variants
- **Callouts**: For checklists, warnings, and important info
- **Code Blocks**: Syntax-highlighted with line numbers
- **Timeline**: For chronological content

## 🚀 Features

### Interactive Elements
- **Smooth scrolling** navigation
- **Sticky navigation** on long pages
- **VOID Loop animation** - cycling through V→O→I→D
- **Fade-in animations** on scroll
- **Responsive design** for all devices

### Content Sections
- **Framework documentation** with detailed methodology
- **App showcase** with filtering and status badges
- **Research lab** with experiments and prototypes
- **About page** with philosophy and team info

## 🛠️ Development

### Local Development
1. Clone or download the project
2. Open `index.html` in a modern browser
3. For development, use a local server:
   ```bash
   # Python
   python -m http.server 8000
   
   # Node.js
   npx serve .
   
   # PHP
   php -S localhost:8000
   ```

### File Organization
- **HTML**: Semantic, accessible markup
- **CSS**: CSS custom properties, mobile-first responsive design
- **JavaScript**: Vanilla JS, no dependencies
- **Assets**: Optimized images and icons

## 📱 Responsive Design

The site is fully responsive with breakpoints at:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

Key responsive features:
- Collapsible navigation on mobile
- Flexible grid layouts
- Readable typography scaling
- Touch-friendly interactive elements

## 🎯 SEO Optimization

Built with SEO best practices:
- **Semantic HTML** structure
- **Meta tags** for social sharing
- **Structured data** markup
- **Fast loading** with optimized assets
- **Accessible** design following WCAG guidelines

## 📊 Performance

Optimized for speed and user experience:
- **Minimal JavaScript** - vanilla JS only
- **Efficient CSS** - custom properties and modern features
- **Optimized images** - WebP with fallbacks
- **Fast fonts** - system fonts with web font fallbacks

## 🤝 Contributing

This is the marketing site for VoidSEO. For contributing to our SEO tools and research:

1. Check out our [Apps repository](https://github.com/voidseo/apps)
2. Read our [Contributing Guidelines](https://github.com/voidseo/apps/blob/main/CONTRIBUTING.md)
3. Join our [Discord community](https://discord.gg/voidseo)

## 📄 License

The website code is open source under MIT License. Individual SEO tools may have different licenses - check each repository.

## 🔗 Links

- **Website**: [voidseo.dev](https://voidseo.dev)
- **GitHub**: [github.com/voidseo](https://github.com/voidseo)
- **Documentation**: [docs.voidseo.dev](https://docs.voidseo.dev)
- **Community**: [discord.gg/voidseo](https://discord.gg/voidseo)

---

Built with the VOID Loop framework. **Build smarter. Dive deeper.**
