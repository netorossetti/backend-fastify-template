import redisServices from "src/core/lib/redis/redis-services";
import { prisma } from "src/infra/database/prisma";
import request from "supertest";
import { AuthTokenFactory } from "test/factories/make-auth-token";
import { MembershipFactory } from "test/factories/make-membership";
import { TenantFactory } from "test/factories/make-tenant";
import { UserFactory } from "test/factories/make-user";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app";

describe("Tenant - FetchTenant (e2e)", () => {
  let userFactory: UserFactory;
  let tenantFactory: TenantFactory;
  let membershipFactory: MembershipFactory;

  beforeAll(async () => {
    userFactory = new UserFactory(prisma);
    tenantFactory = new TenantFactory(prisma);
    membershipFactory = new MembershipFactory(prisma);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test("Deve ser possível listar as contas do usuário", async () => {
    const user = await userFactory.makePrismaUser({
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@example.com",
      password: "passwordHash",
    });
    const tenant1 = await tenantFactory.makePrismaTenant();
    const membership1 = await membershipFactory.makePrismaMembership({
      userId: user.id.toString(),
      tenantId: tenant1.id.toString(),
      owner: true,
      role: "superAdmin",
    });

    const tenant2 = await tenantFactory.makePrismaTenant();
    await membershipFactory.makePrismaMembership({
      userId: user.id.toString(),
      tenantId: tenant2.id.toString(),
      owner: false,
      role: "admin",
    });
    const tenant3 = await tenantFactory.makePrismaTenant();
    await membershipFactory.makePrismaMembership({
      userId: user.id.toString(),
      tenantId: tenant3.id.toString(),
      owner: false,
      role: "user",
    });

    // Autenticar no tenant 1
    const authTokenFactory = new AuthTokenFactory(redisServices);
    const accessToken = await authTokenFactory.makeAuthToken(user, membership1);

    // Alterar conta para tenant 2
    const response = await request(app.server)
      .get(`/tenants`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        tenants: expect.arrayContaining([
          {
            id: tenant1.id.toString(),
            name: tenant1.name,
            nickName: tenant1.nickName,
            documentType: tenant1.documentType,
            documentNumber: tenant1.documentNumber,
            active: tenant1.active,
          },
          {
            id: tenant2.id.toString(),
            name: tenant2.name,
            nickName: tenant2.nickName,
            documentType: tenant2.documentType,
            documentNumber: tenant2.documentNumber,
            active: tenant2.active,
          },
        ]),
      })
    );
  });
});
