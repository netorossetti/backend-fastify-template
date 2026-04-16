import { FastifyTypedInstace } from "../../@types/fastify-typed-instance.js";
import { changePassword } from "./change-password.js";
import { forgotPassword } from "./forgot-password.js";
import { login } from "./login.js";
import { logout } from "./logout.js";
import { refreshToken } from "./refresh-token.js";
import { resetPassword } from "./reset-password.js";

export async function authRoutes(app: FastifyTypedInstace) {
  app.register(login);
  app.register(logout);
  app.register(refreshToken);
  app.register(forgotPassword);
  app.register(resetPassword);
  app.register(changePassword);
}
