import Logger from "src/core/lib/logger/logger";
import { zodNameSchema } from "src/core/types/zod-custom-types/name-schema";
import { zodPasswordSchema } from "src/core/types/zod-custom-types/password-schema";
import { makeRegisterUserUseCase } from "src/infra/factories/auth/make-register-user-use-case";
import z from "zod/v4";
import { schemaResponseError } from "../../@schema-errors/response-error-schema";
import { FastifyTypedInstace } from "../../@types/fastify-typed-instance";

export async function createAccount(app: FastifyTypedInstace) {
  app.post(
    "/account",
    {
      schema: {
        summary: "Registrar",
        description: "Registro de usuários",
        tags: ["App: Autenticação"],
        operationId: "auth_register",
        body: z.object({
          organization: z.object({
            name: zodNameSchema("Nome"),
            nickName: zodNameSchema("Nome Fantasia"),
            documentType: z.enum(["CNH", "CPF", "CNPJ"]),
            documentNumber: z.string(),
          }),
          ownerUser: z.object({
            firstName: zodNameSchema("Nome"),
            lastName: zodNameSchema("Sobrenome"),
            nickName: zodNameSchema("Apelido").optional(),
            email: z.email(),
            password: zodPasswordSchema("password"),
          }),
        }),
        response: {
          201: z.null(),
          401: z
            .object({ statusCode: z.number() })
            .extend(schemaResponseError.shape),
        },
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body;

      const useCase = makeRegisterUserUseCase();
      const response = await useCase.execute({
        name,
        email,
        password,
        role: "user",
      });

      if (response.isFailure()) {
        const logger = Logger.getInstance("Auth");
        logger.error(response.value.message, { email, password });
        reply.status(401).send({
          statusCode: 401,
          message: "E-mail ou senha inválidos.",
        });
        return;
      }

      reply.status(201).send();
    }
  );
}
