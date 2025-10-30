# Changelog - App de Hábitos

# Changelog - App de Hábitos

## [2.0.1] - 2025-10-30

### 🔔 Push Notifications Refinadas
- Alinhamento da coleção `web_push_subscriptions` com RLS ativada e políticas por usuário
- Índice único em `reminder_queue` evita duplicidade de lembretes por hábito/horário
- `useNotifications` agora utiliza chave VAPID configurável via `VITE_VAPID_PUBLIC_KEY`
- Correção no `NotificationSettings` para reutilizar o mesmo estado de notificações do app
- Conversão de chave VAPID em `Uint8Array`, garantindo compatibilidade com `PushManager.subscribe`
- Ajuste nos testes e documentação para o novo fluxo de configuração (.env + Edge Function)

### 🛠️ Infraestrutura
- Nova migração `20251030153000_push_notifications_alignment.sql`
- Atualização da tabela `web_push_subscriptions` (antes `push_subscriptions`) e políticas `authenticated`
- Documentação revisada (`PUSH_NOTIFICATIONS_SETUP.md`, `PUSH_CONFIG_INSTRUCTIONS.md`)

## [2.0.0] - 2025-10-08

### ✨ Novos Recursos

#### Sistema de Hábitos Numéricos
- Adicionado suporte para hábitos com valores quantificáveis
- 14 tipos de unidades de medida disponíveis:
  - Líquidos: litros, ml, copos
  - Leitura: páginas
  - Distância: km, metros
  - Tempo: minutos, horas
  - Saúde: calorias
  - Exercício: repetições
  - Peso: gramas, kg
  - Frequência: vezes
- Sistema de metas diárias para hábitos numéricos
- Suporte a valores decimais (ex: 1.5 litros)

#### Nova Interface do Dashboard
- **WeekView**: Visualização gráfica horizontal da semana
  - Barras proporcionais à taxa de conclusão
  - Destaque visual para o dia atual
  - Cores indicativas de progresso
- **StatsCards**: 4 cards de estatísticas principais
  - Taxa de conclusão do dia
  - Melhor dia (maior número de hábitos completados)
  - Total de hábitos ativos
  - Maior sequência atual
- Header redesenhado com relógio em tempo real

#### Melhorias no HabitItem
- Barra de progresso visual para hábitos numéricos
- Exibição de valor atual / meta com unidade
- Input inline para adicionar valores
- Botão "Adicionar" para hábitos numéricos
- Mantém botão de check circular para hábitos booleanos
- Indicador visual de conclusão

#### Modal de Criação Aprimorado
- Seleção de tipo de hábito (Boolean/Numérico)
- Campos condicionais baseados no tipo
- Dropdown de unidades de medida
- Input de meta diária
- Validação aprimorada

#### Nova Navegação Inferior
- Redesign completo da bottom navigation
- 5 opções de navegação
- Botão central "Adicionar" elevado e destacado
- Cor principal alterada para teal
- Labels atualizadas:
  - Início (Dashboard)
  - Visão Geral (Estatísticas)
  - Adicionar (Centro)
  - Rendimento (Calendário)
  - Ajustes (Conquistas)

### 🔄 Alterações

#### Sistema de Tipos
```typescript
// Antes
interface Habit {
    id: string;
    name: string;
    icon: string;
    color: string;
    createdAt: string;
}

// Depois
interface Habit {
    id: string;
    name: string;
    icon: string;
    color: string;
    createdAt: string;
    type: HabitType;          // ✅ Novo
    unit?: HabitUnit;          // ✅ Novo
    targetValue?: number;      // ✅ Novo
}
```

```typescript
// Antes
interface Completion {
    id: string;
    habitId: string;
    date: string;
}

// Depois
interface Completion {
    id: string;
    habitId: string;
    date: string;
    value?: number;  // ✅ Novo - para hábitos numéricos
}
```

#### Lógica de Conclusão
- **Booleanos**: Toggle on/off (comportamento anterior mantido)
- **Numéricos**: Acumula valores múltiplos no mesmo dia
- Cálculo inteligente de conclusão baseado no tipo
- Para numéricos: completo quando valor >= meta

#### Cores e Tema
- Cor principal alterada de indigo para teal
- Accent colors atualizadas
- Paleta consistente em todos os componentes
- Cards com transparência e bordas suaves

### 🐛 Correções

- Corrigido cálculo de taxa de conclusão para suportar ambos os tipos
- Ajustado cálculo de sequências para hábitos numéricos
- Melhorado sistema de detecção de conquistas
- Corrigida persistência de dados com novos campos

### 📝 Documentação

- Criada documentação completa em `/documentation/README.md`
- Adicionado changelog detalhado
- Documentação de arquitetura e tipos
- Guia de uso para usuários
- Exemplos de código

### 🎨 Design

#### Componentes Novos
- `WeekView.tsx` - Visualização semanal horizontal
- `StatsCards.tsx` - Cards de estatísticas resumidas

#### Componentes Atualizados
- `Header.tsx` - Novo layout com relógio
- `HabitItem.tsx` - Suporte para ambos os tipos
- `HabitList.tsx` - Cálculos de valores numéricos
- `AddHabitModal.tsx` - Campos para hábitos numéricos
- `BottomNav.tsx` - Redesign completo
- `App.tsx` - Lógica para valores numéricos

#### Constantes Atualizadas
- Adicionada `HABIT_UNITS` com 14 opções
- Hábitos iniciais convertidos para formato numérico
- Tipos exportados de constants.ts

### 🔧 Configuração

#### Arquivos Modificados
```
✅ types.ts           - Novos tipos e interfaces
✅ constants.ts       - Novas unidades e hábitos iniciais
✅ App.tsx            - Lógica de conclusão numérica
✅ components/
   ✅ AddHabitModal.tsx
   ✅ HabitItem.tsx
   ✅ HabitList.tsx
   ✅ Header.tsx
   ✅ BottomNav.tsx
   ✅ WeekView.tsx     [NOVO]
   ✅ StatsCards.tsx   [NOVO]
```

### 📊 Estatísticas de Mudanças

- **Arquivos criados**: 3
- **Arquivos modificados**: 7
- **Linhas adicionadas**: ~800
- **Novos componentes**: 2
- **Novos tipos**: 2
- **Novas unidades**: 14

---

## [1.0.0] - Anterior

### Funcionalidades Originais
- Sistema básico de hábitos (apenas boolean)
- Dashboard com lista de hábitos
- Sistema de sequências (streaks)
- Gamificação com níveis
- Sistema de conquistas
- Estatísticas com gráficos
- Calendário mensal
- Navegação entre views
- Persistência com localStorage
- Tema escuro
- Design responsivo

### Componentes Originais
- App, Header, HabitList, HabitItem
- AddHabitModal, BottomNav
- Statistics, CalendarView
- GamificationWidget
- AchievementsView, AchievementToast
- Icons (componentes de ícones)

### Utilitários Originais
- streak.ts - Cálculo de sequências
- achievements.ts - Sistema de conquistas

