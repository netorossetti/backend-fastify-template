import { FastifyTypedInstace } from "../../@types/fastify-typed-instance.js";
import { createTenant } from "./create-tenant.js";
import { fetchTenants } from "./fetch-tenants.js";
import { inactivateTenant } from "./inactivate-tenant.js";
import { reactivateTenant } from "./reactivate-tenant.js";
import { selectTenant } from "./select-tenant.js";
import { updateTenant } from "./update-tenant.js";

export async function tenantsRoutes(app: FastifyTypedInstace) {
  app.register(fetchTenants);
  app.register(createTenant);
  app.register(updateTenant);
  app.register(selectTenant);
  app.register(inactivateTenant);
  app.register(reactivateTenant);
}
