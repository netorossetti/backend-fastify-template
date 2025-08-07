import { faker } from "@faker-js/faker";
import { NotFoundError } from "src/core/errors/not-found-error";
import { makeUser } from "test/factories/make-user";
import { InMemoryMailSender } from "test/lib/faker-mail-sender";
import { FakeRedisServices } from "test/lib/faker-redis-services";
import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository";
import { ForgotPasswordUseCase } from "./forgot-password-use-case";

let inMemoryUsersRepository: InMemoryUsersRepository;
let fakeRedisServices: FakeRedisServices;
let fakeMailSender: InMemoryMailSender;
let sut: ForgotPasswordUseCase;

describe("Forgot Password Use Case", () => {
  beforeEach(() => {
    fakeRedisServices = new FakeRedisServices();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    fakeMailSender = new InMemoryMailSender();
    sut = new ForgotPasswordUseCase(
      inMemoryUsersRepository,
      fakeRedisServices,
      fakeMailSender
    );
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
      "Meu Projeto - Recuperação de Senha"
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

  test("Não deve ser possivel solicitar a recuperação de senha para um usuário inativo", async () => {
    const user = makeUser({ active: false });
    inMemoryUsersRepository.items.push(user);

    const result = await sut.execute({
      email: user.email,
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Usuário inativado.");
    }
  });
});
