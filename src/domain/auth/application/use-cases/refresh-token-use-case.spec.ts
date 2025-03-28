import { UnauthorizedError } from "src/core/errors/unauthorized-error";
import { DateHelper } from "src/core/helpers/date-helper";
import { FakeHasher } from "test/cryptography/fake-hasher";
import { makeAuthToken } from "test/factories/make-auth-token";
import { makeUser } from "test/factories/make-user";
import { FakeRedisServices } from "test/lib/faker-redis-services";
import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository";
import { RefreshTokenUseCase } from "./refresh-token-use-case";

let inMemoryUsersRepository: InMemoryUsersRepository;
let fakeHasher: FakeHasher;
let fakeRedisServices: FakeRedisServices;
let sut: RefreshTokenUseCase;

describe("Refresh Token Use Case", () => {
  beforeEach(() => {
    fakeHasher = new FakeHasher();
    fakeRedisServices = new FakeRedisServices();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    sut = new RefreshTokenUseCase(fakeRedisServices);

    // tell vitest we use mocked time
    vi.useFakeTimers();
  });

  afterEach(() => {
    // restoring date after each test run
    vi.useRealTimers();
  });

  test("Deve ser possível solicitar um refresh", async () => {
    const passwordHash = await fakeHasher.hash("teste@1234");
    const user = makeUser({ password: passwordHash });
    inMemoryUsersRepository.items.push(user);
    const token = makeAuthToken(user, fakeRedisServices);
    const result = await sut.execute({
      usuarioId: user.id.toString(),
      token,
    });

    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value).toEqual(
        expect.objectContaining({ token: expect.any(String) })
      );
      expect(result.value.token).toEqual(token);
    }
  });

  test("Deve ser possível solicitar um refresh e receber um token atualizado", async () => {
    const date = new Date();
    vi.setSystemTime(date);

    const passwordHash = await fakeHasher.hash("teste@1234");
    const user = makeUser({ password: passwordHash });
    inMemoryUsersRepository.items.push(user);
    const token = makeAuthToken(user, fakeRedisServices);

    vi.setSystemTime(DateHelper.addHours(date, 2));
    const result = await sut.execute({
      usuarioId: user.id.toString(),
      token,
    });

    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value).toEqual(
        expect.objectContaining({ token: expect.any(String) })
      );
      expect(result.value.token).not.toEqual(token);
    }
  });

  test("Não deve ser possível solicitar um refresh de um token expirado", async () => {
    const date = new Date();
    vi.setSystemTime(date);

    const passwordHash = await fakeHasher.hash("teste@1234");
    const user = makeUser({ password: passwordHash });
    inMemoryUsersRepository.items.push(user);
    const token = makeAuthToken(user, fakeRedisServices);

    vi.setSystemTime(DateHelper.addHours(date, 5));
    const result = await sut.execute({
      usuarioId: user.id.toString(),
      token,
    });

    expect(result.isFailure()).toBe(true);
    expect(result.value).instanceOf(UnauthorizedError);
  });
});
