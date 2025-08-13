import { BadRequestError } from "src/core/errors/bad-request-error";
import { NotFoundError } from "src/core/errors/not-found-error";
import {
  acceptedAvatarsMimeTypes,
  zodFileSchema,
} from "src/core/types/zod-custom-types/file-schema";
import { zodNameSchema } from "src/core/types/zod-custom-types/name-schema";
import { makeUpdateUserProfileUseCase } from "src/infra/factories/user/make-update-user-profile-use-case";
import z from "zod/v4";
import { schemaResponseError } from "../../@schema-errors/response-error-schema";
import { FastifyTypedInstace } from "../../@types/fastify-typed-instance";
import {
  isMultipartBody,
  transformMultipartBody,
} from "../../@utils/transform-multipart-body";
import { auth } from "../../middleware/auth";

const MAX_FILE_SIZE_MB = 2;
const schemaFormBody = z.object({
  firstName: zodNameSchema({ description: "Nome" }),
  lastName: zodNameSchema({ description: "Sobrenome" }),
  nickName: zodNameSchema({
    description: "Apelido",
    allowApostrophes: true,
    allowHyphens: true,
    allowNumbers: true,
  }),
  avatar: zodFileSchema({
    acceptedMimeTypes: acceptedAvatarsMimeTypes,
    maxSizeMB: MAX_FILE_SIZE_MB,
  }).optional(),
});

export async function updateUserProfile(app: FastifyTypedInstace) {
  app.register(auth).put(
    "/users/profile",
    {
      schema: {
        summary: "Update Profile",
        description: "Update user profile",
        tags: ["App: Users"],
        operationId: "update_getProfile",
        security: [{ bearerAuth: [] }],
        consumes: ["multipart/form-data"],
        body: z.object({
          firstName: zodNameSchema({ description: "Nome" }),
          lastName: zodNameSchema({ description: "Sobrenome" }),
          nickName: zodNameSchema({
            description: "Apelido",
            allowApostrophes: true,
            allowHyphens: true,
            allowNumbers: true,
          }),
          avatar: z.file().optional().meta({
            description:
              "Imagem do avatar do usuário. Formatos aceitos: .png, .jpeg.webp",
          }),
        }),
        response: {
          204: z.null(),
          401: schemaResponseError,
        },
      },
      validatorCompiler: () => {
        return () => {
          return { value: undefined };
        };
      },
    },
    async (request, reply) => {
      if (!isMultipartBody(request.body)) {
        throw new BadRequestError(
          'Formato do corpo inválido. Formato esperado: "multipart/form-data".'
        );
      }

      //Transformar Form-Data em um objeto esperado
      const form = await transformMultipartBody(request.body, schemaFormBody);

      const useCase = makeUpdateUserProfileUseCase();
      const response = await useCase.execute({
        userId: request.user.id,
        firstName: form.firstName,
        lastName: form.lastName,
        nickName: form.nickName,
        avatar: form.avatar,
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

      reply.status(204).send();
    }
  );
}
