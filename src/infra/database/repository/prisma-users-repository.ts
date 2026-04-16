import { PrismaClient } from "prisma/generated/prisma/client";
import { UsersRepository } from "src/domain/application/repositories/users-repository.js";
import { User } from "src/domain/enterprise/entities/user.js";
import { PrismaUserMapper } from "./mappers/prisma-user-mapper.js";

export class PrismaUsersRepository implements UsersRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const dbUser = await this.prisma.user.findUnique({ where: { id } });
    if (!dbUser) return null;
    return PrismaUserMapper.toDomain(dbUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    const dbUser = await this.prisma.user.findUnique({ where: { email } });
    if (!dbUser) return null;
    return PrismaUserMapper.toDomain(dbUser);
  }

  async create(user: User): Promise<User> {
    const data = PrismaUserMapper.toPersistent(user);
    const dbUser = await this.prisma.user.create({ data });
    return PrismaUserMapper.toDomain(dbUser);
  }

  async save(user: User): Promise<void> {
    const data = PrismaUserMapper.toPersistent(user);
    await this.prisma.user.update({
      where: { id: user.id.toValue() },
      data,
    });
  }

  async delete(user: User): Promise<boolean> {
    const deletedUser = await this.prisma.user.delete({
      where: { id: user.id.toString() },
    });
    return deletedUser !== null;
  }
}
