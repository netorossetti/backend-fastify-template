import { env } from "src/core/env";
import { UpdateUserProfileUseCase } from "src/domain/application/use-cases/user/update-user-profile-use-case";
import { PrismaUsersRepository } from "src/infra/database/repository/prisma-users-repository";
import { LocalUploader } from "src/infra/lib/uploader/local-uploader";
import { prisma } from "../../database/prisma";

export function makeUpdateUserProfileUseCase() {
  const usersRepository = new PrismaUsersRepository(prisma);
  const localUploader = new LocalUploader(env.UPLOADS_PUBLIC_PATH);

  return new UpdateUserProfileUseCase(usersRepository, localUploader);
}
