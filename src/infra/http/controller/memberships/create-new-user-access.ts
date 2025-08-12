import { ConflictError } from "src/core/errors/conflict-error";
import { NotAllowedError } from "src/core/errors/not-allowed-error";
import { NotFoundError } from "src/core/errors/not-found-error";
import { zodNameSchema } from "src/core/types/zod-custom-types/name-schema";
import { makeCreateNewUserAccessUseCase } from "src/infra/factories/membership/make-create-new-user-access-use-case";
import z from "zod/v4";
import { schemaResponseError } from "../../@schema-errors/response-error-schema";
import { FastifyTypedInstace } from "../../@types/fastify-typed-instance";
import { auth } from "../../middleware/auth";
import { verifyRoleAdmin } from "../../middleware/verify-role-admin";

export async function createNewUserAccess(app: FastifyTypedInstace) {
  app
    .register(auth)
    .register(verifyRoleAdmin)
    .post(
      "/memberships/users",
      {
        schema: {
          summary: "Create New User Access",
          description: "Create a new user access on tenant",
          tags: ["App: Membership"],
          operationId: "membership_createNewUserAccess",
          body: z.object({
            firstName: zodNameSchema({
              description: "Nome",
            }),
            lastName: zodNameSchema({ description: "Sobrenome" }),
            nickName: zodNameSchema({
              description: "Apelido",
              allowHyphens: true,
              allowApostrophes: true,
              allowNumbers: true,
            }).optional(),
            email: z.email(),
            role: z.enum(["admin", "user"]),
          }),
          response: {
            204: z.null(),
            401: schemaResponseError,
          },
        },
      },
      async (request, reply) => {
        const { firstName, lastName, nickName, email, role } = request.body;

        const useCase = makeCreateNewUserAccessUseCase();
        const response = await useCase.execute({
          tenantId: request.user.tenantId,
          userId: request.user.id,
          createUser: {
            firstName,
            lastName,
            nickName,
            email,
            role,
          },
        });

        // Tratativa de erros do caso de uso
        if (response.isFailure()) {
          const error = response.value;
          switch (error.constructor) {
            case ConflictError:
            case NotAllowedError:
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
