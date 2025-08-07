import { NotFoundError } from "src/core/errors/not-found-error";
import { makeGetUserProfileUseCase } from "src/infra/factories/user/make-get-user-profile-use-case";
import z from "zod/v4";
import { schemaResponseError } from "../../@schema-errors/response-error-schema";
import { FastifyTypedInstace } from "../../@types/fastify-typed-instance";
import { auth } from "../../middleware/auth";
import {
  schemaUserProfilePresenter,
  UserProfilePresenter,
} from "../../presenter/user-profile-presenter";

export async function getUserProfile(app: FastifyTypedInstace) {
  app.register(auth).get(
    "/users/profile",
    {
      schema: {
        summary: "Get Profile",
        description: "Get user profile",
        tags: ["App: Users"],
        operationId: "users_getProfile",
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({ user: schemaUserProfilePresenter }),
          401: schemaResponseError,
        },
      },
    },
    async (request, reply) => {
      const useCase = makeGetUserProfileUseCase();
      const response = await useCase.execute({
        userId: request.user.id,
        tenantId: request.user.tenantId,
      });

      // Tratativa de erros do caso de uso
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

      reply
        .status(200)
        .send({ user: UserProfilePresenter.toHttp(response.value.user) });
    }
  );
}
