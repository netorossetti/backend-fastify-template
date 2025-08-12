import { NotFoundError } from "@core/errors/not-found-error";
import { TokenHelper } from "@core/helpers/token-helper";
import { Result, failure, success } from "@core/result";
import { NotAllowedError } from "src/core/errors/not-allowed-error";
import { MembershipsRepository } from "../../repositories/memberships-repository";
import { TenantsRepository } from "../../repositories/tenants-repository";
import { UsersRepository } from "../../repositories/users-repository";

interface SelectTenantUseCaseRequest {
  userId: string;
  tenantId: string;
}

type SelectTenantUseCaseResponse = Result<
  NotFoundError | NotAllowedError,
  {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      tenantId: string;
      role: string;
    };
    tenants: {
      id: string;
      name: string;
      owner: boolean;
      role: string;
      active: boolean;
    }[];
  }
>;

export class SelectTenantUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private membershipsRepository: MembershipsRepository,
    private tenantsRepository: TenantsRepository
  ) {}

  async execute({
    userId,
    tenantId,
  }: SelectTenantUseCaseRequest): Promise<SelectTenantUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      return failure(new NotFoundError("Usuário não localizado."));
    }

    const tenant = await this.tenantsRepository.findById(tenantId);
    if (!tenant)
      return failure(new NotFoundError("Organização não localizada."));
    if (!tenant.active)
      return failure(new NotFoundError("Organização inativa."));

    const allMemberships = await this.membershipsRepository.findManyByUser(
      userId
    );
    const memberships = allMemberships.filter(
      (m) => m.active || m.owner || m.role === "superAdmin"
    );
    if (!memberships.length) {
      return failure(
        new NotFoundError("Usuário não pertence a nenhuma organização.")
      );
    }

    const targetMembership = memberships.find((m) => m.tenantId === tenantId);
    if (!targetMembership) {
      return failure(
        new NotAllowedError("Usuário não pertence à organização selecionada.")
      );
    }

    // Atualiza lastAccessAt para o tenant atual
    await this.membershipsRepository.updateLastAccess(userId, tenantId);

    // Monta lista de tenants
    const tenants: {
      id: string;
      name: string;
      owner: boolean;
      role: string;
      active: boolean;
    }[] = [];

    for (const membership of memberships) {
      const tenant = await this.tenantsRepository.findById(membership.tenantId);
      if (tenant) {
        tenants.push({
          id: tenant.id.toString(),
          name: tenant.name,
          owner: membership.owner,
          role: membership.role,
          active: tenant.active,
        });
      }
    }

    // Gera novo token com o tenant selecionado
    const token = TokenHelper.singToken({
      id: user.id.toString(),
      email: user.email,
      name: user.fullName,
      tenantId: tenantId,
      role: targetMembership.role,
    });

    return success({
      token,
      user: {
        id: user.id.toString(),
        name: user.fullName,
        email: user.email,
        tenantId,
        role: targetMembership.role,
      },
      tenants,
    });
  }
}
