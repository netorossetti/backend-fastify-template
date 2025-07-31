import Logger from "src/core/lib/logger/logger";
import { makeLoginUseCase } from "src/infra/factories/auth/make-login-use-case";
import z from "zod/v4";
import { schemaResponseError } from "../../@schema-errors/response-error-schema";
import { FastifyTypedInstace } from "../../@types/fastify-typed-instance";

export async function login(app: FastifyTypedInstace) {
  app.post(
    "/auth/login",
    {
      schema: {
        summary: "Login",
        description: "Autenticação de usuários",
        tags: ["App: Autenticação"],
        operationId: "auth_login",
        body: z.object({
          email: z.email(),
          password: z.string(),
        }),
        response: {
          200: z.object({
            token: z.string(),
          }),
          401: z
            .object({ statusCode: z.number() })
            .extend(schemaResponseError.shape),
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      const loginUseCase = makeLoginUseCase();
      const response = await loginUseCase.execute({ email, password });

      if (response.isFailure()) {
        const logger = Logger.getInstance("Auth");
        logger.error(response.value.message, { email, password });
        reply.status(401).send({
          statusCode: 401,
          message: "E-mail ou senha inválidos.",
        });
        return;
      }

      reply.status(200).send(response.value);
    }
  );
}
