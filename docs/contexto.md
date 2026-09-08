# 📖 Contexto e Arquitetura do Projeto: Finanças IMW

Este documento consolida a visão geral, regras de negócio, arquitetura técnica, design system e fluxos do sistema de **Gestão Financeira e Prestação de Contas da Igreja Metodista Wesleyana de Itupeva**.

---

## 1. 🏛️ Visão Geral do Sistema
- **Instituição:** Igreja Metodista Wesleyana de Itupeva.
- **Objetivo:** Controle financeiro eclesiástico transparente, rápido e confiável, permitindo lançamentos individuais e em lote pós-culto, relatórios para prestação de contas aos membros e assembleias, além de central administrativa para tesouraria e pastor presidente.
- **Stack Tecnológico:**
  - **Frontend:** React 19, Vite, Tailwind CSS v3 + CSS Modular (Design System Fintech Dark/Light).
  - **Ícones:** Lucide React.
  - **Exportação:** `html2canvas` (geração de imagens PNG em 2x retina) e folha de estilo para impressão A4.
  - **Deploy & Infraestrutura de Produção (Servidor Autônomo Redmi Note 8):**
    - A aplicação de produção opera de forma 100% autônoma em um smartphone **Xiaomi Redmi Note 8 (`ginkgo`)** dedicado atuando como mini-servidor local na igreja.
    - **Sistema Operacional & Kernel:** Android 16 (LineageOS 23.2) com **Kernel Linux 4.14 customizado e compilado nativamente** contendo todas as flags ativas para Docker (`CONFIG_NAMESPACES`, `CONFIG_CGROUPS`, `CONFIG_SYSVIPC`, `CONFIG_POSIX_MQUEUE`, `CONFIG_OVERLAY_FS`).
    - **Ambiente de Execução:** Debian Linux em `chroot` gerenciado via script de auto-boot do Magisk (`/data/adb/service.d/autostart_debian.sh`).
    - **Orquestração Docker Compose (Modo Host):**
      - `igreja_frontend`: Container Nginx com a build estática do React na porta 80 (com proxy reverso `/api/` direcionando internamente para a porta 8000).
      - `igreja_backend`: Container Python com FastAPI na porta 8000.
      - `igreja_postgres`: Container PostgreSQL 16 na porta 5432 (banco `bi_learning`).
    - **IP do Servidor na Rede:** `http://192.168.1.83` (Web) e `http://192.168.1.83:8000/docs` (Swagger).
    - *(Para o guia detalhado da compilação do Kernel e automações do Magisk, consulte [PLANO_KERNEL_DOCKER.md](file:///c:/Users/aurel/OneDrive/Documents/FinanciasIgreja/igreja-financas-fe/docs/PLANO_KERNEL_DOCKER.md)).*
  - **Ambiente de Desenvolvimento Local (PC):**
    - Frontend rodando via Vite Dev Server na porta 5173.
    - Backend FastAPI executado localmente. Para aceitar requisições de outros dispositivos da rede (como testes no celular), foi configurada a regra de entrada no Firewall do Windows intitulada **`API Finanças Igreja`** na porta TCP **`9000`**.

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

### 📱💻 Arquitetura de Layout: Mobile-First e Desktop Unificado
A interface adota a estratégia **Universal Responsive App Shell**:
- **Experiência Mobile:** Ocupa 100% da viewport vertical e horizontal com suporte a safe areas (`env(safe-area-inset-*)`), navegação por barra fixa inferior (`bottom-tab-bar`), botão de ação flutuante (`fab-button`) e formulários deslizantes estilo gaveta (`BottomSheet`).
- **Experiência Desktop:** Centraliza o fluxo em uma coluna otimizada de aplicativo com largura máxima de `720px` (`max-width: 720px; margin: 0 auto;`), padrão consagrado em web apps de alta produtividade (como Telegram Web e fintechs). Todas as ações, modais e gráficos funcionam com a mesma fluidez em qualquer resolução.
- **Relatório e Impressão:** Ao acionar a impressão A4 (`@media print`), os limites da casca do app são desativados e o documento se expande na folha com cabeçalho oficial e tabelas completas.

---

## 3. 📱 Módulos e Páginas da Aplicação

### 3.1. Dashboard Principal (`/index.html` -> `App.jsx`)
- **TopBar:** Identificador da igreja, status de conexão (bolinha verde/vermelha), botão de alternar tema (Sol ☀️ / Lua 🌙), botão de refresh e avatar do usuário logado.
- **Seletor de Período (`PeriodPicker`):** Filtra os dados por **Mês/Ano** (detecta e seleciona automaticamente o **último mês com registros cadastrados** no banco de dados), **Ano Inteiro** ou **Todos os lançamentos**.
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

## 4. 🔴 Detecção e Tratamento de Servidor Offline (Modo Sob Demanda)

Como medida de proteção contra ataques e economia operacional, o servidor da aplicação funciona em **modo sob demanda** (ligado pelo administrador quando os usuários forem manusear o sistema):

1. **Verificação Pré-Login (`LoginPage.jsx`):**
   - Ao abrir a tela de login, o frontend realiza automaticamente um health check (`checkApiHealth`).
   - Se o servidor estiver offline, a inserção de dados é **completamente bloqueada** (os formulários de login/cadastro e a troca de abas são ocultados).
   - Exibe exclusivamente um card informativo de segurança:
     > *"Por segurança contra acessos indevidos e economia, o servidor permanece desligado quando não está em uso. Peça ao administrador para ligá-lo antes de entrar."*
   - Disponibiliza botões de ação:
     - **🟢 Pedir no WhatsApp:** Solicita o acionamento imediato ao administrador com mensagem pronta.
     - **🔄 Recarregar / Testar Conexão:** Valida se o servidor voltou a responder ou recarrega a página inteira.
     - **⚙️ Configurar API:** Permite alterar o endpoint configurado sem precisar de login.

2. **Monitoramento Contínuo e Tela Offline Pós-Login (`App.jsx` / `DataEditorPage.jsx`):**
   - Durante o uso do aplicativo, um serviço de verificação em segundo plano (*heartbeat* a cada 20s e sempre que o usuário retorna o foco à aba) monitora a saúde do backend.
   - Caso o backend seja desligado com o usuário já conectado, a interface **bloqueia imediatamente o painel de dados** e renderiza o card de **Servidor Offline**:
     - **Ícone pulsante com badge de alerta:** Informa que o sistema está em modo sob demanda e que o servidor foi desligado.
     - **🟢 Botão WhatsApp:** Abre conversa direta com o administrador solicitando que ligue o backend.
     - **🔄 Recarregar / Testar Conexão:** Valida se o backend retornou. Assim que o servidor religar, o painel é restaurado automaticamente com todos os dados atualizados.
     - **⚙️ Configurar API:** Permite alterar o endereço do servidor se necessário.

3. **Status de Conexão no Frontend (`connectionStatus.status`):**
   - `'online'`: Backend operacional -> Carrega dashboard completo.
   - `'offline'`: Backend desligado/sem rede -> Bloqueia tela vazia e abre `StatusCard` de offline.
   - `'pending_approval'`: Usuário aguardando aprovação -> Exibe card de aprovação de cadastro.
   - `'unauthenticated'`: Sem token ou token expirado -> Redireciona para o login.

---

## 5. 🔐 Autenticação e Gestão de Usuários (`/login.html`)
- **Tela de Login / Cadastro:** Formulário com validações, verificação prévia de status do servidor sob demanda, alternador de tema e tratamento de falhas.
- **Níveis de Acesso do Usuário:**
  - `aceito`: Acesso total às consultas e lançamentos.
  - `pendente`: Cadastro criado, aguarda aprovação pelo administrador.
  - `negado`: Acesso restrito pela liderança.

---

## 6. 🌐 Endpoints Mapeados do Backend

| Método | Endpoint | Função |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check público (retorna `{"status": "ok"}`). |
| `POST` | `/auth/login` | Autenticação com e-mail e senha (retorna JWT e dados do usuário). |
| `POST` | `/auth/register` | Criação de conta (mínimo 8 caracteres na senha). |
| `GET` | `/membro` | Lista todos os membros cadastrados. |
| `POST` | `/membro` | Cadastro de novo membro (data de nascimento obrigatória). |
| `PATCH` | `/membro/{id}` | Atualização parcial de cadastro de membro. |
| `DELETE` | `/membro/{id}` | Exclusão de membro. |
| `GET` | `/dizimos` | Lista todos os lançamentos de dízimos. |
| `POST` | `/dizimos` | Lançamento individual ou em lote de dízimos. |
| `PATCH` | `/dizimos/{id}` | Edição de registro de dízimo. |
| `DELETE` | `/dizimos/{id}` | Exclusão de registro de dízimo. |
| `GET` | `/ofertas` | Lista todos os lançamentos de ofertas. |
| `POST` | `/ofertas` | Lançamento de ofertas. |
| `PATCH` | `/ofertas/{id}` | Edição de oferta. |
| `DELETE` | `/ofertas/{id}` | Exclusão de oferta. |
| `GET` | `/despesas` | Lista todos os pagamentos e despesas. |
| `POST` | `/despesas` | Lançamento de despesas (suporte a valores decimais com centavos). |
| `PATCH` | `/despesas/{id}` | Edição de despesa. |
| `DELETE` | `/despesas/{id}` | Exclusão de despesa. |

> **Observação de compatibilidade:** O frontend adota `PATCH` como método nativo de atualização em conformidade com as rotas `@router.patch(...)` do FastAPI, mantendo fallback inteligente bidirecional (`PATCH` ↔ `PUT`) caso necessário.

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

---

## 8. 🤖 Regras de Atuação da IA e Escopo de Desenvolvimento (Pair Programming)

Este projeto de frontend (`igreja-financas-fe`) reside dentro da estrutura geral do projeto de gestão financeira da igreja, cujo diretório raiz/pai contém a aplicação backend em Python/FastAPI.

Para garantir o alinhamento com a forma de aprendizado do desenvolvedor e a integridade da aplicação, as seguintes regras são **obrigatórias e inegociáveis**:

### 🚫 1. Proibição Absoluta de Alterar o Backend
- **A IA NUNCA deve criar, editar, alterar ou excluir arquivos do backend** (diretório pai `../` ou arquivos como `controller.py`, `main.py`, `service/`, `models/`, `router/`, `schemas/`, `security/`, `migrations/`, etc.).
- **Motivo Pedagógico e de Controle:** O desenvolvedor é estudante de Engenharia de Software com foco em Backend e BI. Ele programa o backend manualmente para consolidar seu aprendizado (Python, FastAPI, SQLAlchemy, Alembic, PostgreSQL).
- **Como a IA deve atuar em relação ao backend:**
  - Se for necessário suporte ou esclarecimento sobre backend, a IA deve atuar estritamente como **tutora/revisora** (explicar conceitos, comparar com Java/Spring, sugerir boas práticas, pseudocódigo ou perguntas orientadoras), **sem nunca escrever ou alterar o código do backend diretamente**.

### 🔌 2. Adaptação Estrita aos Contratos da API Existente
- O frontend deve se adaptar **exclusivamente aos contratos, rotas e payloads definidos e documentados pelo backend** (vide Seção 6 deste arquivo e [ENDPOINTS_BACKEND.md](file:///c:/Users/aurel/OneDrive/Documents/FinanciasIgreja/igreja-financas-fe/docs/ENDPOINTS_BACKEND.md)).
- O frontend não deve supor nem exigir alterações no backend; ele deve consumir as APIs existentes tratando os tipos, datas no formato `YYYY-MM-DD`, autenticação via `Authorization: Bearer <token>` e respostas de erro/sucesso.

### 🎨 3. Preservação da Identidade Visual e Arquitetura do Frontend
- **Design System Vanilla:** Manter o CSS modular próprio com variáveis nativas (sem introduzir Tailwind CSS).
- **Tipografia e Cores:** Seguir rigorosamente `Space Grotesk`, `Inter`, `IBM Plex Mono` e os temas Dark/Light mode.
- **Detecção Sob Demanda:** Manter a proteção de verificação de servidor offline/online com bloqueio de interface quando o backend estiver desligado.

