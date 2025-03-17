import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import sensible from "@fastify/sensible";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import { config } from "dotenv";
import Fastify from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { env } from "src/core/env";
import Logger from "src/core/lib/logger/logger";
import z from "zod";
import { authRoutes } from "./controller/auth/@auth-routes";
import { errorHandler } from "./error-handler";

config();

export const app = Fastify().withTypeProvider<ZodTypeProvider>();

app.register(cors);
app.register(sensible);
app.register(jwt, { secret: env.JWT_KEY });

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.setErrorHandler(errorHandler);

/** SWAGGER DOCUMENTARION */
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Template Backend Fastify",
      description: "Documentação das funcionalidades da aplicação",
      version: "1.0.0",
      contact: {
        name: "Neto Rossetti",
        email: "netinho.rossetti@gmail.com",
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUI, { routePrefix: "/docs" });

/**ROTAS DA APLICAÇÃO */
const logger = Logger.getInstance("fasity-app");
app.addHook("onRequest", async (request, reply) => {
  logger.info(`REQUEST: [${request.method}] ${request.url}`);
});
app.addHook("onResponse", async (request, reply) => {
  logger.info(
    `RESPONSE: [${request.method}] ${request.url}, status(${
      reply.statusCode
    }) ${reply.elapsedTime.toFixed(2)}ms`
  );
});

/**health check */
app.get(
  "/ping",
  {
    schema: {
      summary: "Health Checker",
      description: "Verificar se o serviço esta disponivel.",
      tags: ["App: Configuração"],
      operationId: "health_checker",
      response: { 200: z.object({ message: z.string() }) },
    },
  },
  (_, reply) => {
    reply.status(200).send({ message: "pong" });
  }
);

app.register(authRoutes);
