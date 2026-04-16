import { faker } from "@faker-js/faker";
import { env } from "src/core/env/index.js";
import { NotFoundError } from "src/core/errors/not-found-error.js";
import { makeUser } from "test/factories/make-user.js";
import { InMemoryMailSender } from "test/lib/faker-mail-sender.js";
import { FakeRedisServices } from "test/lib/faker-redis-services.js";
import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository.js";
import { ForgotPasswordUseCase } from "./forgot-password-use-case.js";

let inMemoryUsersRepository: InMemoryUsersRepository;
let fakeRedisServices: FakeRedisServices;
let fakeMailSender: InMemoryMailSender;
let sut: ForgotPasswordUseCase;

describe("Forgot Password Use Case", () => {
  beforeEach(() => {
    fakeRedisServices = new FakeRedisServices();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    fakeMailSender = new InMemoryMailSender();
    sut = new ForgotPasswordUseCase(inMemoryUsersRepository, fakeRedisServices, fakeMailSender);
  });

  test("Deve ser possivel solicitar a recuperação de senha", async () => {
    const user = makeUser();
    inMemoryUsersRepository.items.push(user);

    const result = await sut.execute({
      email: user.email,
    });

    expect(result.isSuccess()).toBe(true);
    expect(result.value).toEqual({
      message: "E-mail de recuperação de senha encaminhado com sucesso.",
    });
    expect(fakeMailSender.getSentMails()).toHaveLength(1);
    expect(fakeMailSender.getSentMails()[0].subject).toBe(
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
