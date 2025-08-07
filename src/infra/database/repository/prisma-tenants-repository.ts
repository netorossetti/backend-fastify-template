import { PrismaClient } from "@prisma/client";
import { TenantsRepository } from "src/domain/application/repositories/tenants-repository";
import { Tenant } from "src/domain/enterprise/entities/tenant";
import { PrismaTenantMapper } from "./mappers/prisma-tenant-mapper";

export class PrismaTenantsRepository implements TenantsRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Tenant | null> {
    const dbTenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!dbTenant) return null;
    return PrismaTenantMapper.toDomain(dbTenant);
  }

  async findByDocument(documentNumber: string): Promise<Tenant | null> {
    const dbTenant = await this.prisma.tenant.findUnique({
      where: { documentNumber },
    });
    if (!dbTenant) return null;
    return PrismaTenantMapper.toDomain(dbTenant);
  }

  async findManyByUser(userId: string): Promise<Tenant[]> {
    const tenants = await this.prisma.tenant.findMany({
      where: {
        users: {
          some: {
            AND: [
              {
                userId: userId,
              },
              {
                OR: [
                  { owner: true },
                  { role: { in: ["admin", "superAdmin"] } },
                ],
              },
            ],
          },
        },
      },
    });
    return tenants.map(PrismaTenantMapper.toDomain);
  }

  async create(tenant: Tenant): Promise<Tenant> {
    const data = PrismaTenantMapper.toPersistent(tenant);
    const dbTenant = await this.prisma.tenant.create({ data });
    return PrismaTenantMapper.toDomain(dbTenant);
  }

  async save(tenant: Tenant): Promise<void> {
    const data = PrismaTenantMapper.toPersistent(tenant);
    await this.prisma.tenant.update({
      where: { id: tenant.id.toValue() },
      data,
    });
  }

  async delete(tenant: Tenant): Promise<boolean> {
    const deletedTenant = await this.prisma.tenant.delete({
      where: { id: tenant.id.toString() },
    });
    return deletedTenant !== null;
  }
}
