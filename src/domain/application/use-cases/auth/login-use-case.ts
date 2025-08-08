import { env } from "src/core/env";
import { NotAllowedError } from "src/core/errors/not-allowed-error";
import { NotFoundError } from "src/core/errors/not-found-error";
import { UnauthorizedError } from "src/core/errors/unauthorized-error";
import { TokenHelper } from "src/core/helpers/token-helper";
import { HashCompare } from "src/core/lib/criptography/hash-compare";
import { IRedisService } from "src/core/lib/redis/redis-services";
import { Result, failure, success } from "src/core/result";
import { MembershipsRepository } from "../../repositories/memberships-repository";
import { TenantsRepository } from "../../repositories/tenants-repository";
import { UsersRepository } from "../../repositories/users-repository";

interface LoginUseCaseRequest {
  email: string;
  password: string;
}

type LoginUseCaseResponse = Result<
  NotFoundError | UnauthorizedError | NotAllowedError,
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

export class LoginUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private tenantsRepository: TenantsRepository,
    private membershipsRepository: MembershipsRepository,
    private hasher: HashCompare,
    private redisServices: IRedisService
  ) {}
  async execute({
    email,
    password,
  }: LoginUseCaseRequest): Promise<LoginUseCaseResponse> {
    // Recuperar usuário
    const user = await this.usersRepository.findByEmail(email);
    if (!user) return failure(new NotFoundError("E-mail inválido."));
    if (!user.password)
      return failure(new NotFoundError("Senha não definida."));

    // Verificar se o usuário está ativo
    if (!user.active) {
      return failure(new NotAllowedError("Acesso negado. Usuário inátivado."));
    }

    // Verificar senha
    const senhaValida = await this.hasher.compare(password, user.password);
    if (!senhaValida) return failure(new UnauthorizedError("Senha inválida."));

    // Recuperar Tenants do usuário
    const memberships = await this.membershipsRepository.findManyByUser(
      user.id.toString()
    );
    if (memberships.length === 0) {
      return failure(
        new NotAllowedError("Acesso negado. Usuário sem vinculo de acesso.")
      );
    }

    let lastAccess: Date | null = null;
    let lastTenantLogin: { id: string; name: string; role: string } | null =
      null;
    const tenants: { id: string; name: string }[] = [];

    for await (const membership of memberships) {
      const tenant = await this.tenantsRepository.findById(membership.tenantId);
      if (!tenant) continue;

      tenants.push({ id: tenant.id.toString(), name: tenant.name });

      if (
        membership.lastAccessAt &&
        (!lastAccess || membership.lastAccessAt > lastAccess)
      ) {
        lastAccess = membership.lastAccessAt;
        lastTenantLogin = {
          id: tenant.id.toString(),
          name: tenant.name,
          role: membership.role,
        };
      }
    }

    // Fallback caso nenhum tenant tenha lastAccessAt
    if (!lastTenantLogin && tenants.length > 0) {
      const fallback = memberships[0];
      const fallbackTenant = await this.tenantsRepository.findById(
        fallback.tenantId
      );
      lastTenantLogin = {
        id: fallbackTenant!.id.toString(),
        name: fallbackTenant!.name,
        role: fallback.role,
      };
    }

    // Geração do token
    const token = TokenHelper.singToken({
      id: user.id.toString(),
      name: user.nickName,
      email: user.email,
      tenantId: lastTenantLogin?.id.toString() ?? "",
      role: lastTenantLogin?.role ?? "",
    });

    // Registrar token de acesso no cache do redis
    const keyAccessToken = TokenHelper.getAccessTokenKey(user.id.toString());
    this.redisServices.set(keyAccessToken, token, env.JWT_EXP);

    return success({
      token,
      user: {
        id: user.id.toString(),
        name: user.fullName,
        email: user.email,
        tenantId: lastTenantLogin?.id ?? "",
        role: lastTenantLogin?.role ?? "",
      },
      tenants,
    });
  }
}
