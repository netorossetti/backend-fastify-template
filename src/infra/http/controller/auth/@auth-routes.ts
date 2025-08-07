import { FastifyTypedInstace } from "../../@types/fastify-typed-instance";
import { forgotPassword } from "./forgot-password";
import { login } from "./login";
import { logout } from "./logout";
import { refreshToken } from "./refresh-token";
import { resetPassword } from "./reset-password";

export async function authRoutes(app: FastifyTypedInstace) {
  app.register(login);
  app.register(logout);
  app.register(refreshToken);
  app.register(forgotPassword);
  app.register(resetPassword);
}
