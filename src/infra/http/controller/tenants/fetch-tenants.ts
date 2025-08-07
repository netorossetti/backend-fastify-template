import { NotFoundError } from "src/core/errors/not-found-error";
import { makeFetchTenantsUseCase } from "src/infra/factories/tenant/make-fetch-tenants-use-case";
import { z } from "zod/v4";
import { schemaResponseError } from "../../@schema-errors/response-error-schema";
import { FastifyTypedInstace } from "../../@types/fastify-typed-instance";
import { auth } from "../../middleware/auth";
import {
  TenantPresenter,
  schemaTenantPresenter,
} from "../../presenter/tenant-presenter";

export async function fetchTenants(app: FastifyTypedInstace) {
  app.register(auth).get(
    "/tenants",
    {
      schema: {
        summary: "Fetch Tenants",
        description:
          "List tenants for users when user is owner or role is admin",
        tags: ["App: Tenant"],
        operationId: "tenant_fetchTenants",
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({
            tenants: z.array(schemaTenantPresenter),
          }),
          401: schemaResponseError,
        },
      },
    },
    async (request, reply) => {
      const useCase = makeFetchTenantsUseCase();
      const response = await useCase.execute({
        userId: request.user.id,
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

      reply.status(200).send({
        tenants: response.value.tenants.map(TenantPresenter.toHttp),
      });
    }
  );
}
