import { BadRequestError } from "src/core/errors/bad-request-error";
import { ConflictError } from "src/core/errors/conflict-error";
import { NotAllowedError } from "src/core/errors/not-allowed-error";
import { NotFoundError } from "src/core/errors/not-found-error";
import { zodNameSchema } from "src/core/types/zod-custom-types/name-schema";
import { makeUpdateTenantUseCase } from "src/infra/factories/tenant/make-update-tenant-use-case";
import z from "zod/v4";
import { schemaResponseError } from "../../@schema-errors/response-error-schema";
import { FastifyTypedInstace } from "../../@types/fastify-typed-instance";
import { auth } from "../../middleware/auth";

export async function updateTenant(app: FastifyTypedInstace) {
  app.register(auth).patch(
    "/tenants/:tenantId",
    {
      schema: {
        summary: "Update Tenant",
        description: "Update new tenant",
        tags: ["App: Tenant"],
        operationId: "tenant_updateTenant",
        params: z.object({ tenantId: z.uuid() }),
        body: z.object({
          name: zodNameSchema({
            description: "Nome",
            maxSize: 255,
            allowHyphens: true,
            allowApostrophes: true,
            allowNumbers: true,
          }),
          nickName: zodNameSchema({
            description: "Nome Fantasia",
            allowHyphens: true,
            allowApostrophes: true,
            allowNumbers: true,
          }),
          documentType: z.enum(["CNH", "CPF", "CNPJ"]),
          documentNumber: z.string(),
        }),
        response: {
          204: z.null(),
          401: schemaResponseError,
        },
      },
    },
    async (request, reply) => {
      const { tenantId } = request.params;
      const { name, nickName, documentType, documentNumber } = request.body;

      const useCase = makeUpdateTenantUseCase();
      const response = await useCase.execute({
        userId: request.user.id,
        tenantId: tenantId,
        name: name,
        nickName: nickName,
        documentType: documentType,
        documentNumber: documentNumber,
      });

      // Tratativa de erros do caso de uso
      if (response.isFailure()) {
        const error = response.value;
        switch (error.constructor) {
          case NotFoundError:
          case NotAllowedError:
          case ConflictError:
          case BadRequestError:
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
