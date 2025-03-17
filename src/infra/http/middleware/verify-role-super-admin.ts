import type { FastifyInstance } from "fastify";
import { fastifyPlugin } from "fastify-plugin";
import { ForbiddenError } from "src/core/errors/forbidden-error";

export const verifyRoleSuperAdmin = fastifyPlugin(
  async (app: FastifyInstance) => {
    app.addHook("onRequest", async (request, reply) => {
      const roleToVerify = ["superAdmin"];
      const { regra } = request.user;
      if (!roleToVerify.includes(regra))
        throw new ForbiddenError("Permissão de acesso 'superAdmin' exigida.");
    });
  }
);
