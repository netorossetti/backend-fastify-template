import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import { UniqueEntityId } from "src/core/entities/value-objects/unique-entity-id";
import { Tenant, TenantProps } from "src/domain/enterprise/entities/tenant";
import { PrismaTenantMapper } from "src/infra/database/repository/mappers/prisma-tenant-mapper";
import { fake } from "validation-br/dist/cpf";

export function makeTenant(
  override: Partial<TenantProps> = {},
  id?: UniqueEntityId
) {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const newTenant = Tenant.create(
    {
      name: `${firstName} ${lastName}`,
      nickName: firstName,
      documentType: "CPF",
      documentNumber: fake(),
      active: true,
      ...override,
    },
    id
  );
  return newTenant;
}

export class TenantFactory {
  constructor(private prisma: PrismaClient) {}

  async makePrismaTenant(data: Partial<TenantProps> = {}): Promise<Tenant> {
    const Tenant = makeTenant(data);
    await this.prisma.tenant.create({
      data: PrismaTenantMapper.toPersistent(Tenant),
    });
    return Tenant;
  }
}
