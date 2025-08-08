import { Prisma, UsersOnTenants as PrismaMembership } from "@prisma/client";
import { UniqueEntityId } from "src/core/entities/value-objects/unique-entity-id";
import { Json } from "src/core/types/json";
import {
  Membership,
  RoleUserType,
} from "src/domain/enterprise/entities/membership";

export class PrismaMembershipMapper {
  static toDomain(raw: PrismaMembership): Membership {
    return Membership.create(
      {
        userId: raw.userId,
        tenantId: raw.tenantId,
        owner: raw.owner,
        role: raw.role as RoleUserType,
        permissions: raw.permissions as Json,
        lastAccessAt: raw.lastAccessAt,
        active: raw.active,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id)
    );
  }

  static toPersistent(
    membership: Membership
  ): Prisma.UsersOnTenantsUncheckedCreateInput {
    return {
      id: membership.id.toString(),
      userId: membership.userId,
      tenantId: membership.tenantId,
      owner: membership.owner,
      role: membership.role,
      permissions: !membership.permissions
        ? { set: null }
        : { set: membership.permissions as Prisma.JsonValue },
      lastAccessAt: membership.lastAccessAt,
      active: membership.active,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    };
  }
}
