import { BadRequestError } from "src/core/errors/bad-request-error";
import { ConflictError } from "src/core/errors/conflict-error";
import { zodNameSchema } from "src/core/types/zod-custom-types/name-schema";
import { zodPasswordSchema } from "src/core/types/zod-custom-types/password-schema";
import { makeCreateTenantUseCase } from "src/infra/factories/tenant/make-create-tenant-use-case";
import z from "zod/v4";
import { schemaResponseError } from "../../@schema-errors/response-error-schema";
import { FastifyTypedInstace } from "../../@types/fastify-typed-instance";

export async function createTenant(app: FastifyTypedInstace) {
  app.post(
    "/tenants",
    {
      schema: {
        summary: "Create Tenant",
        description: "Create new tenant",
        tags: ["App: Tenant"],
        operationId: "tenant_createTenant",
        body: z.object({
          firstName: zodNameSchema("Nome"),
          lastName: zodNameSchema("Sobrenome"),
          nickName: zodNameSchema("Apelido").optional(),
          email: z.email(),
          password: zodPasswordSchema("password"),
          organization: z.object({
            name: zodNameSchema("Nome"),
            nickName: zodNameSchema("Nome Fantasia"),
            documentType: z.enum(["CNH", "CPF", "CNPJ"]),
            documentNumber: z.string(),
          }),
        }),
        response: {
          204: z.null(),
          401: schemaResponseError,
        },
      },
    },
    async (request, reply) => {
      const { firstName, lastName, nickName, email, password, organization } =
        request.body;

      const useCase = makeCreateTenantUseCase();
      const response = await useCase.execute({
        firstName,
        lastName,
        nickName,
        email,
        password,
        tenant: {
          name: organization.name,
          nickName: organization.nickName,
          documentType: organization.documentType,
          documentNumber: organization.documentNumber,
        },
      });

      // Tratativa de erros do caso de uso
      if (response.isFailure()) {
        const error = response.value;
        switch (error.constructor) {
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
