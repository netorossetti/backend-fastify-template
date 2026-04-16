import { NotAllowedError } from "src/core/errors/not-allowed-error.js";
import { NotFoundError } from "src/core/errors/not-found-error.js";
import { Result, failure, success } from "src/core/result.js";
import { Tenant } from "src/domain/enterprise/entities/tenant.js";
import { TenantsRepository } from "../../repositories/tenants-repository.js";
import { UsersRepository } from "../../repositories/users-repository.js";

interface FetchTenantsUseCaseRequest {
  userId: string;
}

type FetchTenantsUseCaseResponse = Result<
  NotFoundError | NotAllowedError,
  {
    tenants: Tenant[];
  }
>;

export class FetchTenantsUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private tenantsRepository: TenantsRepository,
  ) {}

  async execute({ userId }: FetchTenantsUseCaseRequest): Promise<FetchTenantsUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user) return failure(new NotFoundError("Usuário não localizado."));

    const tenants = await this.tenantsRepository.findManyByUser(userId);

    return success({
      tenants,
    });
  }
}
