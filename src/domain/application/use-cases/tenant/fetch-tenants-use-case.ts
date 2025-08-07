import { NotFoundError } from "@core/errors/not-found-error";
import { Result, failure, success } from "@core/result";
import { NotAllowedError } from "src/core/errors/not-allowed-error";
import { Tenant } from "src/domain/enterprise/entities/tenant";
import { TenantsRepository } from "../../repositories/tenants-repository";
import { UsersRepository } from "../../repositories/users-repository";

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
    private tenantsRepository: TenantsRepository
  ) {}

  async execute({
    userId,
  }: FetchTenantsUseCaseRequest): Promise<FetchTenantsUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user) return failure(new NotFoundError("Usuário não localizado."));

    const tenants = await this.tenantsRepository.findManyByUser(userId);

    return success({
      tenants,
    });
  }
}
