UserWithMembership;
import {
  UsersOnTenants as PrismaMembership,
  User as PrismaUser,
} from "@prisma/client";
import { Json } from "src/core/types/json";
import { RoleUserType } from "src/domain/enterprise/entities/membership";
import { UserWithMembership } from "src/domain/enterprise/entities/value-objects/user-with-membership";

type RawUserWithMembership = PrismaMembership & {
  user: PrismaUser;
};

export class PrismaUserWithMembershipMapper {
  static toDomain(raw: RawUserWithMembership): UserWithMembership {
    return UserWithMembership.create({
      userId: raw.userId,
      firstName: raw.user.firstName,
      lastName: raw.user.lastName,
      nickName: raw.user.nickName,
      email: raw.user.email,
      avatarUrl: raw.user.avatarUrl,
      owner: raw.owner,
      role: raw.role as RoleUserType,
      permissions: raw.permissions as Json,
      lastAccessAt: raw.lastAccessAt,
      active: raw.active,
    });
  }
}
