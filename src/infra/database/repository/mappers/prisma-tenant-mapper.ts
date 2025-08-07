import { Prisma, Tenant as PrismaTenant } from "@prisma/client";
import { UniqueEntityId } from "src/core/entities/value-objects/unique-entity-id";
import { Tenant } from "src/domain/enterprise/entities/tenant";

export class PrismaTenantMapper {
  static toDomain(raw: PrismaTenant): Tenant {
    return Tenant.create(
      {
        name: raw.name,
        nickName: raw.nickName,
        documentType: raw.documentType,
        documentNumber: raw.documentNumber,
        active: raw.active,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id)
    );
  }

  static toPersistent(tenant: Tenant): Prisma.TenantUncheckedCreateInput {
    return {
      id: tenant.id.toString(),
      name: tenant.name,
      nickName: tenant.nickName,
      documentType: tenant.documentType,
      documentNumber: tenant.documentNumber,
      active: tenant.active,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    };
  }
}
