import { NotFoundError } from "@core/errors/not-found-error";
import { Uploader } from "@core/lib/uploader/uploader";
import { Result, failure, success } from "@core/result";
import { FileField } from "src/core/types/zod-custom-types/file-schema";
import { UsersRepository } from "../../repositories/users-repository";

interface UpdateUserProfileUseCaseRequest {
  userId: string;
  firstName: string;
  lastName: string;
  nickName: string;
  avatar?: FileField;
}

type UpdateUserProfileUseCaseResponse = Result<NotFoundError, {}>;

export class UpdateUserProfileUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private uploader: Uploader
  ) {}

  async execute({
    userId,
    firstName,
    lastName,
    nickName,
    avatar,
  }: UpdateUserProfileUseCaseRequest): Promise<UpdateUserProfileUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user) return failure(new NotFoundError("Usuário não encontrado."));
    if (!user.active) return failure(new NotFoundError("Usuário inativo."));

    // Atualizar dados do usuário
    user.firstName = firstName;
    user.lastName = lastName;
    user.nickName = nickName;

    // Atualizar avatar
    if (avatar) {
      const url = await this.uploader.upload({
        fileName: userId,
        buffer: avatar.buffer,
        mimeType: avatar.mimeType,
        folder: "avatars",
      });
      user.avatarUrl = url;
    }

    // Atualizar dados do usuário
    await this.usersRepository.save(user);

    return success({});
  }
}
