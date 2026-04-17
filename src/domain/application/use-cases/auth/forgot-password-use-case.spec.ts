import { faker } from "@faker-js/faker";
import { env } from "src/core/env/index.js";
import { NotFoundError } from "src/core/errors/not-found-error.js";
import { createTestContext } from "test/@context/context-test.js";
import { makeUser } from "test/factories/make-user.js";
import { ForgotPasswordUseCase } from "./forgot-password-use-case.js";

let ctx: ReturnType<typeof createTestContext>;
let sut: ForgotPasswordUseCase;

describe("Forgot Password Use Case", () => {
  beforeEach(() => {
    ctx = createTestContext();
    sut = new ForgotPasswordUseCase(
      ctx.usersRepository,
      ctx.fakerRedisServices,
      ctx.fakerMailSender,
    );
  });

  test("Deve ser possivel solicitar a recuperação de senha", async () => {
    const user = makeUser();
    ctx.usersRepository.items.push(user);

    const result = await sut.execute({
      email: user.email,
    });

    expect(result.isSuccess()).toBe(true);
    expect(result.value).toEqual({
      message: "E-mail de recuperação de senha encaminhado com sucesso.",
    });
    expect(ctx.fakerMailSender.getSentMails()).toHaveLength(1);
    expect(ctx.fakerMailSender.getSentMails()[0].subject).toBe(
      `${env.PROJECT_NAME} - Recuperação de Senha`,
    );
  });

  test("Não deve ser possivel solicitar a recuperação de senha para um usuário não cadastrado", async () => {
    const result = await sut.execute({
      email: faker.internet.email(),
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Usuário não localizado.");
    }
  });
});
