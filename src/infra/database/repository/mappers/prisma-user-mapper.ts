import { Prisma, User as PrismaUser } from "@prisma/client";
import { UniqueEntityId } from "src/core/entities/value-objects/unique-entity-id";
import { RoleUserType, User } from "src/domain/auth/enterprise/entities/user";

export class PrismaUserMapper {
  static toDomain(raw: PrismaUser): User {
    return User.create(
      {
        name: raw.name,
        email: raw.email,
        password: raw.password,
        active: raw.active,
        role: raw.role as RoleUserType,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id)
    );
  }

  static toPersistent(user: User): Prisma.UserUncheckedCreateInput {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      password: user.password,
      active: user.active,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
