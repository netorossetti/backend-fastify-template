import { faker } from "@faker-js/faker";
import { BadRequestError } from "src/core/errors/bad-request-error";
import { ConflictError } from "src/core/errors/conflict-error";
import { FakeHasher } from "test/cryptography/fake-hasher";
import { makeUser } from "test/factories/make-user";
import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository";
import { RegisterUserUseCase } from "./register-use-case";

let inMemoryUsersRepository: InMemoryUsersRepository;
let fakeHasher: FakeHasher;
let sut: RegisterUserUseCase;

describe("Login Use Case", () => {
  beforeEach(() => {
    fakeHasher = new FakeHasher();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    sut = new RegisterUserUseCase(inMemoryUsersRepository, fakeHasher);
  });

  test("Deve ser possivel registrar um novo usuário", async () => {
    const firstName = faker.person.firstName();
    const fullName = faker.person.fullName({ firstName });
    const result = await sut.execute({
      name: fullName,
      email: faker.internet.email({ firstName }),
      password: "Teste@1234",
      role: "user",
    });
    expect(result.isSuccess()).toBe(true);
    expect(inMemoryUsersRepository.items.length).toEqual(1);
    expect(inMemoryUsersRepository.items).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: fullName })])
    );
  });

  test("Não deve ser possivel registrar usuário com o mesmo email", async () => {
    const user = makeUser();
    inMemoryUsersRepository.items.push(user);
    const result = await sut.execute({
      name: user.name,
      email: user.email,
      password: "Teste@1234",
      role: "user",
    });
    expect(result.isFailure()).toBe(true);
    expect(result.value).instanceOf(ConflictError);
  });

  test("Não deve ser possivel registrar usuário com uma senha fraca", async () => {
    const firstName = faker.person.firstName();
    const fullName = faker.person.fullName({ firstName });
    const result = await sut.execute({
      name: fullName,
      email: faker.internet.email({ firstName }),
      password: "123",
      role: "user",
    });
    expect(result.isFailure()).toBe(true);
    expect(result.value).instanceOf(BadRequestError);
    if (result.isFailure())
      expect(result.value).toEqual(
        expect.objectContaining({
          issues: expect.objectContaining({ password: expect.any(Array) }),
        })
      );
  });
});
