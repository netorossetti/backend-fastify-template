import { UnauthorizedError } from "@core/errors/unauthorized-error";
import { fastifyPlugin } from "fastify-plugin";
import redisServices from "src/core/lib/redis/redis-services";
import { FastifyTypedInstace } from "../@types/fastify-typed-instance";

export const auth = fastifyPlugin(async (app: FastifyTypedInstace) => {
  app.addHook("onRequest", async (request, response) => {
    try {
      await request.jwtVerify();

      // Recuperar token da requisicão
      const token = request.headers.authorization?.replace("Bearer ", "") ?? "";
      if (!token) throw new UnauthorizedError();

      // Recuperar token ativo do usuário
      const isTokenActive = await redisServices.get(
        `access_token:${request.user.id}`
      );

      // Verifica se o token está ativo no Redis
      if (!isTokenActive || isTokenActive !== token) {
        throw new UnauthorizedError();
      }
    } catch {
      throw new UnauthorizedError();
    }
  });

  app.addHook("preHandler", async (request) => {
    request.getAutorizationBearerToken = async () => {
      try {
        return request.headers.authorization?.replace("Bearer ", "") ?? "";
      } catch (error) {
        return "";
      }
    };
  });
});
