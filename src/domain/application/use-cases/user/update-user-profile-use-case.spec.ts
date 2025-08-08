import { faker } from "@faker-js/faker";
import { NotFoundError } from "src/core/errors/not-found-error";
import { makeUser } from "test/factories/make-user";
import { FakerUploader } from "test/lib/faker-uploader";
import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository";
import { UpdateUserProfileUseCase } from "./update-user-profile-use-case";

let inMemoryUsersRepository: InMemoryUsersRepository;
let fakerUploader: FakerUploader;
let sut: UpdateUserProfileUseCase;

describe("Select Account Use Case", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    fakerUploader = new FakerUploader();
    sut = new UpdateUserProfileUseCase(inMemoryUsersRepository, fakerUploader);
  });

  test("Deve ser possível atualizar o perfil do usuário com sucesso (sem avatar)", async () => {
    const user = makeUser();
    inMemoryUsersRepository.items.push(user);

    const result = await sut.execute({
      userId: user.id.toString(),
      firstName: "Novo",
      lastName: "Nome",
      nickName: "novo.nick",
    });

    expect(result.isSuccess()).toBe(true);
    const updatedUser = inMemoryUsersRepository.items.find(
      (u) => u.id === user.id
    );
    expect(updatedUser?.firstName).toBe("Novo");
    expect(updatedUser?.lastName).toBe("Nome");
    expect(updatedUser?.nickName).toBe("novo.nick");
  });

  test("Deve ser possível atualizar o avatar do usuário", async () => {
    const user = makeUser();
    inMemoryUsersRepository.items.push(user);

    const fakeBuffer = Buffer.from("fake image");
    const avatar = {
      fileName: "avatar.jpg",
      fileSize: 12345,
      mimeType: "image/jpeg",
      buffer: fakeBuffer,
    };

    const result = await sut.execute({
      userId: user.id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      nickName: user.nickName,
      avatar,
    });

    expect(result.isSuccess()).toBe(true);
    const updatedUser = inMemoryUsersRepository.items.find(
      (u) => u.id === user.id
    );
    expect(updatedUser?.avatarUrl).toBe(`/uploads/avatars/${user.id}`);
    expect(fakerUploader.uploaded.length).toBe(1);
  });

  test("Não deve ser possível permitir atualização de usuário inexistente", async () => {
    const result = await sut.execute({
      userId: faker.string.uuid(),
      firstName: "Fake",
      lastName: "User",
      nickName: "fakeuser",
    });

    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Usuário não encontrado.");
    }
  });
});
