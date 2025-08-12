import { NotFoundError } from "@core/errors/not-found-error";
import { Result, failure, success } from "@core/result";
import { NotAllowedError } from "src/core/errors/not-allowed-error";
import { MembershipsRepository } from "../../repositories/memberships-repository";
import { TenantsRepository } from "../../repositories/tenants-repository";
import { UsersRepository } from "../../repositories/users-repository";

interface RemoveUserAccessUseCaseRequest {
  userId: string;
  tenantId: string;
  removeUser: {
    userId: string;
  };
}

type RemoveUserAccessUseCaseResponse = Result<
  NotFoundError | NotAllowedError,
  {}
>;

export class RemoveUserAccessUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private tenantsRepository: TenantsRepository,
    private membershipsRepository: MembershipsRepository
  ) {}

  async execute({
    userId,
    tenantId,
    removeUser,
  }: RemoveUserAccessUseCaseRequest): Promise<RemoveUserAccessUseCaseResponse> {
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
          "Usuário não tem permisão necessária para remover acesso de um usuário."
        )
      );

    const updateMembership =
      await this.membershipsRepository.findByUserAndTenant(
        removeUser.userId,
        tenant.id.toString()
      );
    if (!updateMembership)
      return failure(new NotFoundError("Permisão de acesso não localizada."));
    if (updateMembership.owner)
      return failure(
        new NotFoundError(
          "Não é possível remover permissão de acesso para o proprietário da organização."
        )
      );

    // Remover acesso ao tenant
    await this.membershipsRepository.delete(updateMembership);

    return success({});
  }
}
