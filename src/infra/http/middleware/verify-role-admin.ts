import type { FastifyInstance } from "fastify";
import { fastifyPlugin } from "fastify-plugin";
import { ForbiddenError } from "src/core/errors/forbidden-error";
import { RoleUserType } from "src/domain/enterprise/entities/membership";

export const verifyRoleAdmin = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook("onRequest", async (request, reply) => {
    const roleToVerify: RoleUserType[] = ["admin", "superAdmin"];
    const { role } = request.user;
    if (!roleToVerify.includes(role))
      throw new ForbiddenError("Permissão de acesso 'admin' exigida.");
  });
});
