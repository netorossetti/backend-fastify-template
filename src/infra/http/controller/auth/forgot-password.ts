import { NotFoundError } from "src/core/errors/not-found-error";
import { makeForgotPasswordUseCase } from "src/infra/factories/auth/make-forgot-password-use-case";
import z from "zod/v4";
import { schemaResponseError } from "../../@schema-errors/response-error-schema";
import { FastifyTypedInstace } from "../../@types/fastify-typed-instance";

export async function forgotPassword(app: FastifyTypedInstace) {
  app.post(
    "/auth/forgot-password",
    {
      schema: {
        summary: "Forgot Password",
        description: "Recuperar senha do usuário",
        tags: ["App: Authenticate"],
        operationId: "auth_forgotPassword",
        body: z.object({
          email: z.email(),
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
      const { email } = request.body;

      const forgotPasswordUseCase = makeForgotPasswordUseCase();
      const response = await forgotPasswordUseCase.execute({ email });

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

      reply.status(200).send(response.value);
    }
  );
}
