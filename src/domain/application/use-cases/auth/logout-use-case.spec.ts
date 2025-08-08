import { faker } from "@faker-js/faker";
import { NotFoundError } from "src/core/errors/not-found-error";
import { TokenHelper } from "src/core/helpers/token-helper";
import { makeAuthToken } from "test/factories/make-auth-token";
import { makeMembership } from "test/factories/make-membership";
import { makeUser } from "test/factories/make-user";
import { FakeRedisServices } from "test/lib/faker-redis-services";
import { InMemoryMembershipsRepository } from "test/repositories/in-memory-memberships-repository";
import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository";
import { LogoutUseCase } from "./logout-use-case";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryMembershipsRepository: InMemoryMembershipsRepository;
let fakeRedisServices: FakeRedisServices;
let sut: LogoutUseCase;

describe("Login Use Case", () => {
  beforeEach(() => {
    fakeRedisServices = new FakeRedisServices();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryMembershipsRepository = new InMemoryMembershipsRepository();
    sut = new LogoutUseCase(inMemoryUsersRepository, fakeRedisServices);
  });

  test("Deve ser possivel realizar um logout", async () => {
    const user = makeUser();
    inMemoryUsersRepository.items.push(user);
    const membership = makeMembership({
      userId: user.id.toString(),
    });
    inMemoryMembershipsRepository.items.push(membership);
    makeAuthToken(user, membership, fakeRedisServices);

    const keyAccessToken = TokenHelper.getAccessTokenKey(user.id.toString());
    const haskey = await fakeRedisServices.get(keyAccessToken);
    expect(haskey).toEqual(expect.any(String));

    const result = await sut.execute({
      userId: user.id.toString(),
    });
    const noKey = await fakeRedisServices.get(keyAccessToken);
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
