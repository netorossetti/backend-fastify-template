import { FastifyTypedInstace } from "../../@types/fastify-typed-instance.js";
import { getUserProfile } from "./get-user-profile.js";
import { updateUserProfile } from "./update-user-profile.js";

export async function usersRoutes(app: FastifyTypedInstace) {
  app.register(getUserProfile);
  app.register(updateUserProfile);
}
