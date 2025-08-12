import { PrismaClient } from "@prisma/client";

import { MembershipsRepository } from "src/domain/application/repositories/memberships-repository";
import { Membership } from "src/domain/enterprise/entities/membership";
import { UserWithMembership } from "src/domain/enterprise/entities/value-objects/user-with-membership";
import { PrismaMembershipMapper } from "./mappers/prisma-membership-mapper";
import { PrismaUserWithMembershipMapper } from "./mappers/prisma-user-with-membership-mapper";

export class PrismaMembershipsRepository implements MembershipsRepository {
  constructor(private prisma: PrismaClient) {}

  async findByUserAndTenant(
    userId: string,
    tenantId: string
  ): Promise<Membership | null> {
    const dbMembership = await this.prisma.usersOnTenants.findUnique({
      where: {
        userId_tenantId: {
          userId,
          tenantId,
        },
      },
    });
    if (!dbMembership) return null;
    return PrismaMembershipMapper.toDomain(dbMembership);
  }

  async findManyByUser(
    userId: string,
    active?: boolean
  ): Promise<Membership[]> {
    const dbMemberships = await this.prisma.usersOnTenants.findMany({
      where: { userId, active: active !== undefined ? active : undefined },
    });
    return dbMemberships.map(PrismaMembershipMapper.toDomain);
  }

  async findManyByTenant(
    tenantId: string,
    active?: boolean
  ): Promise<Membership[]> {
    const dbMemberships = await this.prisma.usersOnTenants.findMany({
      where: { tenantId, active: active !== undefined ? active : undefined },
    });
    return dbMemberships.map(PrismaMembershipMapper.toDomain);
  }

  async listUsersByTenant(tenantId: string): Promise<UserWithMembership[]> {
    const usersMembership = await this.prisma.usersOnTenants.findMany({
      where: { tenantId },
      include: { user: true },
    });
    return usersMembership.map(PrismaUserWithMembershipMapper.toDomain);
  }

  async verifyPermissionAdmin(
    tenantId: string,
    userId: string
  ): Promise<boolean> {
    const membership = await this.prisma.usersOnTenants.findUnique({
      where: { userId_tenantId: { userId, tenantId } },
    });
    if (!membership) return false;
    return (
      membership.owner || ["superAdmin", "admin"].includes(membership.role)
    );
  }

  async updateLastAccess(userId: string, tenantId: string): Promise<boolean> {
    const isUpdated = await this.prisma.usersOnTenants.update({
      where: { userId_tenantId: { userId, tenantId } },
      data: { lastAccessAt: new Date() },
    });
    return isUpdated ? true : false;
  }

  async create(membership: Membership): Promise<Membership> {
    const data = PrismaMembershipMapper.toPersistent(membership);
    const dbMembership = await this.prisma.usersOnTenants.create({ data });
    return PrismaMembershipMapper.toDomain(dbMembership);
  }

  async save(membership: Membership): Promise<void> {
    const data = PrismaMembershipMapper.toPersistent(membership);
    await this.prisma.usersOnTenants.update({
      where: { id: membership.id.toValue() },
      data,
    });
  }

  async delete(membership: Membership): Promise<boolean> {
    const deletedMembership = await this.prisma.usersOnTenants.delete({
      where: { id: membership.id.toString() },
    });
    return deletedMembership !== null;
  }
}
