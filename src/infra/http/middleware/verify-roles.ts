import type { FastifyInstance } from "fastify";
import { fastifyPlugin } from "fastify-plugin";
import { ForbiddenError } from "src/core/errors/forbidden-error.js";
import { RoleUserType } from "src/domain/enterprise/entities/membership.js";

export const verifyRole = (allowedRoles: RoleUserType[]) =>
  fastifyPlugin(async (app: FastifyInstance) => {
    app.addHook("onRequest", async (request, reply) => {
      const { role } = request.user || {};
      if (role !== "superAdmin")
        if (!role || !allowedRoles.includes(role)) {
          throw new ForbiddenError(`Permissão de acesso '${allowedRoles.join("' ou '")}' exigida.`);
        }
    });
  });
