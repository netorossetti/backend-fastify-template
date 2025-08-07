import { NotFoundError } from "@core/errors/not-found-error";
import { Result, failure, success } from "@core/result";
import { User } from "src/domain/enterprise/entities/user";
import { MembershipsRepository } from "../../repositories/memberships-repository";
import { TenantsRepository } from "../../repositories/tenants-repository";
import { UsersRepository } from "../../repositories/users-repository";

interface GetUserProfileUseCaseRequest {
  userId: string;
  tenantId: string;
}

type GetUserProfileUseCaseResponse = Result<NotFoundError, { user: User }>;

export class GetUserProfileUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private membershipsRepository: MembershipsRepository,
    private tenantsRepository: TenantsRepository
  ) {}

  async execute({
    userId,
    tenantId,
  }: GetUserProfileUseCaseRequest): Promise<GetUserProfileUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user) return failure(new NotFoundError("Usuário não localizado."));
    if (!user.active) return failure(new NotFoundError("Usuário inativo."));

    const tenant = await this.tenantsRepository.findById(tenantId);
    if (!tenant)
      return failure(new NotFoundError("Organização não localizada."));

    const membership = await this.membershipsRepository.findByUserAndTenant(
      userId,
      tenantId
    );
    if (!membership)
      return failure(new NotFoundError("Permisão de acesso não localizada."));

    return success({ user });
  }
}
