import { NotFoundError } from "@core/errors/not-found-error";
import { Result, failure, success } from "@core/result";
import { NotAllowedError } from "src/core/errors/not-allowed-error";
import { Tenant } from "src/domain/enterprise/entities/tenant";
import { MembershipsRepository } from "../../repositories/memberships-repository";
import { TenantsRepository } from "../../repositories/tenants-repository";
import { UsersRepository } from "../../repositories/users-repository";

interface InactivateTenantUseCaseRequest {
  userId: string;
  tenantId: string;
}

type InactivateTenantUseCaseResponse = Result<
  NotFoundError | NotAllowedError,
  { tenant: Tenant }
>;

export class InactivateTenantUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private tenantsRepository: TenantsRepository,
    private membershipsRepository: MembershipsRepository
  ) {}

  async execute({
    userId,
    tenantId,
  }: InactivateTenantUseCaseRequest): Promise<InactivateTenantUseCaseResponse> {
    // Recuperar o tenant
    const tenant = await this.tenantsRepository.findById(tenantId);
    if (!tenant)
      return failure(new NotFoundError("Organização não localizada."));
    if (!tenant.active)
      return failure(new NotFoundError("Organização já esta inativa."));

    const user = await this.usersRepository.findById(userId);
    if (!user) return failure(new NotFoundError("Usuário não localizado."));

    // Validar se usuário pertence a organização
    const userMembership = await this.membershipsRepository.findByUserAndTenant(
      userId,
      tenantId
    );
    if (!userMembership)
      return failure(
        new NotAllowedError("Usuário não pertence a organização.")
      );
    if (!userMembership.active)
      return failure(new NotAllowedError("Permissão de acesso inativada."));

    // Validar se usuário pode alterar o tenant (owner or 'SUPERADMIN')
    if (!(userMembership.owner || ["superAdmin"].includes(userMembership.role)))
      return failure(
        new NotAllowedError(
          "Usuário não tem permisão necessária para alterar dados da organização."
        )
      );

    // Validar se usuário pertence a organização
    const memberships = await this.membershipsRepository.findManyByTenant(
      tenantId
    );

    // Atualizar dados do tenant
    tenant.active = false;
    await this.tenantsRepository.save(tenant);

    // Inativar permissões de usuários do tenant
    for (const membership of memberships) {
      if (membership.active) {
        membership.active = false;
        await this.membershipsRepository.save(membership);
      }
    }

    return success({ tenant });
  }
}
