import { NotAllowedError } from "src/core/errors/not-allowed-error.js";
import { NotFoundError } from "src/core/errors/not-found-error.js";
import { Result, failure, success } from "src/core/result.js";
import { User } from "src/domain/enterprise/entities/user.js";
import { MembershipsRepository } from "../../repositories/memberships-repository.js";
import { TenantsRepository } from "../../repositories/tenants-repository.js";
import { UsersRepository } from "../../repositories/users-repository.js";

interface GetUserProfileUseCaseRequest {
  userId: string;
  tenantId: string;
}

type GetUserProfileUseCaseResponse = Result<NotFoundError | NotAllowedError, { user: User }>;

export class GetUserProfileUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private membershipsRepository: MembershipsRepository,
    private tenantsRepository: TenantsRepository,
  ) {}

  async execute({
    userId,
    tenantId,
  }: GetUserProfileUseCaseRequest): Promise<GetUserProfileUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user) return failure(new NotFoundError("Usuário não localizado."));

    const tenant = await this.tenantsRepository.findById(tenantId);
    if (!tenant) return failure(new NotFoundError("Organização não localizada."));
    if (!tenant.active) return failure(new NotFoundError("Organização inativa."));

    const membership = await this.membershipsRepository.findByUserAndTenant(userId, tenantId);
    if (!membership) return failure(new NotAllowedError("Permisão de acesso não localizada."));
    if (!membership.active) return failure(new NotAllowedError("Permisão de acesso inativada."));

    return success({ user });
  }
}
