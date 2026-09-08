# 📡 Documentação Oficial dos Endpoints da API (Backend FastAPI)

Esta documentação descreve os **19 endpoints** do backend (health check, autenticação e operações CRUD para membros, despesas, dízimos e ofertas).

---

## 🔒 Autenticação e Cabeçalhos Obrigatórios

Todos os endpoints protegidos exigem os seguintes cabeçalhos HTTP:

```http
Authorization: Bearer SEU_TOKEN
Content-Type: application/json
```

> **Formato de Datas:** Todas as datas devem ser enviadas no formato `YYYY-MM-DD`.

---

## 🩺 1. Health Check (Público)

### `GET /health`
Verifica se o servidor FastAPI está ativo e respondendo.

- **Autenticação:** Não necessária.
- **Resposta (JSON):**
```json
{
  "status": "ok"
}
```

---

## 🔑 2. Autenticação

### `POST /auth/login`
Autentica o usuário e retorna o token JWT.

**Body (JSON):**
```json
{
  "email": "usuario@email.com",
  "senha": "123456"
}
```

---

### `POST /auth/register`
Cadastra um novo usuário no sistema (a senha deve ter no mínimo 8 caracteres).

**Body (JSON):**
```json
{
  "nome": "João da Silva",
  "email": "joao@email.com",
  "senha": "senhaSegura123"
}
```

---

## 👥 2. Membros

### `GET /membro`
Lista todos os membros cadastrados.

- **Body:** Sem body.

---

### `POST /membro`
Cadastra um novo membro.

**Body (JSON):**
```json
{
  "nome": "Maria da Silva",
  "data_nascimento": "1990-05-20",
  "membro": true,
  "batizado": true,
  "uniao_estavel": false
}
```

---

### `PATCH /membro/{membro_id}` (ou `PUT`)
Atualiza parcialmente um membro existente.

**Body (JSON - Campos opcionais):**
```json
{
  "nome": "Maria Silva Santos",
  "batizado": true
}
```

**Campos disponíveis:**
- `nome`
- `data_nascimento`
- `membro`
- `batizado`
- `uniao_estavel`

---

### `DELETE /membro/{membro_id}`
Remove um membro cadastrado pelo ID.

- **Body:** Sem body.

---

## 💸 4. Despesas

### `GET /despesas`
Lista todas as despesas registradas.

- **Body:** Sem body.

---

### `POST /despesas`
Registra uma nova despesa.

**Body (JSON):**
```json
{
  "nome": "Conta de energia",
  "data": "2026-08-05",
  "valor": 250.50
}
```

---

### `PATCH /despesas/{despesas_id}` (ou `PUT`)
Atualiza uma despesa existente.

**Body (JSON):**
```json
{
  "nome": "Conta de energia atualizada",
  "data": "2026-08-05",
  "valor": 300.00
}
```

---

### `DELETE /despesas/{despesas_id}`
Remove uma despesa registrada pelo ID.

- **Body:** Sem body.

---

## 💰 5. Dízimos

### `GET /dizimos`
Lista todos os dízimos lançados.

- **Body:** Sem body.

---

### `POST /dizimos`
Lança um novo dízimo.

**Body (JSON):**
```json
{
  "membro_id": 1,
  "valor": 350.5,
  "data": "2026-08-05"
}
```

---

### `PATCH /dizimos/{dizimo_id}` (ou `PUT`)
Atualiza um dízimo existente (campos opcionais).

**Body (JSON):**
```json
{
  "valor": 400.0
}
```

**Campos disponíveis:**
- `membro_id`
- `valor`
- `data`

---

### `DELETE /dizimos/{dizimo_id}`
Remove um dízimo lançado pelo ID.

- **Body:** Sem body.

---

## 🎁 6. Ofertas

### `GET /ofertas`
Lista todas as ofertas lançadas.

- **Body:** Sem body.

---

### `POST /ofertas`
Lança uma nova oferta.

**Body (JSON):**
```json
{
  "valor": 150.75,
  "data": "2026-08-05"
}
```

---

### `PATCH /ofertas/{oferta_id}` (ou `PUT`)
Atualiza uma oferta existente.

**Body (JSON):**
```json
{
  "valor": 200.0,
  "data": "2026-08-05"
}
```

---

### `DELETE /ofertas/{oferta_id}`
Remove uma oferta lançada pelo ID.

- **Body:** Sem body.

---

## 📊 Resumo de Endpoints

Ao todo, são **19 endpoints**:
- **1** de verificação de integridade (`/health`)
- **2** de autenticação (`/auth/login`, `/auth/register`)
- **16** de operações CRUD (`/membro`, `/despesas`, `/dizimos`, `/ofertas`)
