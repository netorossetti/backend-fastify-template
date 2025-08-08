import { faker } from "@faker-js/faker";
import { NotAllowedError } from "src/core/errors/not-allowed-error";
import { NotFoundError } from "src/core/errors/not-found-error";
import { UnauthorizedError } from "src/core/errors/unauthorized-error";
import { makeMembership } from "test/factories/make-membership";
import { makeUser } from "test/factories/make-user";
import { FakeHasher } from "test/lib/cryptography/fake-hasher";
import { FakeRedisServices } from "test/lib/faker-redis-services";
import { InMemoryMembershipsRepository } from "test/repositories/in-memory-memberships-repository";
import { InMemoryTenantsRepository } from "test/repositories/in-memory-tenants-repository";
import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository";
import { LoginUseCase } from "./login-use-case";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryTenantsRepository: InMemoryTenantsRepository;
let inMemoryMembershipsRepository: InMemoryMembershipsRepository;
let fakeHasher: FakeHasher;
let fakeRedisServices: FakeRedisServices;
let sut: LoginUseCase;

describe("Login Use Case", () => {
  beforeEach(() => {
    fakeHasher = new FakeHasher();
    fakeRedisServices = new FakeRedisServices();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryTenantsRepository = new InMemoryTenantsRepository();
    inMemoryMembershipsRepository = new InMemoryMembershipsRepository();
    sut = new LoginUseCase(
      inMemoryUsersRepository,
      inMemoryTenantsRepository,
      inMemoryMembershipsRepository,
      fakeHasher,
      fakeRedisServices
    );
  });

  test("Deve ser possivel realizar um login", async () => {
    const passwordHash = await fakeHasher.hash("teste@1234");
    const user = makeUser({ password: passwordHash });
    inMemoryUsersRepository.items.push(user);
    inMemoryMembershipsRepository.items.push(
      makeMembership({
        userId: user.id.toString(),
      })
    );
    const result = await sut.execute({
      email: user.email,
      password: "teste@1234",
    });
    expect(result.isSuccess()).toBe(true);
    expect(result.value).toEqual(
      expect.objectContaining({ token: expect.any(String) })
    );
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
    inMemoryUsersRepository.items.push(user);
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
    const passwordHash = await fakeHasher.hash("teste@1234");
    const user = makeUser({ password: passwordHash });
    inMemoryUsersRepository.items.push(user);
    const result = await sut.execute({
      email: user.email,
      password: "teste@",
    });
    expect(result.isFailure()).toBe(true);
    expect(result.value).instanceOf(UnauthorizedError);
  });

  test("Não deve ser possivel realizar um login de usuário sem vinculo de acesso", async () => {
    const passwordHash = await fakeHasher.hash("teste@1234");
    const user = makeUser({ password: passwordHash });
    inMemoryUsersRepository.items.push(user);
    const result = await sut.execute({
      email: user.email,
      password: "teste@1234",
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "Acesso negado. Usuário sem vinculo de acesso."
      );
    }
  });
});
