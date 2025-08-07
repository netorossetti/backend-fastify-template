import { prisma } from "src/infra/database/prisma";
import { BcryptHasher } from "src/infra/lib/criptography/bcrypt-hasher";
import request from "supertest";
import { MembershipFactory } from "test/factories/make-membership";
import { TenantFactory } from "test/factories/make-tenant";
import { UserFactory } from "test/factories/make-user";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app";

describe("Auth - ForgotPassword (e2e)", () => {
  let userFactory: UserFactory;
  let tenantFactory: TenantFactory;
  let membershipFactory: MembershipFactory;
  let bcryptHasher: BcryptHasher;

  beforeAll(async () => {
    userFactory = new UserFactory(prisma);
    tenantFactory = new TenantFactory(prisma);
    membershipFactory = new MembershipFactory(prisma);
    bcryptHasher = new BcryptHasher();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test("Deve ser possível solicitar recuperação de senha", async () => {
    const passwordHash = await bcryptHasher.hash("Test&1234");
    const user = await userFactory.makePrismaUser({
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@example.com",
      password: passwordHash,
    });

    const response = await request(app.server)
      .post("/auth/forgot-password")
      .send({
        email: user.email,
      });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      message: "E-mail de recuperação de senha encaminhado com sucesso.",
    });
  });
});
