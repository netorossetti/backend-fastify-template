import { FastifyTypedInstace } from "../../@types/fastify-typed-instance";
import { login } from "./login";
import { register } from "./register";

export async function authRoutes(app: FastifyTypedInstace) {
  app.register(login);
  app.register(register);
}
