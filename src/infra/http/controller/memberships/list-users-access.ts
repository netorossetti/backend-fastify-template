import { NotAllowedError } from "src/core/errors/not-allowed-error";
import { NotFoundError } from "src/core/errors/not-found-error";
import { makeListUserAccessUseCase } from "src/infra/factories/membership/make-list-user-access-use-case";
import z from "zod/v4";
import { schemaResponseError } from "../../@schema-errors/response-error-schema";
import { FastifyTypedInstace } from "../../@types/fastify-typed-instance";
import { auth } from "../../middleware/auth";
import { verifyRoleAdmin } from "../../middleware/verify-role-admin";
import {
  schemaUserMembershipPresenter,
  UserMembershipPresenter,
} from "../../presenter/user-membership-presenter";

export async function listUsersAccess(app: FastifyTypedInstace) {
  app
    .register(auth)
    .register(verifyRoleAdmin)
    .get(
      "/memberships/users",
      {
        schema: {
          summary: "List User Access",
          description: "List user access on tenant",
          tags: ["App: Membership"],
          operationId: "membership_listUserAccess",
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({ users: z.array(schemaUserMembershipPresenter) }),
            401: schemaResponseError,
          },
        },
      },
      async (request, reply) => {
        const useCase = makeListUserAccessUseCase();
        const response = await useCase.execute({
          tenantId: request.user.tenantId,
          userId: request.user.id,
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

        reply.status(200).send({
          users: response.value.users.map(UserMembershipPresenter.toHttp),
        });
      }
    );
}
