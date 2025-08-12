import { NotFoundError } from "src/core/errors/not-found-error";
import { zodPasswordSchema } from "src/core/types/zod-custom-types/password-schema";
import { makeResetPasswordUseCase } from "src/infra/factories/auth/make-reset-password-use-case";
import z from "zod/v4";
import { schemaResponseError } from "../../@schema-errors/response-error-schema";
import { FastifyTypedInstace } from "../../@types/fastify-typed-instance";

export async function resetPassword(app: FastifyTypedInstace) {
  app.post(
    "/auth/reset-password",
    {
      schema: {
        summary: "Reset Password",
        description: "Reset user password",
        tags: ["App: Authenticate"],
        operationId: "auth_resetPassword",
        body: z
          .object({
            recoveryCode: z.string(),
            password: zodPasswordSchema("password"),
            passwordCheck: z.string(),
          })
          .refine((data) => data.password === data.passwordCheck, {
            message: "As senhas não coincidem",
            path: ["passwordCheck"], // Aponta o erro para o campo correto
          }),
        response: {
          204: z.null(),
          401: schemaResponseError,
        },
      },
    },
    async (request, reply) => {
      const { recoveryCode, password, passwordCheck } = request.body;

      const resetPasswordUseCase = makeResetPasswordUseCase();
      const response = await resetPasswordUseCase.execute({
        recoveryCode,
        password,
        passwordCheck,
      });

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

      reply.status(204).send();
    }
  );
}
