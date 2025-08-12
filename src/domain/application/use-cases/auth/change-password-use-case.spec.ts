import { faker } from "@faker-js/faker";
import { BadRequestError } from "src/core/errors/bad-request-error";
import { NotFoundError } from "src/core/errors/not-found-error";
import { makeUser } from "test/factories/make-user";
import { FakeHasher } from "test/lib/cryptography/fake-hasher";
import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository";
import { ChangePasswordUseCase } from "./change-password-use-case";

let inMemoryUsersRepository: InMemoryUsersRepository;
let fakerHash: FakeHasher;
let sut: ChangePasswordUseCase;

describe("Select Account Use Case", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    fakerHash = new FakeHasher();
    sut = new ChangePasswordUseCase(inMemoryUsersRepository, fakerHash);
  });

  test("Deve ser possível alterar a senha de um usuário", async () => {
    const passwordHashed = await fakerHash.hash("Test@2016");
    const user = makeUser({ password: passwordHashed });
    inMemoryUsersRepository.items.push(user);

    const result = await sut.execute({
      userId: user.id.toString(),
      password: "Test@2016",
      newPassword: "Test@2026",
      newPasswordCheck: "Test@2026",
    });

    expect(result.isSuccess()).toBe(true);
    const updatedUser = inMemoryUsersRepository.items.find(
      (u) => u.id === user.id
    );
    expect(updatedUser).not.toBe(null);
    if (updatedUser) {
      const compare = await fakerHash.compare(
        "Test@2026",
        updatedUser.password
      );
      expect(compare).toBe(true);
    }
  });

  test("Não deve ser possivel alterar uma senha com confirmação inválida", async () => {
    const result = await sut.execute({
      userId: faker.string.uuid(),
      password: "Test@2016",
      newPassword: "Test@2026",
      newPasswordCheck: "Test@2025",
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(BadRequestError);
      expect(result.value.message).toBe(
        "A senha de confirmação está diferente da nova senha."
      );
    }
  });

  test("Não deve ser possivel alterar uma senha com parametros de requerimento inválidos", async () => {
    const result = await sut.execute({
      userId: faker.string.uuid(),
      password: "Test@2016",
      newPassword: "123",
      newPasswordCheck: "123",
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(BadRequestError);
      expect(result.value.message).toBe("Senha inválida.");
      if (result.value instanceof BadRequestError) {
        expect(result.value.issues).toEqual(
          expect.objectContaining({
            password: expect.arrayContaining([
              "A senha deve ter pelo menos 8 caracteres.",
            ]),
          })
        );
      }
    }
  });

  test("Não deve ser possivel alterar uma senha para um usuário não cadastrado", async () => {
    const result = await sut.execute({
      userId: faker.string.uuid(),
      password: "Test@2016",
      newPassword: "Test@2026",
      newPasswordCheck: "Test@2026",
    });

    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Usuário não encontrado.");
    }
  });

  test("Não deve ser possivel alterar uma senha sem informar a senha atual corretamente", async () => {
    const passwordHashed = await fakerHash.hash("Test@2016");
    const user = makeUser({ password: passwordHashed });
    inMemoryUsersRepository.items.push(user);

    const result = await sut.execute({
      userId: user.id.toString(),
      password: "Test@2026",
      newPassword: "Test@2026",
      newPasswordCheck: "Test@2026",
    });

    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Senha atual incorreta.");
    }
  });
});
