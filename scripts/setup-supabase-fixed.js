#!/usr/bin/env node

// Script d'automatisation complète du setup Supabase
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 VoidSEO - Setup Supabase Automatique\n');

// Étape 1: Vérifier les prérequis
function checkPrerequisites() {
  console.log('📋 Vérification des prérequis...');
  
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Node.js: ${nodeVersion}`);
    
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✅ npm: ${npmVersion}`);
    
  } catch (error) {
    console.error('❌ Prérequis manquants:', error.message);
    process.exit(1);
  }
}

// Étape 2: Installer les dépendances
function installDependencies() {
  console.log('\n📦 Installation des dépendances...');
  
  try {
    execSync('npm install @supabase/supabase-js @supabase/auth-helpers-nextjs next react react-dom lru-cache dotenv', 
      { stdio: 'inherit' });
    console.log('✅ Dépendances installées');
  } catch (error) {
    console.error('❌ Erreur installation:', error.message);
    process.exit(1);
  }
}

// Étape 3: Créer la configuration d'environnement
function createEnvConfig() {
  console.log('\n🔧 Création de la configuration...');
  
  const jwtSecret = require('crypto').randomBytes(64).toString('hex');
  
  const envContent = `# Supabase Configuration
# ⚠️  REMPLACER CES VALEURS PAR VOS VRAIES CLÉS SUPABASE
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Security
JWT_SECRET=${jwtSecret}
ADMIN_IP_ALLOWLIST=127.0.0.1

# Environment
NODE_ENV=development
`;

  fs.writeFileSync('.env.local', envContent);
  console.log('✅ Fichier .env.local créé');
  console.log('⚠️  IMPORTANT: Vous devez remplacer les valeurs avec vos vraies clés Supabase');
}

// Étape 4: Mettre à jour package.json
function updatePackageJson() {
  console.log('\n📦 Mise à jour package.json...');
  
  const packageJsonPath = 'package.json';
  let packageJson;
  
  try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  } catch (error) {
    packageJson = {
      name: 'voidseo-secure',
      version: '1.0.0',
      description: 'VoidSEO Free Tier with secure authentication'
    };
  }
  
  packageJson.scripts = {
    ...packageJson.scripts,
    'dev': 'next dev',
    'build': 'next build',
    'start': 'next start'
  };
  
  packageJson.dependencies = {
    ...packageJson.dependencies,
    '@supabase/supabase-js': '^2.38.0',
    '@supabase/auth-helpers-nextjs': '^0.8.7',
    'next': '^14.0.0',
    'react': '^18.2.0',
    'react-dom': '^18.2.0',
    'lru-cache': '^10.0.0',
    'dotenv': '^16.3.1'
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json mis à jour');
}

// Fonction principale
async function main() {
  try {
    if (!fs.existsSync('scripts')) {
      fs.mkdirSync('scripts');
    }
    
    checkPrerequisites();
    installDependencies();
    createEnvConfig();
    updatePackageJson();
    
    console.log('\n🎉 Setup automatique terminé !');
    console.log('\n📋 Prochaines étapes :');
    console.log('1. Créer un projet Supabase sur https://supabase.com');
    console.log('2. Configurer .env.local avec vos clés');
    console.log('3. Exécuter le schema SQL dans Supabase');
    console.log('4. Lancer: npm run dev');
    
  } catch (error) {
    console.error('❌ Erreur setup:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
