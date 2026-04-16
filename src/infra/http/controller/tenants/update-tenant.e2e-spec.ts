import { faker } from "@faker-js/faker";
import { PrismaClient } from "prisma/generated/prisma/client.js";
import { StringHelper } from "src/core/helpers/string-helper.js";
import redisServices from "src/core/lib/redis/redis-services.js";
import { getPrisma } from "src/infra/database/prisma.js";
import request from "supertest";
import { AuthTokenFactory } from "test/factories/make-auth-token.js";
import { MembershipFactory } from "test/factories/make-membership.js";
import { TenantFactory } from "test/factories/make-tenant.js";
import { UserFactory } from "test/factories/make-user.js";
import * as cnpj from "validation-br/dist/cnpj";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app.js";

describe("Tenant - UpdateTenant (e2e)", () => {
  let userFactory: UserFactory;
  let tenantFactory: TenantFactory;
  let membershipFactory: MembershipFactory;
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = getPrisma();
    userFactory = new UserFactory(prisma);
    tenantFactory = new TenantFactory(prisma);
    membershipFactory = new MembershipFactory(prisma);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test("Deve ser possível atualizar dados do tenant", async () => {
    const user = await userFactory.makePrismaUser({
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@example.com",
      password: "passwordHash",
    });
    const tenant = await tenantFactory.makePrismaTenant();
    const membership = await membershipFactory.makePrismaMembership({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
      role: "admin",
    });

    // Autenticar no tenant 1
    const authTokenFactory = new AuthTokenFactory(redisServices);
    const accessToken = await authTokenFactory.makeAuthToken(user, membership);

    const response = await request(app.server)
      .put(`/tenants/${tenant.id.toString()}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: StringHelper.truncate(faker.person.fullName(), 200),
        nickName: StringHelper.truncate(faker.person.firstName(), 50),
        documentType: "CNPJ",
        documentNumber: cnpj.fake({ withMask: true, alphanumeric: false }),
      });

    expect(response.statusCode).toEqual(204);
  });
});
