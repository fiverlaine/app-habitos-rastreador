# Design System v2.0 - App de Hábitos

## 🎨 Visão Geral

O novo design system foi completamente redesenhado focando em **mobile PWA** com uma estética **moderna, profissional e minimalista**. O objetivo é proporcionar uma experiência visual premium com animações fluidas e elementos glassmorphism.

---

## 🌈 Paleta de Cores

### Cores Principais

```css
/* Backgrounds */
bg-slate-950     /* #020617 - Background principal */
bg-slate-900     /* #0f172a - Background secundário */
bg-slate-800     /* #1e293b - Cards e containers */

/* Accent Colors - Gradientes Modernos */
from-cyan-500 to-blue-600        /* Botões primários e destaques */
from-emerald-500 to-teal-600     /* Status de sucesso e completados */
from-rose-500 to-pink-600        /* Alertas e dados críticos */
from-amber-500 to-orange-600     /* Sequências e conquistas */
```

### Aplicações

- **Primária (Cyan/Blue)**: Botões principais, links, elementos interativos
- **Sucesso (Emerald/Teal)**: Hábitos completos, confirmações
- **Alerta (Rose/Pink)**: Erros, exclusões, avisos
- **Destaque (Amber/Orange)**: Sequências, streak, gamificação

---

## 🎭 Componentes Principais

### 1. Cards Modernos

```tsx
className="bg-slate-900/40 backdrop-blur-sm rounded-3xl p-5 border border-slate-800/50 shadow-xl"
```

**Características:**
- Border-radius generoso (24px = rounded-3xl)
- Backdrop blur para efeito glassmorphism
- Sombras sutis mas presentes
- Transparência controlada (40-95%)

### 2. Botões com Gradiente

```tsx
// Primário
className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 active:scale-95"

// Secundário
className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 text-slate-300 rounded-xl px-4 py-3 transition-all duration-300 active:scale-95"
```

**Características:**
- Gradientes vibrantes
- Sombras coloridas (shadow-cyan-500/30)
- Micro-interação: active:scale-95
- Transições suaves (300ms)

### 3. Inputs Modernos

```tsx
className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
```

**Características:**
- Background semi-transparente
- Focus state com ring de 2px
- Placeholder em slate-500
- Border radius consistente (12px)

### 4. Navigation Bar (Bottom Nav)

```tsx
className="fixed bottom-0 left-0 right-0 z-40 px-5 pb-5 pt-2"
// Container interno
className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-3xl shadow-2xl shadow-black/40"
```

**Características:**
- Flutuante com margem inferior
- Glassmorphism pesado
- Botão central elevado com gradiente
- Indicadores de estado ativos

---

## ✨ Animações e Transições

### Animações Globais (Tailwind Config)

```javascript
animation: {
    'fade-in': 'fadeIn 0.5s ease-out',
    'slide-up': 'slideUp 0.5s ease-out',
    'scale-in': 'scaleIn 0.3s ease-out',
    'shimmer': 'shimmer 2s infinite',
    'bounce-soft': 'bounceSoft 1s ease-in-out infinite',
}
```

### Keyframes

```css
@keyframes fadeIn {
    0% { opacity: 0 }
    100% { opacity: 1 }
}

@keyframes slideUp {
    0% { transform: translateY(20px); opacity: 0 }
    100% { transform: translateY(0); opacity: 1 }
}

@keyframes scaleIn {
    0% { transform: scale(0.9); opacity: 0 }
    100% { transform: scale(1); opacity: 1 }
}

@keyframes shimmer {
    0% { backgroundPosition: '-1000px 0' }
    100% { backgroundPosition: '1000px 0' }
}
```

### Micro-interações

- **Hover Scale**: `hover:scale-105`
- **Active Scale**: `active:scale-95` ou `active:scale-90`
- **Transition Duration**: `duration-300` (padrão)
- **Easing**: `ease-out` ou `cubic-bezier(0.4, 0, 0.2, 1)`

---

## 🎯 HabitItem - Componente Destaque

### Design Premium

```tsx
// Container principal
className="relative rounded-3xl p-5 flex items-center justify-between border backdrop-blur-sm transition-all duration-300"

// Estado completo
className="bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border-emerald-500/30 shadow-lg shadow-emerald-500/5"

// Estado normal
className="bg-slate-900/40 border-slate-800/50 hover:border-slate-700/70"
```

### Ícone do Hábito

```tsx
className="w-14 h-14 rounded-2xl flex items-center justify-center ${habit.color} hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg overflow-hidden group/icon"
```

### Botão de Check

```tsx
// Completo
className="bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/30"

// Não completo
className="bg-slate-800 hover:bg-slate-700 border border-slate-700/50"
```

### Progress Bar (Hábitos Numéricos)

```tsx
className="bg-gradient-to-r from-cyan-500 to-blue-600"
// Com shimmer effect
className="bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
```

---

## 📊 Stats Cards

### Grid Layout

```tsx
className="grid grid-cols-4 gap-2.5"
```

### Card Individual

```tsx
className="group relative bg-gradient-to-br from-{color}-500/10 to-{color}-600/10 backdrop-blur-sm rounded-2xl p-3.5 text-center border border-{color}-500/20 hover:border-{color}-500/40 transition-all duration-300"
```

### Texto com Gradiente

```tsx
className="text-2xl font-extrabold bg-gradient-to-br from-{color}-400 to-{color}-500 bg-clip-text text-transparent"
```

**Cores por métrica:**
- **Concluído**: Rose/Pink
- **Melhor Dia**: Blue/Cyan
- **Total**: Emerald/Teal
- **Sequência**: Amber/Orange

---

## 🌅 WeekView - Visualização Semanal

### Container

```tsx
className="bg-slate-900/40 backdrop-blur-sm rounded-3xl p-5 border border-slate-800/50 shadow-xl"
```

### Colunas dos Dias

```tsx
// Barra de progresso
className="w-full max-w-[36px] rounded-xl relative overflow-hidden"

// Gradientes por status
today: "bg-gradient-to-t from-cyan-500 to-blue-600"
100%: "bg-gradient-to-t from-emerald-500 to-emerald-400"
>0%: "bg-gradient-to-t from-slate-600 to-slate-500"
0%: "bg-slate-800"
```

### Efeitos Visuais

- **Shimmer**: Gradiente animado sobre o progresso
- **Brilho no topo**: linha branca/30 quando > 30%
- **Indicador do dia atual**: bolinha pulsante abaixo

---

## 🎨 Glassmorphism

### Aplicação

```css
.glass {
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
}
```

### Onde usar

- Modais e overlays
- Bottom navigation
- Cards flutuantes
- Botões de perfil
- Elementos sobre backgrounds complexos

---

## 📱 Responsividade Mobile-First

### Padding e Spacing

```tsx
// Container principal
className="max-w-2xl mx-auto pb-28 px-5 pt-6"

// Cards
className="p-5" // mobile
className="sm:p-6 lg:p-8" // tablet/desktop
```

### Touch Interactions

```css
* {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
}
```

### Safe Areas

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover" />
```

---

## 🎭 Modais

### Overlay

```tsx
className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 p-5 animate-fade-in"
```

### Container

```tsx
className="bg-slate-900/95 backdrop-blur-xl rounded-3xl p-7 w-full max-w-lg shadow-2xl border border-slate-800/50 max-h-[90vh] overflow-y-auto animate-scale-in"
```

### Botão de Fechar

```tsx
className="w-10 h-10 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 active:scale-90"
```

---

## 🎨 Ícones e Elementos Visuais

### Ícones de Hábitos

```tsx
className="w-14 h-14 text-white relative z-10"
```

### Badges e Tags

```tsx
className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold"
```

### Divisores

```tsx
className="h-px bg-slate-800/50"
```

---

## 📐 Spacing System

### Padrão de Espaçamento

```
gap-2.5  = 10px  (elementos pequenos)
gap-3    = 12px  (cards próximos)
gap-5    = 20px  (seções)
gap-7    = 28px  (separação maior)

p-3.5    = 14px  (padding compacto)
p-5      = 20px  (padding padrão)
p-7      = 28px  (padding generoso)
```

### Border Radius

```
rounded-xl   = 12px  (inputs, botões secundários)
rounded-2xl  = 16px  (botões primários, badges)
rounded-3xl  = 24px  (cards principais, modais)
```

---

## 🎯 Typography

### Hierarquia

```tsx
// Títulos principais
className="text-2xl font-bold text-white"

// Subtítulos
className="text-lg font-semibold text-white"

// Body
className="text-base font-medium text-slate-300"

// Labels
className="text-sm font-semibold text-slate-300"

// Captions
className="text-xs font-medium text-slate-500"
```

### Font Weights

- **Font-bold**: 700 (Botões, títulos principais)
- **Font-semibold**: 600 (Subtítulos, labels)
- **Font-medium**: 500 (Body text)
- **Font-normal**: 400 (Text secundário)
- **Font-light**: 300 (Hints, placeholders)

---

## ⚡ Performance

### Otimizações

1. **Backdrop-filter**: Usado com moderação
2. **GPU Acceleration**: `transform` ao invés de `position`
3. **Will-change**: Não usado (deixar para o browser decidir)
4. **Transition**: Apenas propriedades necessárias

### Classes Reutilizáveis

```css
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #1e293b;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #475569;
    border-radius: 3px;
}
```

---

## 🎨 Estados Interativos

### Hierarchy of States

1. **Default**: Estado padrão
2. **Hover**: `hover:` - Desktop only
3. **Active**: `active:scale-95` - Feedback tátil
4. **Focus**: `focus:ring-2` - Acessibilidade
5. **Disabled**: `disabled:opacity-50` - Estado inativo

### Exemplo Completo

```tsx
className="
    bg-gradient-to-r from-cyan-500 to-blue-600
    hover:from-cyan-400 hover:to-blue-500
    active:scale-95
    focus:outline-none focus:ring-2 focus:ring-cyan-500/50
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-all duration-300
"
```

---

## 🌟 Destaque e Feedback Visual

### Sombras Coloridas

```tsx
// Primário
shadow-xl shadow-cyan-500/30
hover:shadow-cyan-500/50

// Sucesso
shadow-xl shadow-emerald-500/30

// Erro
shadow-xl shadow-red-500/40
```

### Glow Effects

```tsx
// Elemento em destaque
<div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl blur-xl"></div>
```

---

## 📱 PWA Específico

### Status Bar

```html
<meta name="theme-color" content="#0f172a" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

### Viewport

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover" />
```

### Safe Areas

```css
padding-bottom: env(safe-area-inset-bottom);
```

---

## 🎯 Checklist de Implementação

- ✅ Sistema de cores moderno com gradientes
- ✅ Glassmorphism em modais e navigation
- ✅ Animações suaves (fade, slide, scale)
- ✅ Micro-interações (hover, active states)
- ✅ Tipografia hierárquica
- ✅ Spacing consistente
- ✅ Border radius generoso
- ✅ Sombras coloridas
- ✅ Estados interativos claros
- ✅ Feedback visual imediato
- ✅ Mobile-first responsive
- ✅ Acessibilidade mantida
- ✅ Performance otimizada

---

## 🚀 Melhorias Futuras

1. **Dark Mode Toggle**: Permitir tema claro opcional
2. **Animações Personalizadas**: Permitir usuário desabilitar
3. **Temas de Cor**: Permitir escolha de accent color
4. **Haptic Feedback**: Vibração em interações críticas
5. **Skeleton Screens**: Loading states mais elaborados
6. **Transições de View**: Animações entre páginas

---

## 📚 Referências

- **Tailwind CSS**: https://tailwindcss.com
- **Glassmorphism**: https://glassmorphism.com
- **Gradient Generator**: https://cssgradient.io
- **Color Palette**: Tailwind Slate + Accent Colors

---

*Documentação criada em: Janeiro 2024*
*Versão: 2.0*
*Designer: AI Assistant*

