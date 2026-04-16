import { NotAllowedError } from "src/core/errors/not-allowed-error.js";
import { NotFoundError } from "src/core/errors/not-found-error.js";
import { UnauthorizedError } from "src/core/errors/unauthorized-error.js";
import Logger from "src/core/lib/logger/logger.js";
import { makeLoginUseCase } from "src/infra/factories/auth/make-login-use-case.js";
import z from "zod/v4";
import { schemaResponseError } from "../../@schema-errors/response-error-schema.js";
import { FastifyTypedInstace } from "../../@types/fastify-typed-instance.js";
import { LoginPresenter, schemaLoginPresenter } from "../../presenter/login-presenter.js";

export async function login(app: FastifyTypedInstace) {
  app.post(
    "/auth/login",
    {
      schema: {
        summary: "Login",
        description: "User authentication",
        tags: ["App: Authenticate"],
        operationId: "auth_login",
        body: z.object({
          email: z.email(),
          password: z.string(),
        }),
        response: {
          200: schemaLoginPresenter,
          401: schemaResponseError,
          default: schemaResponseError,
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
        const error = response.value;
        switch (error.constructor) {
          case NotFoundError:
          case UnauthorizedError:
          case NotAllowedError:
            reply.status(401).send({
              statusCode: 401,
              message: "E-mail ou senha inválidos.",
            });
            break;
          default:
            reply.status(500).send({
              statusCode: 500,
              message: "Internal server error.",
            });
        }
        return;
      }

      if (response.isFailure()) {
      }

      reply.status(200).send(LoginPresenter.toHttp(response.value));
    },
  );
}
