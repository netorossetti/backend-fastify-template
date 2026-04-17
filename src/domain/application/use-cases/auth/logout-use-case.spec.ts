import { faker } from "@faker-js/faker";
import { NotFoundError } from "src/core/errors/not-found-error.js";
import { TokenHelper } from "src/core/helpers/token-helper.js";
import { createTestContext } from "test/@context/context-test.js";
import { makeAuthToken } from "test/factories/make-auth-token.js";
import { makeMembership } from "test/factories/make-membership.js";
import { makeUser } from "test/factories/make-user.js";
import { LogoutUseCase } from "./logout-use-case.js";

let ctx: ReturnType<typeof createTestContext>;
let sut: LogoutUseCase;

describe("Login Use Case", () => {
  beforeEach(() => {
    ctx = createTestContext();
    sut = new LogoutUseCase(ctx.usersRepository, ctx.fakerRedisServices);
  });

  test("Deve ser possivel realizar um logout", async () => {
    const user = makeUser();
    ctx.usersRepository.items.push(user);
    const membership = makeMembership({
      userId: user.id.toString(),
    });
    ctx.membershipsRepository.items.push(membership);
    makeAuthToken(user, membership, ctx.fakerRedisServices);

    const keyAccessToken = TokenHelper.getAccessTokenKey(user.id.toString());
    const haskey = await ctx.fakerRedisServices.get(keyAccessToken);
    expect(haskey).toEqual(expect.any(String));

    const result = await sut.execute({
      userId: user.id.toString(),
    });
    const noKey = await ctx.fakerRedisServices.get(keyAccessToken);
    expect(noKey).toBe(null);

    expect(result.isSuccess()).toBe(true);
    expect(result.value).toEqual({});
  });

  test("Não deve ser possivel realizar um logout de usuário não cadastrado", async () => {
    const result = await sut.execute({
      userId: faker.string.uuid(),
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Usuário não localizado.");
    }
  });
});
