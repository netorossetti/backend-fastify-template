import { NotFoundError } from "@core/errors/not-found-error";
import { Result, failure, success } from "@core/result";
import { BadRequestError } from "src/core/errors/bad-request-error";
import { ConflictError } from "src/core/errors/conflict-error";
import { NotAllowedError } from "src/core/errors/not-allowed-error";
import { Tenant } from "src/domain/enterprise/entities/tenant";
import { MembershipsRepository } from "../../repositories/memberships-repository";
import { TenantsRepository } from "../../repositories/tenants-repository";
import { UsersRepository } from "../../repositories/users-repository";

interface ReactivateTenantUseCaseRequest {
  userId: string;
  tenantId: string;
}

type ReactivateTenantUseCaseResponse = Result<
  NotFoundError | NotAllowedError | ConflictError | BadRequestError,
  { tenant: Tenant }
>;

export class ReactivateTenantUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private tenantsRepository: TenantsRepository,
    private membershipsRepository: MembershipsRepository
  ) {}

  async execute({
    userId,
    tenantId,
  }: ReactivateTenantUseCaseRequest): Promise<ReactivateTenantUseCaseResponse> {
    // Recuperar o tenant
    const tenant = await this.tenantsRepository.findById(tenantId);
    if (!tenant)
      return failure(new NotFoundError("Organização não localizada."));
    if (tenant.active)
      return failure(new NotFoundError("Organização já esta ativa."));

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

    // Validar se usuário pode alterar o tenant (owner or 'SUPERADMIN')
    if (!(userMembership.owner || ["superAdmin"].includes(userMembership.role)))
      return failure(
        new NotAllowedError(
          "Usuário não tem permisão necessária para alterar dados da organização."
        )
      );

    // Atualizar dados do tenant
    tenant.active = true;
    await this.tenantsRepository.save(tenant);

    // Reativar permissões de usuário do tenant
    userMembership.active = true;
    await this.membershipsRepository.save(userMembership);

    return success({ tenant });
  }
}
