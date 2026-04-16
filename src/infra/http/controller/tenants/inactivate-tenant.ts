import { NotAllowedError } from "src/core/errors/not-allowed-error.js";
import { NotFoundError } from "src/core/errors/not-found-error.js";
import { makeInactivateTenantUseCase } from "src/infra/factories/tenant/make-inactivate-tenant-use-case.js";
import z from "zod/v4";
import { schemaResponseError } from "../../@schema-errors/response-error-schema.js";
import { FastifyTypedInstace } from "../../@types/fastify-typed-instance.js";
import { auth } from "../../middleware/auth.js";
import { verifyRoleSuperAdmin } from "../../middleware/verify-role-super-admin.js";

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
            default: schemaResponseError,
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

        reply.status(204).send(null);
      },
    );
}
