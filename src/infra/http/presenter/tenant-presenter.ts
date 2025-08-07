import { Tenant } from "src/domain/enterprise/entities/tenant";
import z from "zod/v4";

export class TenantPresenter {
  static toHttp(tenant: Tenant): z.infer<typeof schemaTenantPresenter> {
    return {
      id: tenant.id.toString(),
      name: tenant.name,
      nickName: tenant.nickName,
      documentType: tenant.documentType,
      documentNumber: tenant.documentNumber,
      active: tenant.active,
    };
  }
}

export const schemaTenantPresenter = z.object({
  id: z.string(),
  name: z.string(),
  nickName: z.string(),
  documentType: z.string(),
  documentNumber: z.string(),
  active: z.boolean(),
});
