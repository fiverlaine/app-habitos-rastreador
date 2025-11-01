# Guia Técnico - App de Hábitos

## 🏗️ Arquitetura do Sistema

### Estrutura de Pastas

```
App Habitos/
├── components/           # Componentes React
│   ├── AddHabitModal.tsx
│   ├── AchievementsView.tsx
│   ├── AchievementToast.tsx
│   ├── BottomNav.tsx
│   ├── CalendarView.tsx
│   ├── GamificationWidget.tsx
│   ├── HabitItem.tsx
│   ├── HabitList.tsx
│   ├── Header.tsx
│   ├── icons.tsx
│   ├── Statistics.tsx
│   ├── StatsCards.tsx   # ✅ Novo
│   └── WeekView.tsx     # ✅ Novo
├── utils/               # Funções utilitárias
│   ├── achievements.ts
│   └── streak.ts
├── documentation/       # Documentação
│   ├── README.md
│   ├── CHANGELOG.md
│   └── GUIA_TECNICO.md
├── App.tsx             # Componente raiz
├── types.ts            # Definições TypeScript
├── constants.ts        # Constantes globais
├── index.tsx           # Entry point
└── vite.config.ts      # Configuração Vite
```

## 📊 Modelagem de Dados

### Entidades Principais

#### Habit (Hábito)
```typescript
interface Habit {
    id: string;              // UUID gerado com crypto.randomUUID()
    name: string;            // Nome do hábito (min 3 chars)
    icon: string;            // Nome do ícone
    color: string;           // Classe Tailwind (ex: 'bg-blue-500')
    createdAt: string;       // ISO string da data de criação
    type: HabitType;         // 'boolean' | 'numeric'
    unit?: HabitUnit;        // Unidade (apenas para numeric)
    targetValue?: number;    // Meta diária (apenas para numeric)
}
```

#### Completion (Conclusão)
```typescript
interface Completion {
    id: string;              // UUID único
    habitId: string;         // Referência ao hábito
    date: string;            // Data no formato YYYY-MM-DD
    value?: number;          // Valor numérico (apenas para hábitos numeric)
}
```

#### Achievement (Conquista)
```typescript
interface Achievement {
    id: string;              // Identificador único
    name: string;            // Nome da conquista
    description: string;     // Descrição
    icon: string;            // Nome do ícone
    evaluate: (habits: Habit[], completions: Completion[]) => boolean;
}
```

### Tipos Auxiliares

```typescript
type HabitType = 'boolean' | 'numeric';

type HabitUnit = 
    | 'none' | 'litros' | 'ml' | 'páginas' 
    | 'km' | 'metros' | 'minutos' | 'horas'
    | 'calorias' | 'repetições' | 'gramas' 
    | 'kg' | 'copos' | 'vezes';

type View = 'dashboard' | 'stats' | 'calendar' | 'achievements';
```

## 🔄 Fluxo de Dados

### Estado Global (App.tsx)

```typescript
// Estados principais
const [habits, setHabits] = useState<Habit[]>([]);
const [completions, setCompletions] = useState<Completion[]>([]);
const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());
const [currentView, setCurrentView] = useState<View>('dashboard');
```

### Persistência

#### Inicialização
```typescript
useEffect(() => {
    const storedHabits = localStorage.getItem('habits');
    const storedCompletions = localStorage.getItem('completions');
    const storedAchievements = localStorage.getItem('unlockedAchievements');
    
    if (storedHabits) setHabits(JSON.parse(storedHabits));
    if (storedCompletions) setCompletions(JSON.parse(storedCompletions));
    if (storedAchievements) setUnlockedAchievements(new Set(JSON.parse(storedAchievements)));
}, []);
```

#### Salvamento Automático
```typescript
useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
}, [habits]);

useEffect(() => {
    localStorage.setItem('completions', JSON.stringify(completions));
}, [completions]);

useEffect(() => {
    localStorage.setItem('unlockedAchievements', JSON.stringify(Array.from(unlockedAchievements)));
}, [unlockedAchievements]);
```

## 🎯 Lógica de Negócio

### Sistema de Conclusão

#### Para Hábitos Booleanos
```typescript
if (habit?.type === 'boolean') {
    const existingCompletion = completions.find(
        c => c.habitId === habitId && c.date === todayStr
    );
    
    if (existingCompletion) {
        // Remove conclusão (toggle off)
        return completions.filter(c => c.id !== existingCompletion.id);
    } else {
        // Adiciona conclusão (toggle on)
        return [...completions, {
            id: crypto.randomUUID(),
            habitId,
            date: todayStr,
        }];
    }
}
```

#### Para Hábitos Numéricos
```typescript
if (habit?.type === 'numeric' && value !== undefined) {
    // Sempre adiciona novo registro (pode ter múltiplos no mesmo dia)
    return [...completions, {
        id: crypto.randomUUID(),
        habitId,
        date: todayStr,
        value,  // Valor adicionado pelo usuário
    }];
}
```

### Cálculo de Progresso

#### Hábitos Booleanos
```typescript
const isCompleted = completions.some(
    c => c.habitId === habit.id && c.date === todayStr
);
```

#### Hábitos Numéricos
```typescript
const todayCompletions = completions.filter(
    c => c.habitId === habit.id && c.date === todayStr
);

// Soma todos os valores do dia
const currentValue = todayCompletions.reduce(
    (sum, c) => sum + (c.value || 0), 
    0
);

// Verifica se atingiu a meta
const isCompleted = habit.targetValue 
    ? currentValue >= habit.targetValue 
    : false;
```

### Cálculo de Sequências (Streaks)

```typescript
export const calculateStreak = (dates: string[]) => {
    if (dates.length === 0) return { currentStreak: 0, longestStreak: 0 };
    
    const sortedDates = [...new Set(dates)].sort().map(d => new Date(d));
    let longestStreak = 1;
    let currentStreak = 1;
    
    // Percorre datas consecutivas
    for (let i = 1; i < sortedDates.length; i++) {
        const diff = (sortedDates[i].getTime() - sortedDates[i-1].getTime()) / (1000 * 60 * 60 * 24);
        
        if (diff === 1) {
            currentStreak++;
        } else {
            longestStreak = Math.max(longestStreak, currentStreak);
            currentStreak = 1;
        }
    }
    
    longestStreak = Math.max(longestStreak, currentStreak);
    
    // Verifica se sequência está ativa (último dia é hoje ou ontem)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastCompletion = sortedDates[sortedDates.length - 1];
    const diffFromToday = (today.getTime() - lastCompletion.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffFromToday > 1) currentStreak = 0;
    
    return { currentStreak, longestStreak };
};
```

### Sistema de Conquistas

```typescript
useEffect(() => {
    const newlyUnlocked = achievementsList.filter(
        ach => !unlockedAchievements.has(ach.id) && ach.evaluate(habits, completions)
    );
    
    if (newlyUnlocked.length > 0) {
        // Adiciona novas conquistas
        setUnlockedAchievements(prev => {
            const newSet = new Set(prev);
            newlyUnlocked.forEach(ach => newSet.add(ach.id));
            return newSet;
        });
        
        // Exibe toast da primeira conquista
        if (!toastAchievement) {
            setToastAchievement(newlyUnlocked[0]);
            setTimeout(() => setToastAchievement(null), 5000);
        }
    }
}, [habits, completions, unlockedAchievements, toastAchievement]);
```

### Sistema de Gamificação

#### Cálculo de Nível
```typescript
const points = completions.length * 10;
const level = Math.floor(Math.pow(points / 100, 0.7)) + 1;

// Pontos necessários para níveis
const currentLevelPoints = 100 * Math.pow(level - 1, 1 / 0.7);
const nextLevelPoints = 100 * Math.pow(level, 1 / 0.7);

// Progresso no nível atual (0-100%)
const progress = (points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints) * 100;
```

#### Exemplo de Progressão
- 0 pontos = Nível 1
- 100 pontos = Nível 2
- 271 pontos = Nível 3
- 512 pontos = Nível 4
- 819 pontos = Nível 5
- 1189 pontos = Nível 6

## 🎨 Sistema de Design

### Tailwind Classes Principais

#### Cores de Background
```typescript
bg-slate-900  // Background principal
bg-slate-800  // Cards e containers
bg-slate-700  // Inputs e elementos secundários
```

#### Cores de Accent
```typescript
// Principal (v2.0)
bg-teal-500, text-teal-400, border-teal-500

// Secundária
bg-indigo-600, text-indigo-400

// Status
bg-green-500   // Sucesso/Completo
bg-red-400     // Erro/Alerta
bg-orange-400  // Sequências
bg-yellow-400  // Avisos
```

#### Cores para Hábitos
```typescript
const HABIT_COLORS = [
    'bg-red-500',
    'bg-orange-500', 
    'bg-yellow-500',
    'bg-green-500',
    'bg-teal-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-pink-500',
];
```

### Componentes de Interface

#### Cards
```tsx
<div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
    {/* Conteúdo */}
</div>
```

#### Botões Primários
```tsx
<button className="bg-teal-500 hover:bg-teal-400 text-white rounded-md px-4 py-2 transition-colors">
    Texto
</button>
```

#### Inputs
```tsx
<input 
    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
/>
```

## 🔧 Componentes Técnicos

### HabitItem - Renderização Condicional

```tsx
{habit.type === 'boolean' ? (
    // Botão de check para booleanos
    <button onClick={() => onToggle(habit.id)}>
        <CheckIcon />
    </button>
) : (
    // Input e botão para numéricos
    <>
        {showNumericInput ? (
            <div>
                <input type="number" />
                <button onClick={handleSubmit}>+</button>
            </div>
        ) : (
            <button onClick={() => setShowNumericInput(true)}>
                Adicionar
            </button>
        )}
    </>
)}
```

### WeekView - Cálculo de Dias

```tsx
const weekDays = useMemo(() => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        days.push(date);
    }
    
    return days;
}, []);
```

### StatsCards - Agregações

```tsx
const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    let todayCompleted = 0;
    
    habits.forEach(habit => {
        const todayCompletions = completions.filter(
            c => c.habitId === habit.id && c.date === todayStr
        );
        
        if (habit.type === 'boolean' && todayCompletions.length > 0) {
            todayCompleted++;
        } else if (habit.type === 'numeric' && habit.targetValue) {
            const currentValue = todayCompletions.reduce(
                (sum, c) => sum + (c.value || 0), 
                0
            );
            if (currentValue >= habit.targetValue) todayCompleted++;
        }
    });
    
    const completionRate = habits.length > 0 
        ? Math.round((todayCompleted / habits.length) * 100) 
        : 0;
    
    return { completionRate, /* ... */ };
}, [habits, completions]);
```

## 🧪 Testes e Validação

### Validações Implementadas

#### AddHabitModal
```typescript
if (name.trim().length < 3) {
    setError('O nome do hábito deve ter pelo menos 3 caracteres.');
    return;
}

if (habitType === 'numeric') {
    const value = parseFloat(targetValue) || 1;
    // Garante valor mínimo de 1
}
```

#### Input Numérico
```typescript
const value = parseFloat(inputValue);
if (value > 0) {
    onToggle(habit.id, value);
    // Só aceita valores positivos
}
```

### Tratamento de Erros

```typescript
try {
    localStorage.setItem('habits', JSON.stringify(habits));
} catch (error) {
    console.error("Erro ao salvar hábitos no localStorage", error);
}
```

## 🚀 Performance

### Otimizações Implementadas

#### useMemo para Cálculos Pesados
```typescript
const weekDays = useMemo(() => {
    // Cálculo executado apenas na montagem
}, []);

const stats = useMemo(() => {
    // Re-executa apenas quando habits ou completions mudam
}, [habits, completions]);
```

#### useCallback para Funções
```typescript
const toggleCompletion = useCallback((habitId: string, value?: number) => {
    // Função memorizada, não recriada a cada render
}, [todayStr, habits]);

const deleteHabit = useCallback((habitId: string) => {
    // Previne re-renders desnecessários em componentes filhos
}, []);
```

#### Renderização Condicional
```typescript
// Apenas renderiza quando necessário
{currentView === 'dashboard' && <WeekView />}
{isModalOpen && <AddHabitModal />}
```

## 📱 Responsividade

### Breakpoints Tailwind
```typescript
// Mobile first
className="p-4 sm:p-6 lg:p-8"
className="text-xl sm:text-2xl lg:text-3xl"
className="grid grid-cols-2 md:grid-cols-4 gap-4"
```

### Bottom Navigation
```typescript
className="fixed bottom-0 left-0 right-0"
// Sempre visível em mobile
```

## 🔐 Segurança

### Geração de IDs
```typescript
id: crypto.randomUUID()
// UUIDs únicos e seguros
```

### Sanitização de Dados
```typescript
name: name.trim()  // Remove espaços
parseFloat(value) || 1  // Valor padrão seguro
```

### Confirmação de Deleção
```typescript
if (window.confirm("Você tem certeza?")) {
    // Só deleta se confirmado
}
```

## 📚 Boas Práticas Aplicadas

1. **TypeScript Strict**: Tipagem forte em todo o código
2. **Componentes Funcionais**: Apenas hooks, sem classes
3. **Single Responsibility**: Cada componente tem uma função clara
4. **Imutabilidade**: Sempre cria novos arrays/objetos
5. **Cleanup**: useEffect com cleanup quando necessário
6. **Acessibilidade**: aria-labels e semântica HTML
7. **Performance**: useMemo e useCallback onde apropriado
8. **Error Handling**: Try/catch em operações críticas
9. **Código Limpo**: Nomes descritivos, funções pequenas
10. **Documentação**: Código comentado e documentado

## 🛠️ Como Adicionar Novas Features

### Adicionar Nova Unidade de Medida

1. Atualizar tipo em `types.ts`:
```typescript
export type HabitUnit = 
    | 'existing...'
    | 'nova_unidade';  // ✅ Adicionar aqui
```

2. Adicionar em `constants.ts`:
```typescript
export const HABIT_UNITS = [
    // ...existentes
    { value: 'nova_unidade', label: 'Nova Unidade' },  // ✅ Adicionar aqui
];
```

### Adicionar Nova Conquista

Em `utils/achievements.ts`:
```typescript
{
    id: 'NOVA_CONQUISTA',
    name: 'Nome da Conquista',
    description: 'Descrição',
    icon: 'IconName',
    evaluate: (habits, completions) => {
        // Lógica de desbloqueio
        return /* condição */;
    },
}
```

### Adicionar Nova View

1. Criar componente em `components/`:
```typescript
const NovaView: React.FC<Props> = ({ habits, completions }) => {
    return <div>/* Conteúdo */</div>;
};
```

2. Atualizar tipo em `types.ts`:
```typescript
export type View = 'dashboard' | 'stats' | 'calendar' | 'achievements' | 'nova_view';
```

3. Adicionar no `App.tsx`:
```typescript
const renderView = () => {
    switch (currentView) {
        // ...casos existentes
        case 'nova_view':
            return <NovaView habits={habits} completions={completions} />;
    }
};
```

4. Adicionar na navegação (`BottomNav.tsx`)

## 🔍 Debugging

### Chrome DevTools

#### Ver Estado
```javascript
// No console
$0.__reactFiber$  // Acessa fiber do elemento selecionado
```

#### localStorage
```javascript
localStorage.getItem('habits')
localStorage.getItem('completions')
localStorage.getItem('unlockedAchievements')
```

### React DevTools
- Inspecionar props e state
- Profiler para performance
- Componentes tree

### Logs Úteis
```typescript
console.log('Habits:', habits);
console.log('Today completions:', completions.filter(c => c.date === todayStr));
console.log('Current streak:', calculateStreak(dates));
```

