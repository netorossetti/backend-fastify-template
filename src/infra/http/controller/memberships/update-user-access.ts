import { NotAllowedError } from "src/core/errors/not-allowed-error";
import { NotFoundError } from "src/core/errors/not-found-error";
import { makeUpdateUserAccessUseCase } from "src/infra/factories/membership/make-update-user-access-use-case";
import z from "zod/v4";
import { schemaResponseError } from "../../@schema-errors/response-error-schema";
import { FastifyTypedInstace } from "../../@types/fastify-typed-instance";
import { auth } from "../../middleware/auth";
import { verifyRoleAdmin } from "../../middleware/verify-role-admin";

export async function updateUserAccess(app: FastifyTypedInstace) {
  app
    .register(auth)
    .register(verifyRoleAdmin)
    .patch(
      "/memberships/users/:userId",
      {
        schema: {
          summary: "Update User Access",
          description: "Update user access on tenant",
          tags: ["App: Membership"],
          operationId: "membership_updateUserAccess",
          params: z.object({ userId: z.uuid() }),
          body: z.object({
            active: z.boolean(),
            role: z.enum(["admin", "user"]),
          }),
          response: {
            204: z.null(),
            401: schemaResponseError,
          },
        },
      },
      async (request, reply) => {
        const { active, role } = request.body;
        const { userId } = request.params;

        const useCase = makeUpdateUserAccessUseCase();
        const response = await useCase.execute({
          tenantId: request.user.tenantId,
          userId: request.user.id,
          updateUser: {
            userId,
            active,
            role,
          },
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
