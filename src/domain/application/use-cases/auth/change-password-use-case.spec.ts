import { faker } from "@faker-js/faker";
import { BadRequestError } from "src/core/errors/bad-request-error.js";
import { NotFoundError } from "src/core/errors/not-found-error.js";
import { createTestContext } from "test/@context/context-test";
import { makeUser } from "test/factories/make-user.js";
import { ChangePasswordUseCase } from "./change-password-use-case.js";

let ctx: ReturnType<typeof createTestContext>;
let sut: ChangePasswordUseCase;

describe("Select Account Use Case", () => {
  beforeEach(() => {
    ctx = createTestContext();
    sut = new ChangePasswordUseCase(ctx.usersRepository, ctx.fakerHasher);
  });

  test("Deve ser possível alterar a senha de um usuário", async () => {
    const passwordHashed = await ctx.fakerHasher.hash("Test@2016");
    const user = makeUser({ password: passwordHashed });
    ctx.usersRepository.items.push(user);

    const result = await sut.execute({
      userId: user.id.toString(),
      password: "Test@2016",
      newPassword: "Test@2026",
      newPasswordCheck: "Test@2026",
    });

    expect(result.isSuccess()).toBe(true);
    const updatedUser = ctx.usersRepository.items.find((u) => u.id === user.id);
    expect(updatedUser).not.toBe(null);
    if (updatedUser) {
      const compare = await ctx.fakerHasher.compare("Test@2026", updatedUser.password);
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
      expect(result.value.message).toBe("A senha de confirmação está diferente da nova senha.");
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
            password: expect.arrayContaining(["A senha deve ter pelo menos 8 caracteres."]),
          }),
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
    const passwordHashed = await ctx.fakerHasher.hash("Test@2016");
    const user = makeUser({ password: passwordHashed });
    ctx.usersRepository.items.push(user);

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
