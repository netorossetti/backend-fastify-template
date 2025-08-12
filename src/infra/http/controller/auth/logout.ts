import { NotFoundError } from "src/core/errors/not-found-error";
import { makeLogoutUseCase } from "src/infra/factories/auth/make-logout-use-case";
import z from "zod/v4";
import { schemaResponseError } from "../../@schema-errors/response-error-schema";
import { FastifyTypedInstace } from "../../@types/fastify-typed-instance";
import { auth } from "../../middleware/auth";

export async function logout(app: FastifyTypedInstace) {
  app.register(auth).post(
    "/auth/logout",
    {
      schema: {
        summary: "Logout",
        description: "Exit the application",
        tags: ["App: Authenticate"],
        operationId: "auth_logout",
        security: [{ bearerAuth: [] }],
        response: {
          204: z.null(),
          401: schemaResponseError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user.id;

      const logoutUseCase = makeLogoutUseCase();
      const response = await logoutUseCase.execute({
        userId,
      });

      if (response.isFailure()) {
        const error = response.value;
        switch (error.constructor) {
          case NotFoundError:
            reply.status(error.statusCode).send({
              statusCode: error.statusCode,
              message: error.message,
            });
            break;
          default:
            throw error;
        }
        return;
      }

      reply.status(204).send();
    }
  );
}
