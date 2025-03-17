import type { FastifyInstance } from "fastify";
import { fastifyPlugin } from "fastify-plugin";
import { ForbiddenError } from "src/core/errors/forbidden-error";

// Defina os papéis disponíveis
export const Roles = {
  USER: "user",
  ADMIN: "admin",
} as const;

type Role = (typeof Roles)[keyof typeof Roles];

export const verifyRole = (allowedRoles: Role[]) =>
  fastifyPlugin(async (app: FastifyInstance) => {
    app.addHook("onRequest", async (request, reply) => {
      const { regra } = request.user || {};
      if (regra !== "superAdmin")
        if (!regra || !allowedRoles.includes(regra)) {
          throw new ForbiddenError(
            `Permissão de acesso '${allowedRoles.join("' ou '")}' exigida.`
          );
        }
    });
  });
