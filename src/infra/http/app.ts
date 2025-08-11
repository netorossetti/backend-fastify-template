import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import sensible from "@fastify/sensible";
import fastifyStatic from "@fastify/static";
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
import path from "node:path";
import { env } from "src/core/env";
import Logger from "src/core/lib/logger/logger";
import z from "zod/v4";
import { authRoutes } from "./controller/auth/@auth-routes";
import { tenantsRoutes } from "./controller/tenants/@tenants-routes";
import { usersRoutes } from "./controller/users/@users-routes";
import { errorHandler } from "./error-handler";

config();

export const app = Fastify().withTypeProvider<ZodTypeProvider>();

app.register(cors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});
app.register(sensible);
app.register(jwt, { secret: env.JWT_KEY });

app.register(multipart, {
  attachFieldsToBody: true,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB por arquivo
  },
});

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

/** health check */
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

/** uploads */
app.register(fastifyStatic, {
  root: path.join(env.UPLOADS_PUBLIC_PATH),
  prefix: "/uploads/",
});

/** Rotas da aplicação */
app.register(authRoutes);
app.register(tenantsRoutes);
app.register(usersRoutes);
