import { env } from "src/core/env/index.js";
import { CreateNewUserAccessUseCase } from "src/domain/application/use-cases/membership/create-new-user-access-use-case.js";
import { PrismaMembershipsRepository } from "src/infra/database/repository/prisma-memberships-repository.js";
import { PrismaTenantsRepository } from "src/infra/database/repository/prisma-tenants-repository.js";
import { PrismaUsersRepository } from "src/infra/database/repository/prisma-users-repository.js";
import { BcryptHasher } from "src/infra/lib/criptography/bcrypt-hasher.js";
import { LocalStorage } from "src/infra/lib/storage/local-storage.js";
import { prisma } from "../../database/prisma.js";

export function makeCreateNewUserAccessUseCase() {
  const usersRepository = new PrismaUsersRepository(prisma);
  const tenantsRepository = new PrismaTenantsRepository(prisma);
  const membershipsRepository = new PrismaMembershipsRepository(prisma);
  const bcryptHasher = new BcryptHasher();
  const localUploader = new LocalStorage(env.UPLOADS_PUBLIC_PATH);

  return new CreateNewUserAccessUseCase(
    usersRepository,
    tenantsRepository,
    membershipsRepository,
    localUploader,
    bcryptHasher,
  );
}
