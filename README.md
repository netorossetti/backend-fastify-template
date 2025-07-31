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
