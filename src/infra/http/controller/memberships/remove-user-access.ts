import { NotAllowedError } from "src/core/errors/not-allowed-error";
import { NotFoundError } from "src/core/errors/not-found-error";
import { makeRemoveUserAccessUseCase } from "src/infra/factories/membership/make-remove-user-access-use-case";
import z from "zod/v4";
import { schemaResponseError } from "../../@schema-errors/response-error-schema";
import { FastifyTypedInstace } from "../../@types/fastify-typed-instance";
import { auth } from "../../middleware/auth";
import { verifyRoleAdmin } from "../../middleware/verify-role-admin";

export async function removeUserAccess(app: FastifyTypedInstace) {
  app
    .register(auth)
    .register(verifyRoleAdmin)
    .delete(
      "/memberships/users/:userId",
      {
        schema: {
          summary: "Remove User Access",
          description: "Remove user access on tenant",
          tags: ["App: Membership"],
          operationId: "membership_removeUserAccess",
          params: z.object({ userId: z.uuid() }),
          response: {
            204: z.null(),
            401: schemaResponseError,
          },
        },
      },
      async (request, reply) => {
        const { userId } = request.params;

        const useCase = makeRemoveUserAccessUseCase();
        const response = await useCase.execute({
          tenantId: request.user.tenantId,
          userId: request.user.id,
          removeUser: { userId },
        });

        // Tratativa de erros do caso de uso
        if (response.isFailure()) {
          const error = response.value;
          switch (error.constructor) {
            case NotFoundError:
            case NotAllowedError:
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
