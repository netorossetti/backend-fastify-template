import redisServices from "src/core/lib/redis/redis-services";
import { BcryptHasher } from "src/infra/criptography/bcrypt-hasher";
import { prisma } from "src/infra/database/prisma";
import request from "supertest";
import { AuthTokenFactory } from "test/factories/make-auth-token";
import { UserFactory } from "test/factories/make-user";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app";

describe("Authenticate (e2e)", () => {
  let userFactory: UserFactory;
  let bcryptHasher: BcryptHasher;

  beforeAll(async () => {
    userFactory = new UserFactory(prisma);
    bcryptHasher = new BcryptHasher();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test("Deve ser possível gerar um refresh token", async () => {
    const passwordHash = await bcryptHasher.hash("Test&1234");
    const user = await userFactory.makePrismaUser({
      name: "John Doe",
      email: "johndoe@example.com",
      password: passwordHash,
    });
    const authTokenFactory = new AuthTokenFactory(redisServices);
    const accessToken = await authTokenFactory.makeAuthToken(user);

    const response = await request(app.server)
      .post("/auth/refresh-token")
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      token: expect.any(String),
    });
  });
});
