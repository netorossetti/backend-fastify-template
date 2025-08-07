import { FastifyTypedInstace } from "../../@types/fastify-typed-instance";
import { getUserProfile } from "./get-user-profile";
import { updateUserProfile } from "./update-user-profile";

export async function usersRoutes(app: FastifyTypedInstace) {
  app.register(getUserProfile);
  app.register(updateUserProfile);
}
