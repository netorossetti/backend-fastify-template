import { NotFoundError } from "src/core/errors/not-found-error";
import { UnauthorizedError } from "src/core/errors/unauthorized-error";
import Logger from "src/core/lib/logger/logger";
import { makeRefreshTokenUseCase } from "src/infra/factories/auth/make-refresh-token-use-case";
import z from "zod/v4";
import { schemaResponseError } from "../../@schema-errors/response-error-schema";
import { FastifyTypedInstace } from "../../@types/fastify-typed-instance";
import { auth } from "../../middleware/auth";

const responseOkSchema = z.object({
  token: z.string(),
});

export async function refreshToken(app: FastifyTypedInstace) {
  app.register(auth).post(
    "/auth/refresh-token",
    {
      schema: {
        summary: "Refresh Token",
        description: "User Token Refresh",
        tags: ["App: Authenticate"],
        operationId: "auth_refreshToken",
        security: [{ bearerAuth: [] }],
        response: {
          200: responseOkSchema,
          401: schemaResponseError,
        },
      },
    },
    async (request, reply) => {
      const usuarioId = request.user.id;
      const token = await request.getAutorizationBearerToken();

      const refreshTokenUseCase = makeRefreshTokenUseCase();
      const response = await refreshTokenUseCase.execute({
        usuarioId,
        token,
      });

      if (response.isFailure()) {
        const logger = Logger.getInstance("Autenticação");
        logger.error(response.value.message);
        const error = response.value;
        switch (error.constructor) {
          case NotFoundError:
          case UnauthorizedError:
            reply.status(401).send({
              statusCode: 401,
              message: "Token inválido.",
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

      reply.status(200).send(response.value);
    }
  );
}
