# 📋 Histórico de Alterações: Stack Moderna, Apple Dock e Layout Desktop

Este documento registra todas as alterações técnicas, decisões arquiteturais, bugs corrigidos e novas capacidades adicionadas ao frontend (`igreja-financas-fe`) durante a implementação da versão Desktop e da barra de navegação Apple Dock.

---

## 1. 🎯 Motivação e Objetivos

- **Transição de Casca:** O projeto original foi concebido de forma 100% mobile-first (coluna estreita central de 720px, gavetas inferiores e barra de navegação simples).
- **Compatibilidade com Templates Modernos:** Capacitar o projeto a importar componentes e templates do ecossistema moderno (v0, 21st.dev, shadcn/ui).
- **Experiência Desktop Rica:** Aproveitar monitores widescreen (1080p / 2K) com grid multi-colunas, eliminando o visual de "celular esticado no monitor" sem gerar regressão ou quebras no mobile.

---

## 2. 📦 Expansão da Stack Tecnológica

### 2.1. Tailwind CSS v3 & PostCSS
- **Por que a v3.4?** Escolhida propositalmente em vez da v4 para manter **100% de compatibilidade** com templates existentes de shadcn/ui e plugins legados como `tailwindcss-animate`, utilizando o arquivo clássico `tailwind.config.js`.
- **Mapeamento de Cores:** Os tokens do Tailwind foram integrados diretamente com as variáveis CSS do Design System da igreja (`var(--panel)`, `var(--blue)`, `var(--red)`, `var(--bg)`, etc.), permitindo que classes como `bg-panel`, `text-blue` ou `border-panel-line` alternem automaticamente entre Dark Mode e Light Mode.

### 2.2. Suporte Híbrido a TypeScript
- Adicionado `typescript` e `@types/node` com configuração em `tsconfig.json`.
- **Configuração permissiva:** `allowJs: true`, `checkJs: false` e `jsx: react-jsx`. Arquivos legados em `.jsx`/`.js` e novos componentes em `.tsx`/`.ts` convivem harmoniosamente sem erros bloqueantes de compilação.
- **Path Alias `@`:** Mapeado no `vite.config.js` (`@` -> `./src`) e no `tsconfig.json` para suportar as convenções do shadcn (`@/components/...` e `@/lib/utils`).

### 2.3. Base do shadcn/ui
- **Pacotes utilitários instalados:** `clsx`, `tailwind-merge`, `class-variance-authority`.
- **Utilitário canônico:** Criado `src/lib/utils.ts` contendo a função `cn(...)`.
- **Manifesto:** Criado `components.json` configurado para o diretório `src/components/ui`.
- **Peer Dependencies:** Instalações realizadas com `--legacy-peer-deps` devido ao uso da versão canary do React 19 no projeto.

---

## 3. 🧭 Implementação da Apple Style Dock (`dock.tsx` & `AppDockNav.tsx`)

### 3.1. Correção Crítica do Bug do Template Original
O template da Dock utilizava `useTransform` do `framer-motion` atrelado a `mouseX = useMotionValue(Infinity)`:
- **O problema identificado:** Na inicialização (quando o mouse ainda não está sobre o componente), o valor de `mouseX` é `Infinity`. O cálculo `(val - domRect.x - domRect.width / 2)` resultava em `Infinity`. O `useTransform` padrão extrapolava linearmente a escala para valores negativos (`-Infinity`), corrompendo a largura dos ícones no `useSpring` e fazendo os botões colapsarem ou sumirem da tela.
- **A correção:** Foi adicionado tratamento defensivo `if (!ref.current || val === Infinity || !Number.isFinite(val)) return distance + 100;` e a diretiva `{ clamp: true }` em todas as transformações de largura e altura.

### 3.2. Prevenção de Falhas de CSS e Separação Responsiva Estrita
- **Ordem de Precedência na Cascata CSS:** Foi corrigida a sobreposição onde regras com `!important` no final do arquivo sobrepunham o `@media (min-width: 1024px)`. A regra base `.dock-nav-fixed { display: none !important; }` foi posicionada antes do bloco desktop `@media (min-width: 1024px)`, garantindo chaveamento limpo e imediato.
- **Correção do Listener de Tema:** Removido listener duplicado de `theme-change` em `App.jsx` que causava `ReferenceError: setTheme is not defined` e recursão infinita, delegando a sincronização 100% ao hook oficial `useTheme`.
- **Resultado Adaptativo Final:**
  - **No Celular (< 1024px):** A Apple Dock fica **100% oculta**. A barra inferior móvel (`BottomTabBar`) exibe exatamente as **4 abas originais** (`Início`, `Extrato`, `Análise` e `Conta`) com navegação fluida para polegar, acompanhada pelo botão flutuante **FAB (+)** no canto inferior direito.
  - **No Desktop (>= 1024px):** A barra móvel e o FAB são **completamente ocultados**. A **Apple Style Dock** assume o controle centralizada no rodapé com as 7 ações diretas, animação de ampliação com o mouse e o Dashboard expandido em **2 colunas** (1200px).

### 3.3. Estrutura dos 7 Itens da Dock
1. **➕ Novo Lançamento:** Botão circular azul de destaque com sombra glow (`var(--shadow-glow-blue)`); abre o modal/gaveta de dízimos, ofertas e despesas.
2. **🏠 Início:** Alterna para o Dashboard com badge de status ativo.
3. **🧾 Extrato:** Acesso à lista completa de transações com filtros em tempo real.
4. **⚙️ Gerenciar:** Atalho direto para a Central de Gestão (`/gerenciar.html`).
5. **🖨️ Imprimir:** Aciona a impressão do relatório oficial A4.
6. **🌙/☀️ Alternar Tema:** Alterna instantaneamente entre Modo Escuro e Modo Claro.
7. **🚪 Sair:** Logout seguro do usuário com confirmação de rota.

> **Simplificações aplicadas:**
> - A aba antiga de "Análises" foi removida da navegação a pedido do usuário.
> - O botão flutuante antigo (`FAB`) foi removido do rodapé, unificando a ação de novo lançamento dentro da própria Dock.

---

## 4. 🖥️ Arquitetura do Layout Desktop

### 4.1. Grid Multi-Colunas (`@media (min-width: 1024px)`)
- **Largura Expandida:** A casca `.app-main` deixa de ficar restrita a 720px e expande para até **1200px** em telas grandes.
- **Distribuição em 2 Colunas no Dashboard:**
  - **Linha 1 (Métricas):** `BalanceSummaryCard` (Balanço Geral / Superávit) à esquerda e `QuickStatsRow` (Dízimos, Ofertas e Despesas) à direita.
  - **Linha 2 (Detalhamento):** `MiniChartBar` (Despesas por Categoria) à esquerda e `RecentTransactions` (Últimas Movimentações) à direita.
- **Mobile Preservado:** Em telas menores que 1024px, os elementos continuam empilhados de forma vertical fluida para navegação com o polegar.

### 4.2. Clearance de Rolagem (Scroll Padding)
- Para evitar que a Dock fixa no rodapé cubra informações ou valores na parte inferior da tela, o padding inferior do contêiner principal foi ajustado:
  - **Mobile:** `calc(110px + var(--safe-bottom))`
  - **Desktop:** `140px`

---

## 5. 📁 Resumo dos Arquivos Criados e Alterados

| Arquivo | Tipo | Descrição |
| :--- | :--- | :--- |
| [`tailwind.config.js`](file:///c:/Users/aurel/OneDrive/Documents/FinanciasIgreja/igreja-financas-fe/tailwind.config.js) | Novo | Configuração do Tailwind v3, Dark Mode e tokens de cores da igreja. |
| [`postcss.config.js`](file:///c:/Users/aurel/OneDrive/Documents/FinanciasIgreja/igreja-financas-fe/postcss.config.js) | Novo | Configuração dos plugins PostCSS e Autoprefixer. |
| [`tsconfig.json`](file:///c:/Users/aurel/OneDrive/Documents/FinanciasIgreja/igreja-financas-fe/tsconfig.json) | Novo | Configuração flexível de TypeScript com suporte a TSX e JSX. |
| [`components.json`](file:///c:/Users/aurel/OneDrive/Documents/FinanciasIgreja/igreja-financas-fe/components.json) | Novo | Manifesto de configuração padrão do CLI do shadcn/ui. |
| [`src/lib/utils.ts`](file:///c:/Users/aurel/OneDrive/Documents/FinanciasIgreja/igreja-financas-fe/src/lib/utils.ts) | Novo | Função utilitária canônica `cn(...)` com `clsx` e `tailwind-merge`. |
| [`src/components/ui/dock.tsx`](file:///c:/Users/aurel/OneDrive/Documents/FinanciasIgreja/igreja-financas-fe/src/components/ui/dock.tsx) | Novo | Componente interativo Apple Dock com `framer-motion` e matemática corrigida. |
| [`src/components/ui/demo.tsx`](file:///c:/Users/aurel/OneDrive/Documents/FinanciasIgreja/igreja-financas-fe/src/components/ui/demo.tsx) | Novo | Exemplo de demonstração de referência da Dock. |
| [`src/components/layout/AppDockNav.tsx`](file:///c:/Users/aurel/OneDrive/Documents/FinanciasIgreja/igreja-financas-fe/src/components/layout/AppDockNav.tsx) | Novo | Navegação oficial com os 7 itens e ações do sistema. |
| [`vite.config.js`](file:///c:/Users/aurel/OneDrive/Documents/FinanciasIgreja/igreja-financas-fe/vite.config.js) | Modificado | Adicionado path alias `@` para `./src`. |
| [`src/index.css`](file:///c:/Users/aurel/OneDrive/Documents/FinanciasIgreja/igreja-financas-fe/src/index.css) | Modificado | Diretivas Tailwind, classes defensivas da Dock e regras de grid desktop (1200px). |
| [`src/App.jsx`](file:///c:/Users/aurel/OneDrive/Documents/FinanciasIgreja/igreja-financas-fe/src/App.jsx) | Modificado | Substituição da barra inferior pelo `AppDockNav`, remoção do FAB e aba de análise, e organização dos cards em grid desktop. |
| [`package.json`](file:///c:/Users/aurel/OneDrive/Documents/FinanciasIgreja/igreja-financas-fe/package.json) | Modificado | Dependências do Tailwind v3, TypeScript, Framer Motion e shadcn. |
