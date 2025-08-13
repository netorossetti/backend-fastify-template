import { NotAllowedError } from "src/core/errors/not-allowed-error";
import { NotFoundError } from "src/core/errors/not-found-error";
import { makeInactivateTenantUseCase } from "src/infra/factories/tenant/make-inactivate-tenant-use-case";
import z from "zod/v4";
import { schemaResponseError } from "../../@schema-errors/response-error-schema";
import { FastifyTypedInstace } from "../../@types/fastify-typed-instance";
import { auth } from "../../middleware/auth";
import { verifyRoleSuperAdmin } from "../../middleware/verify-role-super-admin";

export async function inactivateTenant(app: FastifyTypedInstace) {
  app
    .register(auth)
    .register(verifyRoleSuperAdmin)
    .post(
      "/tenants/:tenantId/inactivate",
      {
        schema: {
          summary: "Inactivate Tenant",
          description: "Inactivate tenant",
          tags: ["App: Tenant"],
          operationId: "tenant_inactivateTenant",
          security: [{ bearerAuth: [] }],
          params: z.object({ tenantId: z.uuid() }),
          response: {
            204: z.null(),
            401: schemaResponseError,
          },
        },
      },
      async (request, reply) => {
        const { tenantId } = request.params;

        const useCase = makeInactivateTenantUseCase();
        const response = await useCase.execute({
          userId: request.user.id,
          tenantId: tenantId,
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
