# 📱 App de Hábitos

Aplicativo moderno e intuitivo para rastreamento de hábitos diários, desenvolvido com React, TypeScript e Vite. Suporta tanto hábitos simples (feito/não feito) quanto hábitos com metas quantificáveis (litros, páginas, km, etc).

## ✨ Funcionalidades

### 🎯 Sistema de Hábitos
- **Hábitos Booleanos**: Marque como feito/não feito
- **Hábitos Numéricos**: Defina metas com unidades de medida
  - 14 tipos de unidades: litros, páginas, km, minutos, calorias, etc.
  - Acompanhe progresso com barra visual
  - Suporte a valores decimais

### 📊 Visualizações
- **Dashboard**: Visão geral com gráfico semanal e cards de estatísticas
- **Estatísticas**: Gráficos detalhados e métricas de desempenho
- **Calendário**: Visualização mensal de conclusões
- **Conquistas**: Sistema de gamificação com badges

### 🏆 Gamificação
- Sistema de níveis baseado em pontos
- Conquistas desbloqueáveis
- Sequências (streaks) de dias consecutivos
- Notificações de novas conquistas

### 🎨 Interface
- Design moderno e minimalista
- Tema escuro otimizado
- Navegação inferior intuitiva
- Totalmente responsivo
- Cores e ícones personalizáveis

## 🚀 Como Usar

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd "App Habitos"
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o Supabase:
```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Edite .env.local com suas credenciais Supabase
# (As credenciais já estão configuradas por padrão)
```

4. Execute o projeto:
```bash
npm run dev
```

5. Abra o navegador em: `http://localhost:3000`

6. **Crie sua conta** para começar a usar! 🚀

### Build para Produção

```bash
npm run build
npm run preview
```

## 📖 Documentação

Documentação completa disponível em [`/documentation`](./documentation):
- [README.md](./documentation/README.md) - Documentação geral do projeto
- [CHANGELOG.md](./documentation/CHANGELOG.md) - Histórico de alterações
- [GUIA_TECNICO.md](./documentation/GUIA_TECNICO.md) - Guia técnico para desenvolvedores
- [INTEGRACAO_SUPABASE.md](./documentation/INTEGRACAO_SUPABASE.md) - **Guia de integração com Supabase** 🆕

## 🛠️ Tecnologias

- **React** 19.2.0 - Biblioteca UI
- **TypeScript** 5.8.2 - Tipagem estática
- **Vite** 6.2.0 - Build tool
- **Tailwind CSS** - Estilização
- **Recharts** - Gráficos
- **Supabase** - Backend as a Service 🆕
  - Autenticação de usuários
  - Banco de dados PostgreSQL
  - Row Level Security (RLS)
  - Sincronização em tempo real

## 📱 Funcionalidades Principais

### Criar Hábito
1. Clique no botão "+" central
2. Escolha o tipo (Boolean ou Numérico)
3. Configure nome, ícone e cor
4. Para numéricos: selecione unidade e meta
5. Comece a rastrear!

### Completar Hábitos
- **Boolean**: Toque no botão de check
- **Numérico**: Clique em "Adicionar" e insira o valor

### Acompanhar Progresso
- Visualize gráfico semanal no dashboard
- Confira estatísticas detalhadas
- Veja seu histórico no calendário
- Desbloqueie conquistas

## 🎨 Capturas de Tela

### Dashboard
- Gráfico semanal horizontal
- 4 cards de estatísticas (Concluído, Melhor Dia, Total, Sequência)
- Lista de hábitos com progresso

### Hábitos Numéricos
- Barra de progresso visual
- Display de valor/meta com unidade
- Input inline para adicionar valores

### Sistema de Conquistas
- Badges desbloqueáveis
- Notificações de novas conquistas
- Progresso visual

## 📝 Tipos de Unidades Suportadas

- **Líquidos**: litros, ml, copos
- **Leitura**: páginas
- **Distância**: km, metros
- **Tempo**: minutos, horas
- **Saúde**: calorias
- **Exercício**: repetições
- **Peso**: gramas, kg
- **Frequência**: vezes

## 🔄 Atualizações Recentes

### v3.0.0 - Integração Supabase 🎉
- ✅ **Autenticação de usuários** (sign up / sign in / sign out)
- ✅ **Banco de dados na nuvem** (PostgreSQL)
- ✅ **Multi-usuário** com dados isolados
- ✅ **Sincronização automática** de dados
- ✅ **Row Level Security** (RLS) para segurança
- ✅ **Backup automático** na nuvem
- ✅ **Perfil de usuário** com modal

### v2.0.0
- ✅ Sistema de hábitos numéricos com 14 unidades
- ✅ Redesign completo do dashboard
- ✅ Visualização semanal horizontal
- ✅ Cards de estatísticas resumidas
- ✅ Nova navegação com botão central
- ✅ Barra de progresso para hábitos numéricos
- ✅ Suporte a valores decimais
- ✅ Documentação completa

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests
- Melhorar a documentação

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## 👨‍💻 Desenvolvedor

Desenvolvido com ❤️ usando React + TypeScript

---

Para mais detalhes técnicos, consulte a [documentação completa](./documentation/README.md).
