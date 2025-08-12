import { NotFoundError } from "@core/errors/not-found-error";
import { Result, failure, success } from "@core/result";
import { NotAllowedError } from "src/core/errors/not-allowed-error";
import { UserWithMembership } from "src/domain/enterprise/entities/value-objects/user-with-membership";
import { MembershipsRepository } from "../../repositories/memberships-repository";
import { TenantsRepository } from "../../repositories/tenants-repository";
import { UsersRepository } from "../../repositories/users-repository";

interface ListUserAccessUseCaseRequest {
  userId: string;
  tenantId: string;
}

type ListUserAccessUseCaseResponse = Result<
  NotFoundError | NotAllowedError,
  {
    users: UserWithMembership[];
  }
>;

export class ListUserAccessUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private tenantsRepository: TenantsRepository,
    private membershipsRepository: MembershipsRepository
  ) {}

  async execute({
    userId,
    tenantId,
  }: ListUserAccessUseCaseRequest): Promise<ListUserAccessUseCaseResponse> {
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
          "Usuário não tem permisão necessária para listar usuários."
        )
      );

    // Recuperar lista de usuários do tenant
    const users = await this.membershipsRepository.listUsersByTenant(
      tenant.id.toString()
    );

    return success({ users });
  }
}
