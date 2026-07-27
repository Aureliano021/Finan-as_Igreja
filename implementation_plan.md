# Planejamento do Frontend - Gestão Financeira de Igreja (Vite + React)

Estruturação do aplicativo Frontend para a prestação de contas e visualização financeira mensal (Dízimos, Ofertas e Despesas), consumindo a API em Python (FastAPI/SQLAlchemy).

---

## User Review Required

> [!IMPORTANT]
> **Configuração de CORS no Backend (Python/FastAPI)**
> No arquivo `controller.py`, o `CORSMiddleware` foi importado na linha 6, mas ainda não foi adicionado à aplicação `app`. Para que o navegador consiga fazer requisições da porta do React (ex: `http://localhost:5173`) para o backend em `http://localhost:8000`, será necessário adicionar o middleware de CORS no seu código Python:
> ```python
> app.add_middleware(
>     CORSMiddleware,
>     allow_origins=["*"],
>     allow_credentials=True,
>     allow_methods=["*"],
>     allow_headers=["*"],
> )
> ```

> [!NOTE]
> **Mapeamento de Membros nos Dízimos**
> Na tabela `dizimos`, existe a chave estrangeira `membro_id`. No frontend, iremos cruzar a resposta do `GET /dizimos` com o `GET /membros` para exibir o nome do membro (ex: *"João Silva"*) em vez de apenas o ID numérico (*"membro_id: 3"*).

---

## Open Questions

> [!TIP]
> Por favor, avalie os itens abaixo e informe se possui preferências específicas:

1. **Modo Demo / Dados de Exemplo:**
   - Deseja que o Frontend venha com um **Modo Demo (fallback)** ativado caso o backend local não esteja rodando no momento da apresentação/testes?
2. **Detalhamento das Despesas / Categorias:**
   - A tabela `despesas` atualmente possui os campos `id`, `nome`, `valor`, `data`. Na visualização, deseja que o gráfico de despesas agrupe por palavras-chave no nome (ex: *"Luz"*, *"Água"*, *"Manutenção"*, *"Aluguel"*) ou apenas exiba o total acumulado?
3. **Formato de Exportação de Relatório:**
   - Para a prestação de contas, o layout de impressão em PDF estilizado para folha A4 (sem botões da tela, com cabeçalho oficial da igreja) atende bem a necessidade?

---

## Proposed Changes

### Estrutura do Projeto Frontend (`igreja-financas-fe`)

Criaremos o projeto em React + Vite dentro do repositório:
`c:\Users\aurel\OneDrive\Documents\FinanciasIgreja\igreja-financas-fe`

```
igreja-financas-fe/
├── index.html
├── package.json
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── components/
│   │   ├── Navbar.jsx               # Cabeçalho com logo, mês/ano ativo e badge de API
│   │   ├── ApiConfigModal.jsx       # Modal para alterar URL da API (padrão: http://localhost:8000)
│   │   ├── MonthSelector.jsx        # Seletor dinâmico de Mês e Ano
│   │   ├── KpiCards.jsx             # Cards de totais (Entradas, Dízimos, Ofertas, Despesas, Saldo Líquido)
│   │   ├── FinancialCharts.jsx      # Gráficos Recharts (BarChart de Entradas vs Saídas, Donut Chart de distribuição)
│   │   ├── TransactionsTable.jsx    # Abas com tabelas detalhadas (Dízimos com nome do membro, Ofertas, Despesas)
│   │   ├── PrintableReport.jsx      # Visão de impressão em PDF / relatório limpo A4
│   │   └── QuickStatsBadge.jsx      # Indicadores rápidos (dias com mais entradas, média por culto, etc.)
│   ├── services/
│   │   ├── api.js                   # Cliente Axios/Fetch com URL configurável e fallback
│   │   └── utils.js                 # Formatadores de moeda (R$), datas e agrupamentos por mês/ano
│   └── types/                      # Tipagens/Estrutura dos dados
```

---

### Componentes Principais e Funcionalidades

#### 1. **Filtro Mensal Inteligente (`MonthSelector`)**
- Permite selecionar qualquer **Mês** (Janeiro a Dezembro) e **Ano** (2024, 2025, 2026...).
- Botões de navegação rápida: *"< Mês Anterior"*, *"Mês Atual"*, *"> Próximo Mês"*.
- Todos os cards, gráficos e relatórios reagem instantaneamente ao mês selecionado.

#### 2. **Cards de Resumo Financeiro (KPIs)**
- **Total de Entradas**: Soma de (Dízimos + Ofertas do Mês)
- **Total de Dízimos**: Soma dos dízimos do mês + contagem de lançamentos
- **Total de Ofertas**: Soma das ofertas do mês + contagem de lançamentos
- **Total de Despesas**: Soma das despesas do mês
- **Saldo do Mês**: Entradas - Despesas (com indicador visual em Verde se Positivo ou Vermelho se Negativo).

#### 3. **Painel de Gráficos Interativos (`Recharts`)**
- **Comparativo Entradas x Saídas**: Gráfico de colunas ilustrando a saúde financeira.
- **Distribuição de Receitas**: Dízimos vs Ofertas.
- **Evolução Diária do Mês**: Linha do tempo mostrando os dias do mês em que ocorreram dízimos, ofertas e pagamentos.

#### 4. **Tabelas Detalhadas com Busca e Cruzamento de Dados**
- Aba **Dízimos**: Exibe a data, valor e o **nome do membro** correspondente (buscado na tabela de membros).
- Aba **Ofertas**: Exibe a data e o valor da oferta.
- Aba **Despesas**: Exibe a descrição/nome da despesa, data e valor.
- Filtro de busca por nome ou data em cada tabela.

#### 5. **Exportação de Relatório de Prestação de Contas**
- **Botão Impressão / Salvar PDF**: Gera uma folha A4 formatada com cabeçalho oficial, tabelas resumidas e assinatura da tesouraria para impressão ou envio no WhatsApp.
- **Botão Exportar Imagem (PNG)**: Captura os visuais e resumo financeiro para compartilhamento rápido.

#### 6. **Gerenciador da Conexão Backend (`ApiConfigModal`)**
- Permite checar se a API em Python está online.
- Permite trocar a URL da API caso você rode em portas diferentes (ex: `http://localhost:8000`).

---

## Verification Plan

### Testes Manuais de Interface & Dados
1. **Inicialização:** Rodar `npm run dev` no servidor frontend Vite.
2. **Integração com API Python:** Testar o consumo real dos endpoints (`/membros`, `/dizimos`, `/despesas`, `/ofertas`).
3. **Mecanismo de Filtro por Mês/Ano:** Garantir que trocar o mês atualiza corretamente o somatório de cada item.
4. **Resolução e Responsividade:** Testar layout em telas Desktop e telas menores.
5. **Relatório de Impressão:** Verificar a formatação das páginas ao acionar o comando de impressão (Ctrl+P / Salvar PDF).
