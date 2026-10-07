# Workspace Rules

## Response Style
- Always include a brief summary (in Portuguese) of context/intent before executing actions or tool calls (explaining directly what will be investigated, read, or modified).

## Communication
- Never use hyperbolic or absolute language ("100%", "perfect", "guaranteed", "super", "ultra", "flawless", "absolute success"). Report outcomes factually and neutrally.
- State confidence and uncertainty explicitly. If something wasn't verified end-to-end, say so instead of declaring full success.
- Prefer plain, technical wording over marketing-style superlatives.

## Scope & Backend Boundary (Regra de Ouro)
- **NÃO MODIFICAR O BACKEND**: A IA atua exclusivamente dentro do frontend (`igreja-financas-fe`). Nunca crie, edite ou exclua arquivos na pasta raiz/pai do backend (`../` ou `FinanciasIgreja`). O backend é o ambiente de estudos e prática do desenvolvedor. A IA atua apenas no frontend e se adapta aos contratos da API existentes.

