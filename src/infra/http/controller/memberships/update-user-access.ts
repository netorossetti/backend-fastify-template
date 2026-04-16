import { NotAllowedError } from "src/core/errors/not-allowed-error.js";
import { NotFoundError } from "src/core/errors/not-found-error.js";
import { makeUpdateUserAccessUseCase } from "src/infra/factories/membership/make-update-user-access-use-case.js";
import z from "zod/v4";
import { schemaResponseError } from "../../@schema-errors/response-error-schema.js";
import { FastifyTypedInstace } from "../../@types/fastify-typed-instance.js";
import { auth } from "../../middleware/auth.js";
import { verifyRoleAdmin } from "../../middleware/verify-role-admin.js";

export async function updateUserAccess(app: FastifyTypedInstace) {
  app
    .register(auth)
    .register(verifyRoleAdmin)
    .put(
      "/memberships/users/:userId",
      {
        schema: {
          summary: "Update User Access",
          description: "Update user access on tenant",
          tags: ["App: Membership"],
          operationId: "membership_updateUserAccess",
          security: [{ bearerAuth: [] }],
          params: z.object({ userId: z.uuid() }),
          body: z.object({
            active: z.boolean(),
            role: z.enum(["admin", "user"]),
          }),
          response: {
            204: z.null(),
            401: schemaResponseError,
            default: schemaResponseError,
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

        reply.status(204).send(null);
      },
    );
}
