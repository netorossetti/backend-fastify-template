import { NotAllowedError } from "src/core/errors/not-allowed-error";
import { NotFoundError } from "src/core/errors/not-found-error";
import { UnauthorizedError } from "src/core/errors/unauthorized-error";
import { FakeHasher } from "test/cryptography/fake-hasher";
import { makeUser } from "test/factories/make-user";
import { FakeRedisServices } from "test/lib/faker-redis-services";
import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository";
import { LoginUseCase } from "./login-use-case";

let inMemoryUsersRepository: InMemoryUsersRepository;
let fakeHasher: FakeHasher;
let fakeRedisServices: FakeRedisServices;
let sut: LoginUseCase;

describe("Login Use Case", () => {
  beforeEach(() => {
    fakeHasher = new FakeHasher();
    fakeRedisServices = new FakeRedisServices();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    sut = new LoginUseCase(
      inMemoryUsersRepository,
      fakeHasher,
      fakeRedisServices
    );
  });

  test("Deve ser possivel realizar um login", async () => {
    const user = makeUser({ password: "teste@1234" });
    inMemoryUsersRepository.items.push(user);
    const result = await sut.execute({
      email: user.email,
      password: "teste@1234",
    });
    expect(result.isSuccess()).toBe(true);
    expect(result.value).toEqual(
      expect.objectContaining({ token: expect.any(String) })
    );
  });

  test("Não deve ser possivel realizar um login com senha inválida", async () => {
    const user = makeUser({ password: "teste@1234" });
    inMemoryUsersRepository.items.push(user);
    const result = await sut.execute({
      email: user.email,
      password: "teste@",
    });
    expect(result.isFailure()).toBe(true);
    expect(result.value).instanceOf(UnauthorizedError);
  });

  test("Não deve ser possivel realizar um login com usuário inválido", async () => {
    const result = await sut.execute({
      email: "email-invalido@email.com.br",
      password: "teste@",
    });
    expect(result.isFailure()).toBe(true);
    expect(result.value).instanceOf(NotFoundError);
  });

  test("Não deve ser possivel realizar um login para um usuário inativado", async () => {
    const user = makeUser({ password: "teste@1234", active: false });
    inMemoryUsersRepository.items.push(user);
    const result = await sut.execute({
      email: user.email,
      password: "teste@1234",
    });
    expect(result.isFailure()).toBe(true);
    expect(result.value).instanceOf(NotAllowedError);
  });
});
