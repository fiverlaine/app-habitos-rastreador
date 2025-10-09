# 🚀 Guia de Deploy na Vercel

## 📋 Passo a Passo Completo

### 1. 📤 Subir para o GitHub

#### Opção A: Via GitHub Desktop (Mais Fácil)
1. **Abra o GitHub Desktop**
2. **File → Add Local Repository**
3. **Selecione** a pasta "App Habitos"
4. **Publish repository** (marque "Keep this code private" se quiser)
5. **Nome**: `app-habitos` ou `meu-app-habitos`
6. **Clique em "Publish Repository"**

#### Opção B: Via Git Command Line
```bash
# Adicionar remote (substitua SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/app-habitos.git

# Fazer push
git push -u origin master
```

### 2. 🌐 Deploy na Vercel

#### Passo 1: Criar conta
1. **Acesse** [vercel.com](https://vercel.com)
2. **Clique em "Sign up"**
3. **Escolha "Continue with GitHub"**
4. **Autorize** a conexão

#### Passo 2: Importar projeto
1. **Clique em "New Project"**
2. **Import Git Repository**
3. **Selecione** seu repositório `app-habitos`
4. **Clique em "Import"**

#### Passo 3: Configurar projeto
1. **Project Name**: `app-habitos` (ou o nome que preferir)
2. **Framework Preset**: Vite (deve detectar automaticamente)
3. **Root Directory**: `./` (padrão)
4. **Build Command**: `npm run build` (deve aparecer automaticamente)
5. **Output Directory**: `dist` (deve aparecer automaticamente)

#### Passo 4: Variáveis de Ambiente
1. **Clique em "Environment Variables"**
2. **Adicione as variáveis**:
   ```
   VITE_SUPABASE_URL = https://jiohwtmymnizvwzyvdef.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppb2h3dG15bW5penZ3enl2ZGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NzA4MDksImV4cCI6MjA3NTQ0NjgwOX0.FnJcz-aainn_Yc1wjWww8_8seFa3eKKXrtyG6NilBdo
   ```

#### Passo 5: Deploy
1. **Clique em "Deploy"**
2. **Aguarde** o build (2-3 minutos)
3. **Seu app estará online!** 🎉

### 3. 📱 Acessar no iPhone

1. **Abra o Safari** no iPhone
2. **Digite a URL** que a Vercel forneceu (ex: `https://app-habitos.vercel.app`)
3. **Faça login/cadastro**
4. **Toque no botão compartilhar** (📤)
5. **"Adicionar à Tela Inicial"**
6. **Confirme** a instalação

### 4. 🔄 Atualizações Automáticas

- **A cada push** no GitHub, a Vercel faz deploy automático
- **URL permanente** que nunca muda
- **HTTPS gratuito** incluído
- **CDN global** para velocidade

## 🎯 URLs Importantes

Após o deploy, você terá:
- **URL de produção**: `https://seu-app.vercel.app`
- **Dashboard Vercel**: Para gerenciar o projeto
- **GitHub**: Para código e histórico

## 🔧 Configurações Avançadas

### Domínio Personalizado (Opcional)
1. **No dashboard Vercel**
2. **Settings → Domains**
3. **Add Domain**
4. **Configure DNS** do seu provedor

### Variáveis de Ambiente por Ambiente
- **Production**: Variáveis de produção
- **Preview**: Para branches de teste
- **Development**: Para desenvolvimento local

## 🚨 Solução de Problemas

### ❌ Build falha
- **Verifique** se todas as dependências estão no `package.json`
- **Confirme** se as variáveis de ambiente estão configuradas
- **Veja os logs** na aba "Functions" do dashboard

### ❌ App não carrega
- **Verifique** se as variáveis do Supabase estão corretas
- **Confirme** se o banco está acessível
- **Teste** localmente primeiro

### ❌ PWA não instala
- **Verifique** se está usando Safari
- **Confirme** se o manifest.json está acessível
- **Teste** a URL diretamente: `https://seu-app.vercel.app/manifest.json`

## 📞 Suporte

Se tiver problemas:
1. **Verifique** os logs na Vercel
2. **Teste** localmente primeiro
3. **Confirme** as variáveis de ambiente
4. **Veja** a documentação da Vercel

---

**🎉 Parabéns! Seu app de hábitos está online e pode ser instalado no iPhone!**
