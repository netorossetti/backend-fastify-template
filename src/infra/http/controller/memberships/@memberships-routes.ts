import { FastifyTypedInstace } from "../../@types/fastify-typed-instance";
import { createNewUserAccess } from "./create-new-user-access";
import { listUsersAccess } from "./list-users-access";
import { removeUserAccess } from "./remove-user-access";
import { updateUserAccess } from "./update-user-access";

export async function membershipsRoutes(app: FastifyTypedInstace) {
  app.register(listUsersAccess);
  app.register(createNewUserAccess);
  app.register(updateUserAccess);
  app.register(removeUserAccess);
}
