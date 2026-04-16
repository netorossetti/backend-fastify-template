import { PrismaClient } from "prisma/generated/prisma/client.js";
import redisServices from "src/core/lib/redis/redis-services.js";
import { getPrisma } from "src/infra/database/prisma.js";
import { BcryptHasher } from "src/infra/lib/criptography/bcrypt-hasher.js";
import request from "supertest";
import { AuthTokenFactory } from "test/factories/make-auth-token.js";
import { MembershipFactory } from "test/factories/make-membership.js";
import { TenantFactory } from "test/factories/make-tenant.js";
import { UserFactory } from "test/factories/make-user.js";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app.js";

describe("Tenant - SelectTenant (e2e)", () => {
  let userFactory: UserFactory;
  let tenantFactory: TenantFactory;
  let membershipFactory: MembershipFactory;
  let bcryptHasher: BcryptHasher;
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = getPrisma();
    userFactory = new UserFactory(prisma);
    tenantFactory = new TenantFactory(prisma);
    membershipFactory = new MembershipFactory(prisma);
    bcryptHasher = new BcryptHasher();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test("Deve ser possível selecinar uma conta", async () => {
    const passwordHash = await bcryptHasher.hash("Test&1234");
    const user = await userFactory.makePrismaUser({
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@example.com",
      password: passwordHash,
    });
    const tenant1 = await tenantFactory.makePrismaTenant();
    const membership1 = await membershipFactory.makePrismaMembership({
      userId: user.id.toString(),
      tenantId: tenant1.id.toString(),
    });

    const tenant2 = await tenantFactory.makePrismaTenant();
    const membership2 = await membershipFactory.makePrismaMembership({
      userId: user.id.toString(),
      tenantId: tenant2.id.toString(),
      role: "user",
    });

    // Autenticar no tenant 1
    const authTokenFactory = new AuthTokenFactory(redisServices);
    const accessToken = await authTokenFactory.makeAuthToken(user, membership1);

    // Alterar conta para tenant 2
    const response = await request(app.server)
      .post(`/tenants/select/${membership2.tenantId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});

    expect(response.statusCode).toEqual(200);
    const boby = response.body;
    expect(boby).toEqual(
      expect.objectContaining({
        user: expect.objectContaining({
          currentTenantId: membership2.tenantId,
        }),
      }),
    );
  });
});
