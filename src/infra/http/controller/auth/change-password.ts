import { BadRequestError } from "src/core/errors/bad-request-error";
import { NotFoundError } from "src/core/errors/not-found-error";
import { zodPasswordSchema } from "src/core/types/zod-custom-types/password-schema";
import { makeChangePasswordUseCase } from "src/infra/factories/auth/make-change-password-use-case";
import z from "zod/v4";
import { schemaResponseError } from "../../@schema-errors/response-error-schema";
import { FastifyTypedInstace } from "../../@types/fastify-typed-instance";
import { auth } from "../../middleware/auth";

export async function changePassword(app: FastifyTypedInstace) {
  app.register(auth).post(
    "/auth/change-password",
    {
      schema: {
        summary: "Change Password",
        description: "Change user password",
        tags: ["App: Authenticate"],
        operationId: "auth_changePassword",
        body: z
          .object({
            password: zodPasswordSchema("password"),
            newPassword: zodPasswordSchema("newPassword"),
            newPasswordCheck: zodPasswordSchema("newPasswordCheck"),
          })
          .refine((data) => data.newPassword === data.newPasswordCheck, {
            message: "As senhas não coincidem",
            path: ["newPasswordCheck"], // Aponta o erro para o campo correto
          }),
        response: {
          200: z.object({
            message: z.string(),
          }),
          401: schemaResponseError,
        },
      },
    },
    async (request, reply) => {
      const { password, newPassword, newPasswordCheck } = request.body;

      const changePasswordUseCase = makeChangePasswordUseCase();
      const response = await changePasswordUseCase.execute({
        userId: request.user.id,
        password,
        newPassword,
        newPasswordCheck,
      });

      if (response.isFailure()) {
        const error = response.value;
        switch (error.constructor) {
          case BadRequestError:
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

      reply.status(200).send({ message: "Senha alterada com sucesso!" });
    }
  );
}
