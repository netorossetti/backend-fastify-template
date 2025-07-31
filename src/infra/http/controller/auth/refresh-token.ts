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
        description: "Atualização de token do usuário",
        tags: ["App: Autenticação"],
        operationId: "auth_refreshToken",
        security: [{ bearerAuth: [] }],
        response: {
          200: responseOkSchema,
          401: z
            .object({ statusCode: z.number() })
            .extend(schemaResponseError.shape),
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
        reply.status(401).send({
          statusCode: 401,
          message: "Token inválido.",
        });
        return;
      }

      reply.status(200).send(response.value);
    }
  );
}
