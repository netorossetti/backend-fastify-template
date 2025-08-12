import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import { UniqueEntityId } from "src/core/entities/value-objects/unique-entity-id";
import {
  Membership,
  MembershipProps,
} from "src/domain/enterprise/entities/membership";
import { PrismaMembershipMapper } from "src/infra/database/repository/mappers/prisma-membership-mapper";

export function makeMembership(
  override: Partial<MembershipProps> = {},
  id?: UniqueEntityId
) {
  const newMembership = Membership.create(
    {
      userId: faker.string.uuid(),
      tenantId: faker.string.uuid(),
      owner: false,
      role: "user",
      ...override,
    },
    id ?? new UniqueEntityId()
  );
  return newMembership;
}

export class MembershipFactory {
  constructor(private prisma: PrismaClient) {}

  async makePrismaMembership(
    data: Partial<MembershipProps> = {}
  ): Promise<Membership> {
    const membership = makeMembership(data);
    await this.prisma.usersOnTenants.create({
      data: PrismaMembershipMapper.toPersistent(membership),
    });
    return membership;
  }
}
