# 📖 Contexto e Arquitetura do Projeto: Finanças IMW

Este documento consolida a visão geral, regras de negócio, arquitetura técnica, design system e fluxos do sistema de **Gestão Financeira e Prestação de Contas da Igreja Metodista Wesleyana de Itupeva**.

---

## 1. 🏛️ Visão Geral do Sistema
- **Instituição:** Igreja Metodista Wesleyana de Itupeva.
- **Objetivo:** Controle financeiro eclesiástico transparente, rápido e confiável, permitindo lançamentos individuais e em lote pós-culto, relatórios para prestação de contas aos membros e assembleias, além de central administrativa para tesouraria e pastor presidente.
- **Stack Tecnológico:**
  - **Frontend:** React 19, Vite, Vanilla CSS modular (Design System próprio com variáveis CSS sem Tailwind).
  - **Ícones:** Lucide React.
  - **Exportação:** `html2canvas` (geração de imagens PNG em 2x retina) e folha de estilo para impressão A4.
  - **Deploy:** Container Docker com Nginx multi-stage build.

---

## 2. 🎨 Identidade Visual e Design System

O projeto adota uma identidade visual moderna estilo **Fintech Eclesiástica** com suporte a dois temas alternáveis instantaneamente:

### 🌗 Paleta de Cores
| Elemento | Modo Escuro (Padrão) | Modo Claro | Significado |
| :--- | :--- | :--- | :--- |
| **Fundo (`--bg`)** | `#0a0e17` | `#f8fafc` | Base da interface |
| **Painéis / Cards (`--panel`)** | `#0f1626` | `#ffffff` | Superfícies elevadas |
| **Bordas (`--panel-line`)** | `#1c2740` | `#e2e8f0` | Linhas de divisão |
| **Azul (`--blue`)** | `#2f6fed` / `#6d95ff` | `#2563eb` / `#1d4ed8` | **Entradas / Dízimos / Ofertas / Superávit** |
| **Vermelho (`--red`)** | `#e63946` / `#ff6b76` | `#dc2626` / `#b91c1c` | **Saídas / Despesas / Déficit / Exclusão** |
| **Textos (`--text`)** | `#e8ecf3` | `#0f172a` | Alto contraste |
| **Subtextos (`--muted`)** | `#6b7a99` | `#64748b` | Informações secundárias |

### 🔤 Tipografia
- **Títulos e Destaques:** `Space Grotesk` (moderno, geométrico).
- **Textos de Interface e Formulários:** `Inter` (legibilidade e clareza).
- **Valores Monetários, Datas e Badges:** `IBM Plex Mono` (precisão numérica e alinhamento em tabelas).

---

## 3. 📱 Módulos e Páginas da Aplicação

### 3.1. Dashboard Principal (`/index.html` -> `App.jsx`)
- **TopBar:** Identificador da igreja, status de conexão (bolinha verde/vermelha), botão de alternar tema (Sol ☀️ / Lua 🌙), botão de refresh e avatar do usuário logado.
- **Seletor de Período (`PeriodPicker`):** Filtra os dados por **Mês/Ano** (ex: Julho 2026), **Ano Inteiro** ou **Todos os lançamentos**.
- **Card de Balanço Geral (`BalanceSummaryCard`):** Saldo líquido com badge de Superávit/Déficit e barra de proporção visual (Entradas vs Saídas).
- **Estatísticas Rápidas (`QuickStatsRow`):** Totalizadores de Dízimos, Ofertas e Despesas com contadores de lançamentos.
- **Mini Gráfico Comparativo (`MiniChartBar`):** Visualização proporcional empilhada das movimentações do mês.
- **Histórico Recente (`RecentTransactions`):** Lista rápida das últimas movimentações com badge de valor formatado.
- **Aba Extrato (`TransactionsList`):** Listagem com busca em tempo real, filtro por tipo (Todos, Dízimos, Ofertas, Despesas) e totais filtrados.
- **Aba Análises (`IncomeVsExpense` / `CategoryBreakdown`):** Gráficos analíticos comparativos e distribuição por categorias.
- **Aba Conta:** Acesso à Central de Gestão, Impressão A4, Exportação PNG, Configuração de API, Alternador de Aparência e Logout.

### 3.2. Botão Flutuante e Lançamentos Rápidos (`FAB.jsx` + `LaunchBottomSheet.jsx`)
- **Dízimos (`TithesForm.jsx`):**
  - *Modo Individual:* Seleção de membro com busca interativa, data, valor e observações.
  - *Modo Lote (Pós-culto):* Adição rápida de múltiplos membros e valores simultaneamente com totalizador em tempo real.
- **Ofertas (`OfferForm.jsx`):**
  - Tipo de culto (Culto de Celebração, Doutrina, Jovens, Missões, Escola Dominical, etc.), data e valor.
- **Despesas (`ExpenseForm.jsx`):**
  - *Modo Individual:* Descrição, categoria, valor, data e comprovante/observação.
  - *Modo Lote:* Lançamento em série de várias despesas com cálculo dinâmico de soma total.

### 3.3. Central de Gestão Administrativa (`/gerenciar.html` -> `DataEditorPage.jsx`)
- **4 Abas de Gestão CRUD:** Membros, Dízimos, Ofertas e Despesas.
- **Filtro de Data Integrado:** Permite focar em períodos específicos na administração.
- **Busca em Tempo Real:** Filtra membros por nome/telefone e lançamentos por descrição/membro.
- **Modais Seguros:** Edição inline (`EditRecordSheet`, `MemberFormSheet`) e exclusão protegida com confirmação dupla (`ConfirmSheet`).

### 3.4. Relatórios e Exportação
- **Impressão A4 (`PrintableReport.jsx`):** Relatório formatado com cabeçalho oficial `"IGREJA METODISTA WESLEYANA ITUPEVA"`, quadros de resumo, tabelas de dízimos, ofertas e despesas. *(Bloco de assinaturas removido conforme especificação do usuário)*.
- **Exportação PNG (`exportUtils.js`):** Gera imagem de alta fidelidade (.png) renderizada em 2x retina pronta para envio via WhatsApp para o conselho fiscal/membros.

---

## 4. 🔴 Detecção e Tratamento de Servidor Offline

Para garantir que o usuário nunca fique confuso quando a API local/servidor estiver desligado:

1. **Mensagem Oficial Exibida:**
   > *"O servidor da aplicação está offline no momento. Entre em contato com o administrador para ligar o sistema."*

2. **Tela Dedicada de Status (`StatusCard.jsx`):**
   - **Ícone pulsante** em tom avermelhado indicando ausência de conexão.
   - **🟢 Botão WhatsApp:** Abre conversa direta com o administrador com texto pré-formatado:
     `"Olá! Estou tentando acessar o aplicativo de Finanças da Igreja Metodista Wesleyana, mas o servidor está offline. Poderia ligar o sistema, por favor?"`
   - **📋 Copiar E-mail:** Atalho rápido para copiar o e-mail do suporte.
   - **🔄 Tentar reconectar:** Botão de reteste com timeout rápido (3.5s) que valida a volta do backend sem precisar atualizar a página inteira.
   - **⚙️ Configurar Endereço da API:** Permite alterar o host/porta configurado no `localStorage`.

3. **Status de Conexão no Frontend (`connectionStatus.status`):**
   - `'online'`: Backend operacional -> Carrega dashboard completo.
   - `'offline'`: Backend desligado/sem rede -> Bloqueia tela vazia e abre `StatusCard` de offline.
   - `'pending_approval'`: Usuário aguardando aprovação -> Exibe card de aprovação de cadastro.
   - `'unauthenticated'`: Sem token ou token expirado -> Redireciona para o login.

---

## 5. 🔐 Autenticação e Gestão de Usuários (`/login.html`)
- **Tela de Login / Cadastro:** Formulário com validações, alternador de tema e tratamento de falhas.
- **Níveis de Acesso do Usuário:**
  - `aceito`: Acesso total às consultas e lançamentos.
  - `pendente`: Cadastro criado, aguarda aprovação pelo administrador.
  - `negado`: Acesso restrito pela liderança.

---

## 6. 🌐 Endpoints Mapeados do Backend

| Método | Endpoint | Função |
| :--- | :--- | :--- |
| `POST` | `/auth/login` | Autenticação com e-mail e senha (retorna JWT e dados do usuário). |
| `POST` | `/auth/register` | Criação de nova conta de usuário. |
| `GET` | `/membro` | Lista todos os membros cadastrados. |
| `POST` | `/membro` | Cadastro de novo membro. |
| `PUT` | `/membro/{id}` | Atualização de cadastro de membro. |
| `DELETE` | `/membro/{id}` | Exclusão de membro. |
| `GET` | `/dizimos` | Lista todos os lançamentos de dízimos. |
| `POST` | `/dizimos` | Lançamento individual ou em lote de dízimos. |
| `PUT` | `/dizimos/{id}` | Edição de registro de dízimo. |
| `DELETE` | `/dizimos/{id}` | Exclusão de registro de dízimo. |
| `GET` | `/ofertas` | Lista todos os lançamentos de ofertas. |
| `POST` | `/ofertas` | Lançamento de ofertas. |
| `PUT` | `/ofertas/{id}` | Edição de oferta. |
| `DELETE` | `/ofertas/{id}` | Exclusão de oferta. |
| `GET` | `/despesas` | Lista todos os pagamentos e despesas. |
| `POST` | `/despesas` | Lançamento de despesas. |
| `PUT` | `/despesas/{id}` | Edição de despesa. |
| `DELETE` | `/despesas/{id}` | Exclusão de despesa. |

---

## 7. 🛠️ Comandos de Desenvolvimento e Produção

```bash
# Rodar em modo de desenvolvimento local
npm run dev

# Validar conformidade de código e linter
npx oxlint src

# Compilar versão de produção
npm run build

# Subir container Nginx via Docker Compose
docker compose up -d --build
```
