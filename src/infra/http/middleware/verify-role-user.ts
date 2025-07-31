import type { FastifyInstance } from "fastify";
import { fastifyPlugin } from "fastify-plugin";
import { ForbiddenError } from "src/core/errors/forbidden-error";
import type { RoleUserType } from "src/domain/enterprise/entities/user";

export const verifyRoleUser = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook("onRequest", async (request, reply) => {
    const roleToVerify: RoleUserType[] = ["user", "admin", "superAdmin"];
    const { role } = request.user;
    if (!roleToVerify.includes(role))
      throw new ForbiddenError("Permissão de acesso 'user' exigida.");
  });
});
