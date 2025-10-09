# 🔧 Correção da Tela Azul

## ❌ Problema Identificado

A tela azul aparece porque as **variáveis de ambiente do Supabase não estão configuradas**.

## ✅ Solução

### 1. Criar arquivo de configuração

Crie um arquivo chamado `.env.local` na **raiz do projeto** (mesmo nível do `package.json`) com o seguinte conteúdo:

```env
VITE_SUPABASE_URL=https://jiohwtmymnizvwzyvdef.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppb2h3dG15bW5penZ3enl2ZGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NzA4MDksImV4cCI6MjA3NTQ0NjgwOX0.FnJcz-aainn_Yc1wjWww8_8seFa3eKKXrtyG6NilBdo
```

### 2. Estrutura do projeto

```
App Habitos/
├── .env.local          ← CRIAR ESTE ARQUIVO
├── package.json
├── App.tsx
├── components/
├── hooks/
└── ...
```

### 3. Reiniciar o servidor

Após criar o arquivo `.env.local`:

1. **Pare o servidor** (Ctrl+C)
2. **Reinicie** com `npm run dev`
3. **Recarregue a página** no navegador

## 🐛 Debug Implementado

Adicionei um sistema de debug que mostra:
- ✅ Se as variáveis estão configuradas
- ❌ Mensagens de erro específicas
- 📋 Instruções de correção

## 🎯 Resultado Esperado

Após seguir os passos acima:
- ✅ Tela de login/cadastro aparece
- ✅ Não mais tela azul
- ✅ Sistema de debug mostra "✅ Configurado"

## 🔍 Verificação

Se ainda houver problemas:
1. Verifique se o arquivo `.env.local` está na raiz
2. Verifique se as variáveis estão corretas (sem espaços extras)
3. Verifique o console do navegador para erros
4. Reinicie o servidor de desenvolvimento
