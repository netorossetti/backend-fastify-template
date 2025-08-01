import { FastifyTypedInstace } from "../../@types/fastify-typed-instance";
import { createAccount } from "./create-account";

export async function authRoutes(app: FastifyTypedInstace) {
  app.register(createAccount);
}
