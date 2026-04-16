import { FastifyTypedInstace } from "../../@types/fastify-typed-instance.js";
import { createNewUserAccess } from "./create-new-user-access.js";
import { listUsersAccess } from "./list-users-access.js";
import { removeUserAccess } from "./remove-user-access.js";
import { updateUserAccess } from "./update-user-access.js";

export async function membershipsRoutes(app: FastifyTypedInstace) {
  app.register(listUsersAccess);
  app.register(createNewUserAccess);
  app.register(updateUserAccess);
  app.register(removeUserAccess);
}
