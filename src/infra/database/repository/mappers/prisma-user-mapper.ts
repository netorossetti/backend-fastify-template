import { Prisma, User as PrismaUser } from "prisma/generated/prisma/client";
import { UniqueEntityId } from "src/core/entities/value-objects/unique-entity-id.js";
import { User } from "src/domain/enterprise/entities/user.js";

export class PrismaUserMapper {
  static toDomain(raw: PrismaUser): User {
    return User.create(
      {
        firstName: raw.firstName,
        lastName: raw.lastName,
        nickName: raw.nickName,
        email: raw.email,
        password: raw.password,
        avatarUrl: raw.avatarUrl,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toPersistent(user: User): Prisma.UserUncheckedCreateInput {
    return {
      id: user.id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      nickName: user.nickName,
      email: user.email,
      password: user.password,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
