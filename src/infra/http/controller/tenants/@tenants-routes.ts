import { FastifyTypedInstace } from "../../@types/fastify-typed-instance";
import { createTenant } from "./create-tenant";
import { fetchTenants } from "./fetch-tenants";
import { inactivateTenant } from "./inactivate-tenant";
import { reactivateTenant } from "./reactivate-tenant";
import { selectTenant } from "./select-tenant";
import { updateTenant } from "./update-tenant";

export async function tenantsRoutes(app: FastifyTypedInstace) {
  app.register(fetchTenants);
  app.register(createTenant);
  app.register(updateTenant);
  app.register(selectTenant);
  app.register(inactivateTenant);
  app.register(reactivateTenant);
}
