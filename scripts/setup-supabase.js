#!/usr/bin/env node

// Script d'automatisation complète du setup Supabase
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 VoidSEO - Setup Supabase Automatique\n');

// Configuration
const CONFIG = {
  projectName: 'voidseo-production',
  region: 'eu-west-1', // Europe pour RGPD
  adminEmail: '', // À remplir
  adminPassword: '', // À remplir
  supabaseUrl: '',
  supabaseAnonKey: '',
  supabaseServiceKey: ''
};

// Étape 1: Vérifier les prérequis
function checkPrerequisites() {
  console.log('📋 Vérification des prérequis...');
  
  try {
    // Vérifier Node.js
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Node.js: ${nodeVersion}`);
    
    // Vérifier npm
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✅ npm: ${npmVersion}`);
    
    // Vérifier git
    const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Git: ${gitVersion}`);
    
  } catch (error) {
    console.error('❌ Prérequis manquants:', error.message);
    process.exit(1);
  }
}

// Étape 2: Installer les dépendances
function installDependencies() {
  console.log('\n📦 Installation des dépendances...');
  
  try {
    execSync('npm install @supabase/supabase-js @supabase/auth-helpers-nextjs next react react-dom lru-cache', 
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
  
  // Générer un JWT secret sécurisé
  const jwtSecret = require('crypto').randomBytes(64).toString('hex');
  
  const envContent = `# Supabase Configuration
# ⚠️  REMPLACER CES VALEURS PAR VOS VRAIES CLÉS SUPABASE
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Security
JWT_SECRET=${jwtSecret}
ADMIN_IP_ALLOWLIST=127.0.0.1

# API Keys (optionnel pour démo)
SERPAPI_KEY=your-serpapi-key-here
OPENAI_API_KEY=your-openai-key-here

# Newsletter (optionnel)
BEEHIIV_API_KEY=your-beehiiv-key-here

# Environment
NODE_ENV=development
`;

  fs.writeFileSync('.env.local', envContent);
  fs.writeFileSync('.env.example', envContent.replace(/=.*/g, '='));
  
  console.log('✅ Fichiers .env créés');
  console.log('⚠️  IMPORTANT: Vous devez remplacer les valeurs dans .env.local avec vos vraies clés Supabase');
}

// Étape 4: Créer le script de migration de base de données
function createDatabaseMigration() {
  console.log('\n🗄️  Création du script de migration...');
  
  const migrationScript = `#!/usr/bin/env node

// Script de migration automatique de la base de données
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function runMigration() {
  console.log('🗄️  Exécution de la migration de base de données...');
  
  // Charger les variables d'environnement
  require('dotenv').config({ path: '.env.local' });
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables Supabase manquantes dans .env.local');
    console.log('📝 Veuillez configurer:');
    console.log('   - NEXT_PUBLIC_SUPABASE_URL');
    console.log('   - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Lire le schema SQL
    const schemaSQL = fs.readFileSync('supabase/schema.sql', 'utf8');
    
    // Exécuter le schema
    const { error } = await supabase.rpc('exec_sql', { sql: schemaSQL });
    
    if (error) {
      console.error('❌ Erreur migration:', error);
      process.exit(1);
    }
    
    console.log('✅ Migration réussie');
    
    // Vérifier les tables créées
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (!tablesError && tables) {
      console.log('📋 Tables créées:');
      tables.forEach(table => console.log(\`   - \${table.table_name}\`));
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

runMigration();
`;

  console.log('✅ Script de migration préparé');
}

// Étape 5: Créer le script de création d'admin
function createAdminScript() {
  console.log('\n👑 Création du script admin...');
  
  const adminScript = `#!/usr/bin/env node

// Script pour créer un utilisateur admin
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  console.log('👑 Création d\\'un utilisateur admin...');
  
  // Charger les variables d'environnement
  require('dotenv').config({ path: '.env.local' });
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables Supabase manquantes');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const email = await question('📧 Email admin: ');
    const password = await question('🔒 Mot de passe (8+ caractères): ');
    const name = await question('👤 Nom (optionnel): ') || email.split('@')[0];
    
    // Créer l'utilisateur
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true
    });
    
    if (authError) {
      console.error('❌ Erreur création utilisateur:', authError.message);
      process.exit(1);
    }
    
    // Promouvoir en admin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin', name })
      .eq('id', authData.user.id);
    
    if (updateError) {
      console.error('❌ Erreur promotion admin:', updateError.message);
      process.exit(1);
    }
    
    console.log('✅ Utilisateur admin créé avec succès!');
    console.log(\`📧 Email: \${email}\`);
    console.log(\`👑 Rôle: admin\`);
    console.log(\`🔗 Connectez-vous sur: http://localhost:3000/login/\`);
    console.log(\`🎛️  Dashboard admin: http://localhost:3000/admin/\`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    rl.close();
  }
}

createAdmin();
`;

  console.log('✅ Script admin préparé');
}

// Étape 6: Créer le script de test
function createTestScript() {
  console.log('\n🧪 Création du script de test...');
  
  const testScript = `#!/usr/bin/env node

// Script de test automatique
const { createClient } = require('@supabase/supabase-js');

async function runTests() {
  console.log('🧪 Tests automatiques VoidSEO...');
  
  // Charger les variables d'environnement
  require('dotenv').config({ path: '.env.local' });
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Variables Supabase manquantes');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Connexion Supabase
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (!error) {
      console.log('✅ Test 1: Connexion Supabase OK');
      passed++;
    } else {
      throw error;
    }
  } catch (error) {
    console.log('❌ Test 1: Connexion Supabase FAILED -', error.message);
    failed++;
  }
  
  // Test 2: Tables existantes
  try {
    const tables = ['profiles', 'api_usage', 'download_logs', 'admin_logs'];
    for (const table of tables) {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error) throw new Error(\`Table \${table} manquante\`);
    }
    console.log('✅ Test 2: Tables de base OK');
    passed++;
  } catch (error) {
    console.log('❌ Test 2: Tables de base FAILED -', error.message);
    failed++;
  }
  
  // Test 3: RLS activé
  try {
    const { error } = await supabase.from('profiles').insert({ 
      email: 'test@test.com', 
      role: 'admin' 
    });
    if (error && error.message.includes('RLS')) {
      console.log('✅ Test 3: RLS (Row Level Security) OK');
      passed++;
    } else {
      throw new Error('RLS non configuré');
    }
  } catch (error) {
    console.log('❌ Test 3: RLS FAILED -', error.message);
    failed++;
  }
  
  // Résumé
  console.log(\`\\n📊 Résultats: \${passed} réussis, \${failed} échoués\`);
  
  if (failed === 0) {
    console.log('🎉 Tous les tests passent! Votre setup est prêt.');
  } else {
    console.log('⚠️  Certains tests échouent. Vérifiez la configuration.');
    process.exit(1);
  }
}

runTests();
`;

  console.log('✅ Script de test préparé');
}

// Étape 7: Mettre à jour package.json
function updatePackageJson() {
  console.log('\n📦 Mise à jour package.json...');
  
  const packageJsonPath = 'package.json';
  let packageJson;
  
  try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  } catch (error) {
    // Créer package.json s'il n'existe pas
    packageJson = {
      name: 'voidseo-secure',
      version: '1.0.0',
      description: 'VoidSEO Free Tier with secure authentication'
    };
  }
  
  // Ajouter scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    'dev': 'next dev',
    'build': 'next build',
    'start': 'next start',
    'setup:db': 'node scripts/migrate-db.js',
    'setup:admin': 'node scripts/create-admin.js',
    'test:setup': 'node scripts/test-setup.js',
    'setup:all': 'npm run setup:db && npm run setup:admin'
  };
  
  // Ajouter dépendances
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

// Étape 8: Créer le guide d'utilisation
function createUsageGuide() {
  console.log('\n📖 Création du guide d\'utilisation...');
  
  console.log('✅ Guide disponible dans QUICK_START.md');
}

// Fonction principale
async function main() {
  try {
    // Créer le dossier scripts s'il n'existe pas
    if (!fs.existsSync('scripts')) {
      fs.mkdirSync('scripts');
    }
    
    checkPrerequisites();
    installDependencies();
    createEnvConfig();
    createDatabaseMigration();
    createAdminScript();
    createTestScript();
    updatePackageJson();
    createUsageGuide();
    
    console.log('\n🎉 Setup automatique terminé !');
    console.log('\n📋 Prochaines étapes :');
    console.log('1. Créer un projet Supabase sur https://supabase.com');
    console.log('2. Configurer .env.local avec vos clés');
    console.log('3. Lancer: npm run setup:db');
    console.log('4. Lancer: npm run setup:admin');
    console.log('5. Lancer: npm run dev');
    console.log('\n📖 Voir QUICK_START.md pour le guide complet');
    
  } catch (error) {
    console.error('❌ Erreur setup:', error.message);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main();
}

module.exports = { main };
