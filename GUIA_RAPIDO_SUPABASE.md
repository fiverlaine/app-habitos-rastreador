# 🚀 Guia Rápido - Começar a Usar

## ⚡ 3 Passos para Começar

### 1️⃣ Instalar Dependências
```bash
npm install
```

### 2️⃣ Iniciar o App
```bash
npm run dev
```

### 3️⃣ Criar Conta
1. Abra http://localhost:3000
2. Clique em **"Não tem conta? Crie uma agora"**
3. Preencha:
   - Nome completo
   - Email
   - Senha (mínimo 6 caracteres)
4. Clique em **"🚀 Criar Conta"**
5. **Pronto!** Comece a criar seus hábitos! 🎉

---

## 📱 Como Usar o App

### Criar Hábito
1. Clique no botão **"+"** (centro da navegação)
2. Escolha um template OU crie personalizado
3. Configure e salve

### Completar Hábito
- **Boolean**: Toque no ✓
- **Numérico**: Clique em "Adicionar" e digite o valor

### Ver Perfil
- Clique no círculo com sua inicial (canto superior direito)
- Veja suas informações
- Sair da conta

---

## 🎯 Recursos Principais

### ✅ Já Funciona
- Autenticação completa
- Sincronização na nuvem
- Multi-dispositivo
- Dados seguros (RLS)
- Backup automático

### 📊 Recursos do App
- Hábitos booleanos e numéricos
- 14 unidades de medida
- Visualização semanal
- Estatísticas detalhadas
- Sistema de conquistas
- Sequências (streaks)

---

## 🔑 Credenciais Supabase

As credenciais já estão configuradas em `.env.local`:

```env
VITE_SUPABASE_URL=https://jiohwtmymnizvwzyvdef.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Projeto**: Habitos  
**Região**: South America (São Paulo)  
**Status**: ✅ Ativo

---

## 🐛 Problemas Comuns

### Erro: "Faltam variáveis de ambiente"
**Solução**: Certifique-se de que o arquivo `.env.local` existe

### Não consigo criar conta
**Solução**: 
- Verifique se a senha tem pelo menos 6 caracteres
- Verifique sua conexão com internet
- Tente outro email

### Dados não aparecem
**Solução**:
- Faça logout e login novamente
- Limpe o cache do navegador
- Verifique o console para erros

---

## 📚 Documentação Completa

Para mais detalhes, consulte:
- [`documentation/INTEGRACAO_SUPABASE.md`](./documentation/INTEGRACAO_SUPABASE.md) - Guia completo
- [`documentation/README.md`](./documentation/README.md) - Documentação geral
- [`documentation/GUIA_TECNICO.md`](./documentation/GUIA_TECNICO.md) - Guia técnico

---

## 🎉 Pronto!

Agora você está pronto para começar a rastrear seus hábitos! 🚀

**Desenvolvido com ❤️ usando Supabase + React + TypeScript**

