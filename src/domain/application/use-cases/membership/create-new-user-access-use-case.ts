import { NotFoundError } from "@core/errors/not-found-error";
import { Uploader } from "@core/lib/uploader/uploader";
import { Result, failure, success } from "@core/result";
import { ConflictError } from "src/core/errors/conflict-error";
import { NotAllowedError } from "src/core/errors/not-allowed-error";
import { StringHelper } from "src/core/helpers/string-helper";
import { HashGenerator } from "src/core/lib/criptography/hash-generator";
import { FileField } from "src/core/types/zod-custom-types/file-schema";
import {
  Membership,
  RoleUserType,
} from "src/domain/enterprise/entities/membership";
import { User } from "src/domain/enterprise/entities/user";
import { MembershipsRepository } from "../../repositories/memberships-repository";
import { TenantsRepository } from "../../repositories/tenants-repository";
import { UsersRepository } from "../../repositories/users-repository";

interface CreateNewUserAccessUseCaseRequest {
  userId: string;
  tenantId: string;
  createUser: {
    email: string;
    firstName: string;
    lastName: string;
    nickName?: string | null;
    role: Exclude<RoleUserType, "superAdmin">;
    avatar?: FileField;
  };
}

type CreateNewUserAccessUseCaseResponse = Result<
  NotFoundError | NotAllowedError | ConflictError,
  {
    user: User;
  }
>;

export class CreateNewUserAccessUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private tenantsRepository: TenantsRepository,
    private membershipsRepository: MembershipsRepository,
    private uploader: Uploader,
    private hasher: HashGenerator
  ) {}

  async execute({
    userId,
    tenantId,
    createUser,
  }: CreateNewUserAccessUseCaseRequest): Promise<CreateNewUserAccessUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user) return failure(new NotFoundError("Usuário não encontrado."));

    const tenant = await this.tenantsRepository.findById(tenantId);
    if (!tenant)
      return failure(new NotFoundError("Organização não encontrada."));
    if (!tenant.active)
      return failure(new NotFoundError("Organização inativa."));

    const membership = await this.membershipsRepository.findByUserAndTenant(
      userId,
      tenantId
    );
    if (!membership)
      return failure(
        new NotAllowedError("Acesso negado. Usuário sem vinculo de acesso.")
      );
    if (!membership.active)
      return failure(new NotAllowedError("Acesso negado. Usuário inativado."));

    // Validar se usuário pode criar novo acesso (owner or 'SUPERADMIN' ou 'ADMIN')
    const canCreateUser = !(
      membership.owner || ["superAdmin", "admin"].includes(membership.role)
    );
    if (canCreateUser)
      return failure(
        new NotAllowedError(
          "Usuário não tem permisão necessária para criar um novo usuário."
        )
      );

    const userExists = await this.usersRepository.findByEmail(createUser.email);
    if (userExists) {
      const membershipExists =
        await this.membershipsRepository.findByUserAndTenant(
          userExists.id.toString(),
          tenant.id.toString()
        );
      if (membershipExists) {
        return failure(
          new ConflictError(
            "Já existe um usuário registrado para sua organização com o mesmo email informado!"
          )
        );
      }
    }

    const password = StringHelper.generateRandomCode(5).concat("@T1b");
    const passwordHash = await this.hasher.hash(password);
    const newUser =
      userExists ??
      User.create({
        email: createUser.email,
        firstName: createUser.firstName,
        lastName: createUser.lastName,
        nickName: createUser.nickName ?? createUser.firstName,
        password: passwordHash,
      });

    // Atualizar avatar
    if (newUser.isNew() && createUser.avatar) {
      const url = await this.uploader.upload({
        fileName: userId,
        buffer: createUser.avatar.buffer,
        mimeType: createUser.avatar.mimeType,
        folder: "avatars",
      });
      newUser.avatarUrl = url;
    }

    // Atualizar dados do usuário
    if (newUser.isNew()) await this.usersRepository.create(newUser);
    else await this.usersRepository.save(newUser);

    // Criar acesso ao tenant
    await this.membershipsRepository.create(
      Membership.create({
        tenantId: tenant.id.toString(),
        userId: newUser.id.toString(),
        role: createUser.role,
      })
    );

    return success({ user: newUser });
  }
}
