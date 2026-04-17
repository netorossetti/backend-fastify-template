import { faker } from "@faker-js/faker";
import { NotAllowedError } from "src/core/errors/not-allowed-error.js";
import { NotFoundError } from "src/core/errors/not-found-error.js";
import { UnauthorizedError } from "src/core/errors/unauthorized-error.js";
import { createTestContext } from "test/@context/context-test.js";
import { makeMembership } from "test/factories/make-membership.js";
import { makeUser } from "test/factories/make-user.js";
import { LoginUseCase } from "./login-use-case.js";

let ctx: ReturnType<typeof createTestContext>;
let sut: LoginUseCase;

describe("Login Use Case", () => {
  beforeEach(() => {
    ctx = createTestContext();
    sut = new LoginUseCase(
      ctx.usersRepository,
      ctx.tenantsRepository,
      ctx.membershipsRepository,
      ctx.fakerHasher,
      ctx.fakerRedisServices,
    );
  });

  test("Deve ser possivel realizar um login", async () => {
    const passwordHash = await ctx.fakerHasher.hash("teste@1234");
    const user = makeUser({ password: passwordHash });
    ctx.usersRepository.items.push(user);
    ctx.membershipsRepository.items.push(
      makeMembership({
        userId: user.id.toString(),
      }),
    );
    const result = await sut.execute({
      email: user.email,
      password: "teste@1234",
    });
    expect(result.isSuccess()).toBe(true);
    expect(result.value).toEqual(expect.objectContaining({ token: expect.any(String) }));
  });

  test("Não deve ser possivel realizar um login de usuário não cadastrado", async () => {
    const result = await sut.execute({
      email: faker.string.uuid(),
      password: "teste@",
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("E-mail inválido.");
    }
  });

  test("Não deve ser possivel realizar um login de usuário com senha não definida", async () => {
    const user = makeUser({ password: "" });
    ctx.usersRepository.items.push(user);
    const result = await sut.execute({
      email: user.email,
      password: "teste@",
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Senha não definida.");
    }
  });

  test("Não deve ser possivel realizar um login de usuário com senha inválida", async () => {
    const passwordHash = await ctx.fakerHasher.hash("teste@1234");
    const user = makeUser({ password: passwordHash });
    ctx.usersRepository.items.push(user);
    const result = await sut.execute({
      email: user.email,
      password: "teste@",
    });
    expect(result.isFailure()).toBe(true);
    expect(result.value).instanceOf(UnauthorizedError);
  });

  test("Não deve ser possivel realizar um login de usuário sem vinculo de acesso", async () => {
    const passwordHash = await ctx.fakerHasher.hash("teste@1234");
    const user = makeUser({ password: passwordHash });
    ctx.usersRepository.items.push(user);
    const result = await sut.execute({
      email: user.email,
      password: "teste@1234",
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe("Acesso negado. Usuário sem vinculo de acesso.");
    }
  });
});
