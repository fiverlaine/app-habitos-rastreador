# 📚 Documentação do App de Hábitos v2.0

> 📖 **Navegação Rápida**: Confira o [ÍNDICE](./INDEX.md) para encontrar rapidamente o que procura!

## 📋 Visão Geral

Aplicativo moderno de rastreamento de hábitos desenvolvido em React + TypeScript com Vite. O app permite aos usuários criar, monitorar e acompanhar seus hábitos diários, com suporte tanto para hábitos binários (feito/não feito) quanto numéricos (com unidades de medida e metas).

### 🎯 Documentação Disponível

1. **[📖 README.md](./README.md)** (este arquivo) - Documentação completa do projeto
2. **[📝 CHANGELOG.md](./CHANGELOG.md)** - Histórico de alterações detalhado
3. **[🔧 GUIA_TECNICO.md](./GUIA_TECNICO.md)** - Guia técnico para desenvolvedores
4. **[🎨 RESUMO_VISUAL.md](./RESUMO_VISUAL.md)** - Comparações visuais e mockups
5. **[📊 RESUMO_EXECUTIVO.md](./RESUMO_EXECUTIVO.md)** - Resumo executivo do projeto
6. **[🗂️ INDEX.md](./INDEX.md)** - Índice navegável de toda documentação

## 🎯 Funcionalidades Principais

### 1. Sistema de Hábitos

#### Tipos de Hábitos
- **Hábitos Booleanos**: Simples marcação de feito/não feito
- **Hábitos Numéricos**: Com meta quantificável e unidades de medida

#### Unidades Disponíveis
- Litros, Mililitros, Copos
- Páginas
- Quilômetros, Metros
- Minutos, Horas
- Calorias
- Repetições
- Gramas, Quilogramas
- Vezes

### 2. Interface do Usuário

#### Página Inicial (Dashboard)
- **Header**: Exibe hora atual e título "Hoje"
- **WeekView**: Visualização gráfica da semana com taxa de conclusão por dia
- **StatsCards**: 4 cards de estatísticas principais
  - Taxa de conclusão do dia (%)
  - Melhor dia (número de hábitos concluídos)
  - Total de hábitos
  - Maior sequência atual
- **Lista de Hábitos**: Cards com progresso individual de cada hábito

#### Navegação Inferior
- **Início**: Dashboard principal
- **Visão Geral**: Estatísticas detalhadas com gráficos
- **Adicionar** (botão central): Criar novo hábito
- **Rendimento**: Visualização em calendário mensal
- **Ajustes**: Sistema de conquistas

### 3. Sistema de Progresso

#### Para Hábitos Booleanos
- Botão de check circular
- Exibição de sequência (streak) atual
- Visual simples e direto

#### Para Hábitos Numéricos
- Barra de progresso visual
- Exibição de valor atual / meta
- Botão "Adicionar" para incrementar valores
- Input numérico para adicionar quantidade específica
- Suporta valores decimais (ex: 1.5 litros)

### 4. Gamificação

#### Sistema de Níveis
- Baseado em pontos (10 pontos por conclusão)
- Fórmula de progressão: `level = Math.floor(Math.pow(points / 100, 0.7)) + 1`
- Barra de progresso visual

#### Conquistas
- Primeiros Passos: Criar primeiro hábito
- Colecionador: Ter 5 hábitos ativos
- Começou: Completar primeiro hábito
- Dia Perfeito: Completar todos os hábitos em um dia
- Em Chamas: 7 dias de sequência
- Imparável: 30 dias de sequência
- Lenda Viva: 100 dias de sequência
- Mestre dos Hábitos: Alcançar nível 10

### 5. Estatísticas e Análises

#### Dashboard de Estatísticas
- Gráfico de barras de conclusões semanais
- Total de hábitos criados
- Total de conclusões
- Taxa de conclusão geral
- Maior sequência histórica

#### Calendário Mensal
- Visualização de todos os dias do mês
- Indicadores visuais de hábitos completados por dia
- Cores correspondentes aos hábitos
- Destaque para dia atual

## 🏗️ Arquitetura

### Estrutura de Tipos

```typescript
// Tipo de hábito
type HabitType = 'boolean' | 'numeric';

// Unidades disponíveis
type HabitUnit = 'none' | 'litros' | 'ml' | 'páginas' | 'km' | ... ;

// Interface do Hábito
interface Habit {
    id: string;
    name: string;
    icon: string;
    color: string;
    createdAt: string;
    type: HabitType;
    unit?: HabitUnit;
    targetValue?: number;
}

// Interface de Conclusão
interface Completion {
    id: string;
    habitId: string;
    date: string; // YYYY-MM-DD
    value?: number; // Para hábitos numéricos
}
```

### Componentes Principais

#### App.tsx
- Componente raiz da aplicação
- Gerencia estado global (hábitos, conclusões, conquistas)
- Sistema de rotas entre views
- Persistência com localStorage
- Lógica de conquistas e notificações

#### Header.tsx
- Exibe hora atual
- Título da página
- Design minimalista e responsivo

#### WeekView.tsx
- Visualização gráfica da semana
- Cálculo de taxa de conclusão por dia
- Destaque para dia atual
- Barras proporcionais ao progresso

#### StatsCards.tsx
- 4 cards de estatísticas principais
- Cálculos em tempo real
- Design com cores temáticas

#### HabitList.tsx
- Lista todos os hábitos do usuário
- Calcula valores atuais do dia
- Determina se hábito está completo
- Passa props corretas para HabitItem

#### HabitItem.tsx
- Card individual de hábito
- Suporta dois modos: boolean e numeric
- Para boolean: botão de check
- Para numeric: 
  - Barra de progresso
  - Campo de input para adicionar valores
  - Botão "Adicionar"
- Exibição de ícone colorido
- Opção de deletar hábito

#### AddHabitModal.tsx
- Modal para criar novos hábitos
- Seleção de tipo (Boolean/Numérico)
- Campos condicionais para hábitos numéricos:
  - Unidade de medida (dropdown)
  - Meta diária (input numérico)
- Seleção de ícone (grade 7x1)
- Seleção de cor (grade 9x1)
- Validação de nome (mínimo 3 caracteres)

#### BottomNav.tsx
- Navegação inferior fixa
- 5 opções: Início, Visão Geral, Adicionar, Rendimento, Ajustes
- Botão central "Adicionar" elevado
- Indicadores visuais de página ativa

#### Statistics.tsx
- Gráfico de barras com Recharts
- Estatísticas agregadas
- Dados dos últimos 7 dias
- Cards de resumo

#### CalendarView.tsx
- Calendário mensal completo
- Navegação entre meses
- Indicadores visuais de conclusões
- Destaque para hoje

#### GamificationWidget.tsx
- Exibe nível atual
- Barra de progresso para próximo nível
- Pontos e XP
- Maior sequência

#### AchievementsView.tsx
- Lista de conquistas disponíveis
- Visual de desbloqueadas vs bloqueadas
- Descrições e ícones

### Utilitários

#### utils/streak.ts
- Cálculo de sequências (streaks)
- Identifica sequência atual
- Identifica maior sequência histórica
- Valida se sequência está ativa

#### utils/achievements.ts
- Lista de conquistas disponíveis
- Funções de avaliação para cada conquista
- Sistema de desbloqueio automático

### Persistência de Dados

Utiliza **localStorage** para salvar:
- Lista de hábitos
- Histórico de conclusões
- Conquistas desbloqueadas

Dados são carregados na inicialização e salvos automaticamente a cada mudança.

### Sistema de Conclusões

#### Para Hábitos Booleanos
```typescript
toggleCompletion(habitId) {
    // Se já existe conclusão hoje: remove
    // Se não existe: cria nova
}
```

#### Para Hábitos Numéricos
```typescript
toggleCompletion(habitId, value) {
    // Sempre adiciona novo registro com valor
    // Múltiplas conclusões podem existir no mesmo dia
    // Valor total = soma de todos os registros do dia
}
```

## 🎨 Design System

### Cores Principais
- **Background**: slate-900 (#0f172a)
- **Cards**: slate-800 (#1e293b)
- **Accent Principal**: teal-500 (#14b8a6)
- **Accent Secundário**: indigo-600 (#4f46e5)

### Cores de Status
- **Sucesso/Completo**: green-500
- **Progresso**: teal-400
- **Estatísticas**: red-400, blue-400, teal-400, yellow-400
- **Sequência**: orange-400

### Ícones Disponíveis
- Book (Livro)
- Water (Água)
- Dumbbell (Haltere)
- Run (Corrida)
- Code (Código)
- Meditate (Meditação)
- Fruit (Fruta)

### Paleta de Cores para Hábitos
9 opções: red, orange, yellow, green, teal, blue, indigo, purple, pink

## 🔄 Fluxo de Uso

### Criar Novo Hábito
1. Clicar no botão "+" central ou flutuante
2. Inserir nome do hábito
3. Escolher tipo (Boolean ou Numérico)
4. Se numérico:
   - Selecionar unidade de medida
   - Definir meta diária
5. Escolher ícone
6. Escolher cor
7. Confirmar criação

### Completar Hábito Boolean
1. Clicar no botão de check circular
2. Visual muda para verde indicando conclusão
3. Clicar novamente para desmarcar

### Adicionar Progresso Numérico
1. Clicar em "Adicionar"
2. Campo de input aparece
3. Digitar valor (suporta decimais)
4. Clicar em "+" ou pressionar Enter
5. Barra de progresso atualiza
6. Quando atinge meta, hábito fica completo

### Visualizar Estatísticas
1. Navegar para "Visão Geral"
2. Ver gráfico semanal
3. Analisar cards de métricas
4. Ver taxa de conclusão

### Visualizar Calendário
1. Navegar para "Rendimento"
2. Ver conclusões do mês
3. Navegar entre meses com setas
4. Identificar padrões visuais

### Verificar Conquistas
1. Navegar para "Ajustes"
2. Ver conquistas desbloqueadas
3. Ver progresso para próximas conquistas

## 📱 Responsividade

- Design mobile-first
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Navegação inferior fixa para acesso rápido
- Cards adaptáveis
- Grids responsivos

## 🚀 Melhorias Implementadas (Última Atualização)

### Novos Recursos
1. ✅ Sistema de hábitos numéricos com unidades
2. ✅ 14 tipos de unidades de medida
3. ✅ Barra de progresso visual para hábitos numéricos
4. ✅ Redesign da página inicial com visualização semanal
5. ✅ Cards de estatísticas resumidas
6. ✅ Header redesenhado com relógio
7. ✅ Navegação inferior com botão central destacado
8. ✅ Suporte a valores decimais
9. ✅ Cálculo inteligente de conclusão por tipo de hábito

### Melhorias de UX
- Interface mais limpa e moderna
- Visual consistente com design fornecido
- Feedback visual aprimorado
- Transições suaves
- Cores temáticas (teal como cor principal)

## 🔧 Tecnologias Utilizadas

- **React** 19.2.0
- **TypeScript** 5.8.2
- **Vite** 6.2.0
- **Recharts** (para gráficos)
- **Tailwind CSS** (via classes utilitárias)

## 📦 Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Compila para produção
npm run preview  # Preview da build de produção
```

## 🎯 Próximas Melhorias Sugeridas

1. Sistema de categorias para hábitos
2. Notificações push para lembrar hábitos
3. Exportação de dados (CSV/JSON)
4. Temas personalizáveis
5. Sincronização em nuvem
6. Gráficos de tendência de longo prazo
7. Sistema de recompensas mais elaborado
8. Compartilhamento de progresso
9. Modo escuro/claro
10. PWA para instalação no dispositivo

