import { BcryptHasher } from "src/infra/criptography/bcrypt-hasher";
import { prisma } from "src/infra/database/prisma";
import request from "supertest";
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

  test("Deve ser possível se autenticar", async () => {
    const passwordHash = await bcryptHasher.hash("Test&1234");
    userFactory.makePrismaUser({
      name: "John Doe",
      email: "johndoe@example.com",
      password: passwordHash,
    });

    const response = await request(app.server).post("/auth/login").send({
      email: "johndoe@example.com",
      password: "Test&1234",
    });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      token: expect.any(String),
    });
  });
});
