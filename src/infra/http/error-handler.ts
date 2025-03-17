import { BadRequestError } from "@core/errors/bad-request-error";
import { NotAllowedError } from "@core/errors/not-allowed-error";
import { ResourceAlreadyExistsError } from "@core/errors/resource-already-exists-error";
import { ResourceNotFoundError } from "@core/errors/resource-not-found-error";
import { UnauthorizedError } from "@core/errors/unauthorized-error";
import { Prisma } from "@prisma/client";
import { FastifyInstance } from "fastify";
import { BadRequestQueryError } from "src/core/errors/bad-request-query-error";
import { ForbiddenError } from "src/core/errors/forbidden-error";
import Logger from "src/core/lib/logger/logger";
import { ZodError } from "zod";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  let erroName = "UnknownError";
  let statusCode = 500;
  let responseBody: {
    message: string;
    issues?: Record<string, string[] | undefined>;
  } = {
    message: "Internal server error!",
  };

  const logger = Logger.getInstance("ErrorHandler");

  // Usando switch para identificar o tipo de erro
  switch (true) {
    case error instanceof BadRequestQueryError:
      erroName = "BadRequestQueryError";
      statusCode = 400;
      responseBody = {
        message: `Parâmetros de ${error.invalidQueryType} inválidos.`,
        issues: error.flatten().fieldErrors,
      };
      break;

    case error instanceof ZodError:
      erroName = "ZodError";
      statusCode = 400;
      responseBody = {
        message: "Erro de validação dos campos",
        issues: error.flatten().fieldErrors,
      };
      break;

    case error instanceof Prisma.PrismaClientValidationError:
      erroName = "PrismaClientValidationError";
      const message = error.message.split("Argument")[1]?.trim();
      if (!message) {
        responseBody = { message: `PrismaClientValidationError: ${error}` };
      } else {
        statusCode = 404;
        responseBody = { message: `Argument${message}` };
      }
      break;

    case error instanceof Prisma.PrismaClientRustPanicError ||
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientInitializationError ||
      error instanceof Prisma.PrismaClientUnknownRequestError:
      erroName = error.name;
      responseBody = { message: `${error}` };
      break;

    case error instanceof BadRequestError:
      const badRequestError = error as BadRequestError; // 👈 Type Assertion
      erroName = "BadRequestError";
      statusCode = 400;
      responseBody = {
        message: badRequestError.message,
        issues: badRequestError.issues,
      };
      break;

    case error instanceof UnauthorizedError:
      erroName = "UnauthorizedError";
      statusCode = 401;
      responseBody = { message: error.message };
      break;

    case error instanceof ForbiddenError:
      erroName = "ForbiddenError";
      statusCode = 403;
      responseBody = { message: error.message };
      break;

    case error instanceof NotAllowedError:
      erroName = "NotAllowedError";
      statusCode = 405;
      responseBody = { message: error.message };
      break;

    case error instanceof ResourceNotFoundError:
      erroName = "ResourceNotFoundError";
      statusCode = 404;
      responseBody = { message: error.message };
      break;

    case error instanceof ResourceAlreadyExistsError:
      erroName = "ResourceAlreadyExistsError";
      statusCode = 409;
      responseBody = { message: error.message };
      break;

    default:
      // Para erros desconhecidos, loga o erro completo
      responseBody = { message: `${error}` };
      break;
  }

  // Logando todas as ocorrências de erro (conhecido ou desconhecido)
  logger.error(erroName, {
    method: request.method,
    originalUrl: request.originalUrl,
    statusCode: statusCode,
    responseBody: responseBody,
  });

  // Envia a resposta de erro
  reply.status(statusCode).send(responseBody);
};
