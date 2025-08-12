# Backend Fastify Template 🚀

> Template para iniciar APIs RESTful escaláveis com **TypeScript**, **Fastify**, **Prisma** e **PostgreSQL**, seguindo boas práticas e com estrutura pronta para produção.

[![Use this template](https://img.shields.io/badge/-Use%20this%20template-brightgreen?style=for-the-badge&logo=github)](https://github.com/netorossetti/backend-fastify-template/generate)

---

## 🔧 Tecnologias incluídas

- **Node.js** + **TypeScript**
- **Fastify**: framework web leve, performático e TypeScript-ready :contentReference[oaicite:1]{index=1}
- **FastifySwagger** + `@fastify/swagger`: documentação de rotas com swagger
- **ZodTypeProvider** + `@fastify/fastify-type-provider-zod`: validações de schema com inferência de tipos
- **Prisma**: ORM moderno para modelagem de dados com PostgreSQL
- **dotenv** para gerenciamento de variáveis de ambiente
- Estrutura pronta para criação de rotas, entidades e migrações

---

## 🧠 Conceitos Arquiteturais

Este template segue boas práticas e padrões de projeto como:

- 🏗️ **DDD** (Domain-Driven Design)
- 🛠️ **Factory Pattern**
- 🧰 **SOLID Principles**
- 📦 Separação em camadas: Domain, Application, Infrastructure

---

## 📁 Estrutura do projeto

```text
📦 root
 ┣ prisma/
 ┃ ┣ migrations/
 ┃ ┣ schema.prisma
 ┣ src/
 ┃ ┣ core/                 ← camada de interfaces, helpes e libs da aplicação
 ┃ ┣ domain/               ← camada de abstração da logica da aplicação
 ┃ ┣ infra/                ← camada de implementação dos casos de uso, repositórios e servicos do dominio da aplicação
 ┃ ┣ server.ts             ← arquivo principal
 ┣ test/                   ← estruturação e configuração de testes e2e
 ┣ .env.example
 ┣ package.json
 ┣ tsconfig.json
 ┗ README.md
```

---

## 📚 API - Estrutura de Rotas

### 🔐 Autenticação (`/auth`)

| ✅  | Token | Método | Rota                        | Descrição                               |
| --- | ----- | ------ | --------------------------- | --------------------------------------- |
| ✅  | 🌐    | POST   | `/auth/login`               | Autentica o usuário e retorna o token   |
| ✅  | 🔐    | POST   | `/auth/refresh-token`       | Gera novo token com refresh token       |
| ✅  | 🔐    | POST   | `/auth/logout`              | Encerra a sessão atual                  |
| ✅  | 🌐    | POST   | `/auth/forgot-password`     | Inicia fluxo de recuperação de senha    |
| ✅  | 🌐    | POST   | `/auth/reset-password`      | Redefine senha com token de recuperação |
| ✅  | 🔐    | PUT    | `/users/me/change-password` | Alterar senha do usuário                |

---

### 🏢 Conta / Tenant (`/tenants`)

| ✅  | Token | Método | Rota                       | Descrição                                                |
| --- | ----- | ------ | -------------------------- | -------------------------------------------------------- |
| ✅  | 🔐    | GET    | `/tenants`                 | Lista as contas do usuário proprietário ou administrador |
| ✅  | 🌐    | POST   | `/tenants`                 | Cria uma nova conta                                      |
| ✅  | 🔐    | POST   | `/tenants/select`          | Seleciona nova conta para a sessão atual                 |
| ✅  | 🔐    | PATCH  | `/tenants/:id`             | Atualiza informações da conta                            |
| ✅  | 🔐    | POST   | `/tenants/:id/inactivate`  | Cancelar conta                                           |
| ✅  | 🔐    | POST   | `/tenants/:id/reactivate ` | Reativar uma conta                                       |

---

### 👤 Usuário (`/users`)

| ✅  | Token | Método | Rota        | Descrição                            |
| --- | ----- | ------ | ----------- | ------------------------------------ |
| ✅  | 🔐    | GET    | `/users/me` | Retorna dados do usuário autenticado |
| ✅  | 🔐    | PATCH  | `/users/me` | Atualiza dados do próprio usuário    |

---

### 👥 Membros de Tenant (`/memberships`)

| ✅  | Token | Método | Rota                     | Descrição                                     |
| --- | ----- | ------ | ------------------------ | --------------------------------------------- |
| ✅  | 🔐    | GET    | `/memberships/users`     | (Admin) Lista usuários do tenant atual        |
| ✅  | 🔐    | POST   | `/memberships/users`     | (Admin) Cria novo usuário no tenant           |
| ✅  | 🔐    | PATCH  | `/memberships/users/:id` | (Admin) Atualiza permissões ou role do membro |
| ✅  | 🔐    | DELETE | `/memberships/users/:id` | (Admin) Remove membro do tenant               |

---

### 💡 Observações

- Todas as rotas protegidas requerem autenticação via Bearer Token:  
  `Authorization: Bearer <token>`

- A seleção de tenant via `/tenants/select` define o escopo de execução das demais rotas protegidas.

- Perfis e permissões são aplicados por tenant.
