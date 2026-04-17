import { env } from "src/core/env/index.js";
import { UnauthorizedError } from "src/core/errors/unauthorized-error.js";
import { DateHelper } from "src/core/helpers/date-helper.js";
import { createTestContext } from "test/@context/context-test.js";
import { makeAuthToken } from "test/factories/make-auth-token.js";
import { makeMembership } from "test/factories/make-membership.js";
import { makeUser } from "test/factories/make-user.js";
import { RefreshTokenUseCase } from "./refresh-token-use-case.js";

let ctx: ReturnType<typeof createTestContext>;
let sut: RefreshTokenUseCase;

describe("Refresh Token Use Case", () => {
  beforeEach(() => {
    ctx = createTestContext();
    sut = new RefreshTokenUseCase(ctx.fakerRedisServices);

    // tell vitest we use mocked time
    vi.useFakeTimers();
  });

  afterEach(() => {
    // restoring date after each test run
    vi.useRealTimers();
  });

  test("Deve ser possível solicitar um refresh", async () => {
    const passwordHash = await ctx.fakerHasher.hash("teste@1234");
    const user = makeUser({ password: passwordHash });
    ctx.usersRepository.items.push(user);
    const membership = makeMembership({ userId: user.id.toString() });
    const token = makeAuthToken(user, membership, ctx.fakerRedisServices);
    const result = await sut.execute({
      usuarioId: user.id.toString(),
      token,
    });

    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value).toEqual(expect.objectContaining({ token: expect.any(String) }));
      expect(result.value.token).toEqual(token);
    }
  });

  test("Deve ser possível solicitar um refresh e receber um token atualizado", async () => {
    const date = new Date();
    vi.setSystemTime(date);

    const passwordHash = await ctx.fakerHasher.hash("teste@1234");
    const user = makeUser({ password: passwordHash });
    ctx.usersRepository.items.push(user);
    const membership = makeMembership({ userId: user.id.toString() });
    const token = makeAuthToken(user, membership, ctx.fakerRedisServices);

    const jwtExpSeconds = (env.JWT_EXP ?? 10) - 10;
    vi.setSystemTime(DateHelper.addSeconds(date, jwtExpSeconds));
    const result = await sut.execute({
      usuarioId: user.id.toString(),
      token,
    });

    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value).toEqual(expect.objectContaining({ token: expect.any(String) }));
      expect(result.value.token).not.toEqual(token);
    }
  });

  test("Não deve ser possível solicitar um refresh de um token expirado", async () => {
    const date = new Date();
    vi.setSystemTime(date);

    const passwordHash = await ctx.fakerHasher.hash("teste@1234");
    const user = makeUser({ password: passwordHash });
    ctx.usersRepository.items.push(user);
    const membership = makeMembership({ userId: user.id.toString() });
    const token = makeAuthToken(user, membership, ctx.fakerRedisServices);

    const jwtExpSeconds = (env.JWT_EXP ?? 10) + 10;
    vi.setSystemTime(DateHelper.addSeconds(date, jwtExpSeconds));
    const result = await sut.execute({
      usuarioId: user.id.toString(),
      token,
    });

    expect(result.isFailure()).toBe(true);
    expect(result.value).instanceOf(UnauthorizedError);
  });
});
