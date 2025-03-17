import { StringHelper } from "src/core/helpers/string-helper";
import Logger from "src/core/lib/logger/logger";
import { makeRegisterUserUseCase } from "src/infra/factories/auth/make-register-user-use-case";
import z from "zod";
import { schemaResponseError } from "../../@schema-errors/response-error-schema";
import { FastifyTypedInstace } from "../../@types/fastify-typed-instance";

export async function register(app: FastifyTypedInstace) {
  app.post(
    "/auth/register",
    {
      schema: {
        summary: "Registrar",
        description: "Registro de usuários",
        tags: ["App: Autenticação"],
        operationId: "auth_register",
        body: z.object({
          name: z.string(),
          email: z.string().email(),
          password: z.string().superRefine((novaSenha, ctx) => {
            const mensagemErro = StringHelper.passwordRequirements(novaSenha);
            if (mensagemErro) {
              mensagemErro.forEach((error) => {
                ctx.addIssue({
                  code: z.ZodIssueCode.invalid_string,
                  message: error,
                  validation: "regex",
                });
              });
            }
          }),
        }),
        response: {
          201: z.null(),
          401: z.object({ statusCode: z.number() }).merge(schemaResponseError),
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
