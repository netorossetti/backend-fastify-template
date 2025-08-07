import { BadRequestError } from "@core/errors/bad-request-error";
import { NotAllowedError } from "@core/errors/not-allowed-error";
import { UnauthorizedError } from "@core/errors/unauthorized-error";
import { Prisma } from "@prisma/client";
import { FastifyInstance } from "fastify";
import { BadRequestQueryError } from "src/core/errors/bad-request-query-error";
import { ForbiddenError } from "src/core/errors/forbidden-error";
import Logger from "src/core/lib/logger/logger";
import { ZodError } from "zod/v4";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  let erroName = "UnknownError";
  let responseBody: {
    statusCode: number;
    message: string;
    issues?: Record<string, string[] | undefined>;
  };

  const logger = Logger.getInstance("ErrorHandler");

  // Usando switch para identificar o tipo de erro
  switch (true) {
    case error instanceof BadRequestQueryError &&
      error.name === "BadRequestQueryError":
      erroName = "BadRequestQueryError";

      responseBody = {
        statusCode: 400,
        message: `Parâmetros de ${error.invalidQueryType} inválidos.`,
        issues: error.flatten().fieldErrors,
      };
      break;

    case error instanceof ZodError:
      erroName = "ZodError";
      responseBody = {
        statusCode: 400,
        message: "Erro de validação dos campos",
        issues: error.flatten().fieldErrors,
      };
      break;

    case error.code === "FST_ERR_VALIDATION":
      erroName = "ValidationError";
      const issues: Record<string, string[]> = {};
      if (Array.isArray(error.validation)) {
        for (const validationError of error.validation) {
          const path =
            validationError.instancePath?.replace(/^\//, "") || "root";
          if (!issues[path]) issues[path] = [];
          issues[path].push(validationError.message || "Campo inválido");
        }
      }
      responseBody = {
        statusCode: 400,
        message: "Erro de validação dos campos",
        issues,
      };
      break;

    case error instanceof Prisma.PrismaClientValidationError:
      erroName = "PrismaClientValidationError";
      const message = error.message.split("Argument")[1]?.trim();
      if (!message) {
        responseBody = {
          statusCode: 500,
          message: `PrismaClientValidationError: ${error}`,
        };
      } else {
        responseBody = { statusCode: 404, message: `Argument${message}` };
      }
      break;

    case error instanceof Prisma.PrismaClientRustPanicError ||
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientInitializationError ||
      error instanceof Prisma.PrismaClientUnknownRequestError:
      erroName = error.name;
      responseBody = { statusCode: 500, message: `${error}` };
      break;

    case error instanceof BadRequestError:
      const badRequestError = error as BadRequestError; // 👈 Type Assertion
      erroName = "BadRequestError";
      responseBody = {
        statusCode: 400,
        message: badRequestError.message,
        issues: badRequestError.issues,
      };
      break;

    case error instanceof UnauthorizedError:
      erroName = "UnauthorizedError";
      responseBody = { statusCode: 401, message: error.message };
      break;

    case error instanceof ForbiddenError:
      erroName = "ForbiddenError";
      responseBody = { statusCode: 403, message: error.message };
      break;

    case error instanceof NotAllowedError:
      erroName = "NotAllowedError";
      responseBody = { statusCode: 405, message: error.message };
      break;

    default:
      // Para erros desconhecidos, loga o erro completo
      responseBody = { statusCode: 500, message: `${error}` };
      break;
  }

  // Logando todas as ocorrências de erro (conhecido ou desconhecido)
  logger.error(erroName, {
    method: request.method,
    originalUrl: request.originalUrl,
    statusCode: responseBody.statusCode,
    responseBody: responseBody,
  });

  // Envia a resposta de erro
  reply.status(responseBody.statusCode).send(responseBody);
};
