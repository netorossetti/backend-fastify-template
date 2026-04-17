import { env } from "src/core/env/index.js";
import { BadRequestError } from "src/core/errors/bad-request-error.js";
import { NotFoundError } from "src/core/errors/not-found-error.js";
import { DateHelper } from "src/core/helpers/date-helper.js";
import { createTestContext } from "test/@context/context-test.js";
import { makeRecoveryCode } from "test/factories/make-recovery-code.js";
import { makeUser } from "test/factories/make-user.js";
import { ResetPasswordUseCase } from "./reset-password-use-case.js";

let ctx: ReturnType<typeof createTestContext>;
let sut: ResetPasswordUseCase;

describe("Reset Password Use Case", () => {
  beforeEach(() => {
    ctx = createTestContext();
    sut = new ResetPasswordUseCase(ctx.usersRepository, ctx.fakerRedisServices, ctx.fakerHasher);

    // tell vitest we use mocked time
    vi.useFakeTimers();
  });

  afterEach(() => {
    // restoring date after each test run
    vi.useRealTimers();
  });

  test("Deve ser possivel redefinir uma senha", async () => {
    const user = makeUser({ password: "P@ssword_Old" });
    ctx.usersRepository.items.push(user);

    const recoveryCode = makeRecoveryCode(user, ctx.fakerRedisServices);

    const result = await sut.execute({
      recoveryCode: recoveryCode,
      password: "Teste@2014",
      passwordCheck: "Teste@2014",
    });

    expect(result.isSuccess()).toBe(true);
    expect(result.value).toEqual({});
    expect(ctx.usersRepository.items).toHaveLength(1);
    expect(ctx.usersRepository.items[0].password).toEqual("Teste@2014-hashed");
  });

  test("Não deve ser possivel redefinir uma senha com confirmação inválida", async () => {
    const result = await sut.execute({
      recoveryCode: "123",
      password: "Teste@2014",
      passwordCheck: "Teste@1234",
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(BadRequestError);
      expect(result.value.message).toBe("A senha de confirmação está diferente da nova senha.");
    }
  });

  test("Não deve ser possivel redefinir uma senha com parametros de requerimento inválidos", async () => {
    const result = await sut.execute({
      recoveryCode: "123",
      password: "123",
      passwordCheck: "123",
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

  test("Não deve ser possivel redefinir uma senha para um usuário não cadastrado", async () => {
    const user = makeUser();
    const recoveryCode = makeRecoveryCode(user, ctx.fakerRedisServices);

    const result = await sut.execute({
      recoveryCode: recoveryCode,
      password: "Teste@2014",
      passwordCheck: "Teste@2014",
    });

    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Usuário não encontrado.");
    }
  });

  test("Não deve ser possível redefinir uma senha com um link expirado", async () => {
    const date = new Date();
    vi.setSystemTime(date);

    const user = makeUser();
    ctx.usersRepository.items.push(user);

    const recoveryCode = makeRecoveryCode(user, ctx.fakerRedisServices);

    const jwtExpSeconds = (env.JWT_EXP ?? 10) + 10;
    vi.setSystemTime(DateHelper.addSeconds(date, jwtExpSeconds));
    const result = await sut.execute({
      recoveryCode: recoveryCode,
      password: "Teste@2014",
      passwordCheck: "Teste@2014",
    });

    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Link de recuperação expirado.");
    }
  });
});
