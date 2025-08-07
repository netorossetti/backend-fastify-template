import { NotAllowedError } from "src/core/errors/not-allowed-error";
import { NotFoundError } from "src/core/errors/not-found-error";
import { makeSelectTenantUseCase } from "src/infra/factories/tenant/make-select-tenant-use-case";
import z from "zod/v4";
import { schemaResponseError } from "../../@schema-errors/response-error-schema";
import { FastifyTypedInstace } from "../../@types/fastify-typed-instance";
import { auth } from "../../middleware/auth";
import {
  LoginPresenter,
  schemaLoginPresenter,
} from "../../presenter/login-presenter";

export async function selectTenant(app: FastifyTypedInstace) {
  app.register(auth).post(
    "/tenants/select/:tenantId",
    {
      schema: {
        summary: "Select Tenant",
        description: "Select tenant",
        tags: ["App: Tenant"],
        operationId: "tenant_selectTenant",
        security: [{ bearerAuth: [] }],
        params: z.object({
          tenantId: z.uuid(),
        }),
        response: {
          200: schemaLoginPresenter,
          401: schemaResponseError,
        },
      },
    },
    async (request, reply) => {
      const { tenantId } = request.params;

      const useCase = makeSelectTenantUseCase();
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

      reply.status(200).send(LoginPresenter.toHttp(response.value));
    }
  );
}
