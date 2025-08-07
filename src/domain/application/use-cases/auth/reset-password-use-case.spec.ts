import { env } from "src/core/env";
import { BadRequestError } from "src/core/errors/bad-request-error";
import { NotFoundError } from "src/core/errors/not-found-error";
import { DateHelper } from "src/core/helpers/date-helper";
import { makeRecoveryCode } from "test/factories/make-recovery-code";
import { makeUser } from "test/factories/make-user";
import { FakeHasher } from "test/lib/cryptography/fake-hasher";
import { FakeRedisServices } from "test/lib/faker-redis-services";
import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository";
import { ResetPasswordUseCase } from "./reset-password-use-case";

let inMemoryUsersRepository: InMemoryUsersRepository;
let fakeRedisServices: FakeRedisServices;
let fakeHasher: FakeHasher;
let sut: ResetPasswordUseCase;

describe("Reset Password Use Case", () => {
  beforeEach(() => {
    fakeHasher = new FakeHasher();
    fakeRedisServices = new FakeRedisServices();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    sut = new ResetPasswordUseCase(
      inMemoryUsersRepository,
      fakeRedisServices,
      fakeHasher
    );

    // tell vitest we use mocked time
    vi.useFakeTimers();
  });

  afterEach(() => {
    // restoring date after each test run
    vi.useRealTimers();
  });

  test("Deve ser possivel redefinir uma senha", async () => {
    const user = makeUser({ password: "P@ssword_Old" });
    inMemoryUsersRepository.items.push(user);

    const recoveryCode = makeRecoveryCode(user, fakeRedisServices);

    const result = await sut.execute({
      recoveryCode: recoveryCode,
      password: "Teste@2014",
      passwordCheck: "Teste@2014",
    });

    expect(result.isSuccess()).toBe(true);
    expect(result.value).toEqual({});
    expect(inMemoryUsersRepository.items).toHaveLength(1);
    expect(inMemoryUsersRepository.items[0].password).toEqual(
      "Teste@2014-hashed"
    );
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
      expect(result.value.message).toBe(
        "A senha de confirmação está diferente da nova senha."
      );
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
            password: expect.arrayContaining([
              "A senha deve ter pelo menos 8 caracteres.",
            ]),
          })
        );
      }
    }
  });

  test("Não deve ser possivel redefinir uma senha para um usuário não cadastrado", async () => {
    const user = makeUser({ active: false });
    const recoveryCode = makeRecoveryCode(user, fakeRedisServices);

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

  test("Não deve ser possivel redefinir uma senha para um usuário inativo", async () => {
    const user = makeUser({ active: false });
    inMemoryUsersRepository.items.push(user);

    const recoveryCode = makeRecoveryCode(user, fakeRedisServices);

    const result = await sut.execute({
      recoveryCode: recoveryCode,
      password: "Teste@2014",
      passwordCheck: "Teste@2014",
    });

    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Usuário inativado.");
    }
  });

  test("Não deve ser possível redefinir uma senha com um link expirado", async () => {
    const date = new Date();
    vi.setSystemTime(date);

    const user = makeUser({ active: false });
    inMemoryUsersRepository.items.push(user);

    const recoveryCode = makeRecoveryCode(user, fakeRedisServices);

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
