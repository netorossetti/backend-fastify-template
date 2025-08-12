import { env } from "src/core/env";
import { CreateNewUserAccessUseCase } from "src/domain/application/use-cases/membership/create-new-user-access-use-case";
import { PrismaMembershipsRepository } from "src/infra/database/repository/prisma-memberships-repository";
import { PrismaTenantsRepository } from "src/infra/database/repository/prisma-tenants-repository";
import { PrismaUsersRepository } from "src/infra/database/repository/prisma-users-repository";
import { BcryptHasher } from "src/infra/lib/criptography/bcrypt-hasher";
import { LocalUploader } from "src/infra/lib/uploader/local-uploader";
import { prisma } from "../../database/prisma";

export function makeCreateNewUserAccessUseCase() {
  const usersRepository = new PrismaUsersRepository(prisma);
  const tenantsRepository = new PrismaTenantsRepository(prisma);
  const membershipsRepository = new PrismaMembershipsRepository(prisma);
  const bcryptHasher = new BcryptHasher();
  const localUploader = new LocalUploader(env.UPLOADS_PUBLIC_PATH);

  return new CreateNewUserAccessUseCase(
    usersRepository,
    tenantsRepository,
    membershipsRepository,
    localUploader,
    bcryptHasher
  );
}
