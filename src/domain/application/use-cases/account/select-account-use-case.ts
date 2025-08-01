import { NotFoundError } from "@core/errors/not-found-error";
import { TokenHelper } from "@core/helpers/token-helper";
import { Result, failure, success } from "@core/result";
import { NotAllowedError } from "src/core/errors/not-allowed-error";
import { TenantsRepository } from "../../repositories/tenants-repository";
import { UserTenantMembershipsRepository } from "../../repositories/user-tenant-memberships-repository";
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
    }[];
  }
>;

export class SelectTenantUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private membershipsRepository: UserTenantMembershipsRepository,
    private tenantsRepository: TenantsRepository
  ) {}

  async execute({
    userId,
    tenantId,
  }: SelectTenantUseCaseRequest): Promise<SelectTenantUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      return failure(new NotFoundError("Usuário não encontrado"));
    }

    const allMemberships = await this.membershipsRepository.findManyByUser(
      userId
    );
    if (!allMemberships.length) {
      return failure(new NotFoundError("Usuário não pertence a nenhum tenant"));
    }

    const targetMembership = allMemberships.find(
      (m) => m.tenantId === tenantId
    );
    if (!targetMembership) {
      return failure(
        new NotAllowedError("Usuário não pertence ao tenant selecionado")
      );
    }

    // Atualiza lastAccessAt para o tenant atual
    await this.membershipsRepository.updateLastAccess(userId, tenantId);

    // Monta lista de tenants
    const tenants: { id: string; name: string }[] = [];

    for (const membership of allMemberships) {
      const tenant = await this.tenantsRepository.findById(membership.tenantId);
      if (tenant) {
        tenants.push({ id: tenant.id.toString(), name: tenant.name });
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
