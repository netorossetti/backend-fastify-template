import type { FastifyInstance } from "fastify";
import { fastifyPlugin } from "fastify-plugin";
import { ForbiddenError } from "src/core/errors/forbidden-error";

export const verifyRoleUser = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook("onRequest", async (request, reply) => {
    const roleToVerify = ["user", "admin", "superAdmin"];
    const { regra } = request.user;
    if (!roleToVerify.includes(regra))
      throw new ForbiddenError("Permissão de acesso 'user' exigida.");
  });
});
