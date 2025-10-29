# 📱 App de Hábitos - PWA Completo

Um aplicativo moderno e intuitivo para rastrear hábitos diários, construído com React, TypeScript, Supabase e configurado como PWA instalável no iPhone.

## ✨ Características

- 🎯 **Interface Intuitiva**: Design moderno e responsivo
- 📊 **Visualizações**: Gráficos e estatísticas de progresso
- 🏆 **Sistema de Conquistas**: Gamificação para manter a motivação
- 📅 **Visualização por Semana**: Acompanhe seu progresso semanal
- 🎨 **Personalização**: Escolha ícones e cores para seus hábitos
- 📱 **PWA**: Funciona offline e pode ser instalado como app no iPhone
- 🔔 **Notificações Push**: Lembretes programados para seus hábitos (mesmo com app fechado!)
- 🔐 **Autenticação**: Sistema completo de login/cadastro
- ☁️ **Backend**: Supabase com PostgreSQL

## 🚀 Tecnologias

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **PWA**: Service Worker + Manifest + iOS Meta Tags
- **Deploy**: Vercel

## 🎯 Funcionalidades

- ✅ Criação e gerenciamento de hábitos
- 📈 Acompanhamento de progresso
- 🏆 Sistema de conquistas
- 📊 Estatísticas detalhadas
- 📅 Visualização por calendário
- 🎨 Personalização de aparência
- 🔔 Notificações push programáveis com Web Push API
- 🔐 Autenticação segura
- 📱 Instalação como app nativo no iPhone

## 🚀 Deploy Rápido

### Opção 1: Vercel (Recomendado)
1. Faça fork deste repositório
2. Acesse [vercel.com](https://vercel.com)
3. Conecte sua conta GitHub
4. Importe este projeto
5. Configure as variáveis de ambiente do Supabase
6. Deploy automático!

### Opção 2: Local
```bash
git clone https://github.com/SEU_USUARIO/app-habitos.git
cd app-habitos
npm install
npm run dev
```

## 📱 Instalação no iPhone

1. Acesse o app no Safari
2. Toque no botão compartilhar (📤)
3. "Adicionar à Tela Inicial"
4. Confirme a instalação
5. Use como app nativo!

## 🔧 Configuração

### Variáveis de Ambiente
Crie um arquivo `.env.local`:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### Supabase Setup
1. Crie um projeto no [supabase.com](https://supabase.com)
2. Execute as migrações do banco
3. Configure as políticas RLS
4. Atualize as variáveis de ambiente

## 📖 Documentação

- 🔔 **[Configurar Notificações Push](SETUP_PUSH_NOTIFICACOES.md)** ← NOVO!
- 📱 [Guia de Instalação iOS](GUIA_INSTALACAO_iOS.md)
- ☁️ [Integração Supabase](documentation/INTEGRACAO_SUPABASE.md)
- 🛠️ [Guia Técnico](documentation/GUIA_TECNICO.md)
- 🔔 [Documentação Completa de Push](documentation/PUSH_NOTIFICATIONS_COMPLETE.md)

## 🎨 Screenshots

- Interface moderna e intuitiva
- Visualizações de progresso
- Sistema de conquistas
- PWA instalável

## 📄 Licença

MIT - Use livremente para projetos pessoais e comerciais

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir melhorias
- Enviar pull requests

---

**🎉 Transforme sua vida com hábitos melhores!**