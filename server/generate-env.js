#!/usr/bin/env node
// ========================================
// SCRIPT PARA GERAR ARQUIVO .env
// ========================================
// Este script ajuda a configurar o backend rapidamente

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function generateEnv() {
  console.log('\n🔧 Configuração do Backend de Push Notifications\n');
  console.log('Este script vai te ajudar a criar o arquivo .env\n');
  
  // Verificar se web-push está instalado
  try {
    require.resolve('web-push');
  } catch (e) {
    console.log('📦 Instalando web-push...');
    execSync('npm install', { stdio: 'inherit' });
  }

  // Gerar chaves VAPID
  console.log('🔑 Gerando chaves VAPID...\n');
  const webpush = require('web-push');
  const vapidKeys = webpush.generateVAPIDKeys();
  
  console.log('✅ Chaves VAPID geradas!\n');
  console.log('📋 Guarde estas chaves em um local seguro:\n');
  console.log('Public Key:', vapidKeys.publicKey);
  console.log('Private Key:', vapidKeys.privateKey);
  console.log('\n');

  // Perguntar configurações
  const port = await question('Porta do servidor (padrão: 5000): ') || '5000';
  const frontendUrl = await question('URL do frontend (padrão: http://localhost:5173): ') || 'http://localhost:5173';
  
  console.log('\n📝 Agora você precisa das credenciais do Supabase:');
  console.log('Acesse: https://supabase.com/dashboard/project/jiohwtmymnizvwzyvdef/settings/api\n');
  
  const supabaseUrl = await question('SUPABASE_URL: ') || 'https://jiohwtmymnizvwzyvdef.supabase.co';
  const supabaseServiceKey = await question('SUPABASE_SERVICE_ROLE_KEY: ');
  
  const vapidSubject = await question('VAPID Subject (ex: mailto:seu-email@exemplo.com): ');
  
  // Gerar secret aleatório
  const cronSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  console.log('\n🔐 Secret gerado automaticamente para cron job');

  // Criar conteúdo do .env
  const envContent = `# ========================================
# CONFIGURAÇÃO DO SERVIDOR DE PUSH NOTIFICATIONS
# ========================================
# Gerado automaticamente em ${new Date().toLocaleString()}

# Porta do servidor
PORT=${port}

# URL do frontend (para CORS)
FRONTEND_URL=${frontendUrl}

# ========================================
# SUPABASE
# ========================================
SUPABASE_URL=${supabaseUrl}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}

# ========================================
# VAPID (Web Push)
# ========================================
VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
VAPID_PRIVATE_KEY=${vapidKeys.privateKey}
VAPID_SUBJECT=${vapidSubject}

# ========================================
# SEGURANÇA
# ========================================
CRON_SECRET=${cronSecret}
`;

  // Salvar arquivo .env
  const envPath = path.join(__dirname, '.env');
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ Arquivo .env criado com sucesso!\n');
  console.log('📁 Localização:', envPath);
  console.log('\n📋 PRÓXIMOS PASSOS:\n');
  console.log('1. Revise o arquivo .env criado');
  console.log('2. Inicie o servidor: npm start');
  console.log('3. Configure o frontend (.env.local na raiz do projeto)');
  console.log('4. Configure a Edge Function no Supabase\n');
  console.log('🔐 IMPORTANTE: Guarde o CRON_SECRET para configurar a Edge Function:');
  console.log('   ' + cronSecret + '\n');
  
  rl.close();
}

generateEnv().catch(error => {
  console.error('❌ Erro:', error);
  rl.close();
  process.exit(1);
});

