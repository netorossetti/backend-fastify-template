import { env } from "src/core/env/index.js";
import { UpdateUserProfileUseCase } from "src/domain/application/use-cases/user/update-user-profile-use-case.js";
import { PrismaUsersRepository } from "src/infra/database/repository/prisma-users-repository.js";
import { LocalUploader } from "src/infra/lib/uploader/local-uploader.js";
import { prisma } from "../../database/prisma.js";

export function makeUpdateUserProfileUseCase() {
  const usersRepository = new PrismaUsersRepository(prisma);
  const localUploader = new LocalUploader(env.UPLOADS_PUBLIC_PATH);

  return new UpdateUserProfileUseCase(usersRepository, localUploader);
}
