import { BadRequestError } from "src/core/errors/bad-request-error";
import { ConflictError } from "src/core/errors/conflict-error";
import { StringHelper } from "src/core/helpers/string-helper";
import { HashGenerator } from "src/core/lib/criptography/hash-generator";
import { Result, failure, success } from "src/core/result";
import { DocumentType, Tenant } from "src/domain/enterprise/entities/tenant";
import { UserTenantMembership } from "src/domain/enterprise/entities/user-tenant-membership";
import { isCNH, isCNPJ, isCPF } from "validation-br";
import { User } from "../../../enterprise/entities/user";
import { TenantsRepository } from "../../repositories/tenants-repository";
import { UserTenantMembershipsRepository } from "../../repositories/user-tenant-memberships-repository";
import { UsersRepository } from "../../repositories/users-repository";

interface CreateAccountUseCaseRequest {
  firstName: string;
  lastName: string;
  nickName?: string;
  email: string;
  password: string;
  tenant: {
    name: string;
    nickName: string;
    documentType: DocumentType;
    documentNumber: string;
  };
}

type CreateAccountUseCaseResponse = Result<
  ConflictError | BadRequestError,
  { userId: string; tenantId: string }
>;

export class CreateAccountUseCase {
  constructor(
    private tenantsRepository: TenantsRepository,
    private usersRepository: UsersRepository,
    private membershipsRepository: UserTenantMembershipsRepository,
    private hasher: HashGenerator
  ) {}
  async execute({
    firstName,
    lastName,
    nickName,
    email,
    password,
    tenant,
  }: CreateAccountUseCaseRequest): Promise<CreateAccountUseCaseResponse> {
    // Verificar se o tenant já existe
    const tenantAlreadyExists = await this.tenantsRepository.findByDocument(
      tenant.documentType
    );
    if (tenantAlreadyExists)
      return failure(
        new ConflictError(
          "Organização já foi registrada com o documento informado."
        )
      );

    let documentOnlyNumbers = StringHelper.onlyNumbers(tenant.documentNumber);
    switch (tenant.documentType) {
      case "CPF":
        if (!isCPF(documentOnlyNumbers)) {
          return failure(
            new BadRequestError(
              "Numero do documento informado não é um CPF válido."
            )
          );
        }
        break;

      case "CNPJ":
        if (!isCNPJ(documentOnlyNumbers)) {
          return failure(
            new BadRequestError(
              "Numero do documento informado não é um CNPJ válido."
            )
          );
        }
        break;

      case "CNH":
        if (!isCNH(documentOnlyNumbers)) {
          return failure(
            new BadRequestError(
              "Numero do documento informado não é um CNH válido."
            )
          );
        }
        break;

      default:
        break;
    }

    const newTenant = Tenant.create({
      name: tenant.name,
      nickName: tenant.nickName,
      documentType: tenant.documentType,
      documentNumber: documentOnlyNumbers,
    });

    // Recuperar usuário
    const userExists = await this.usersRepository.findByEmail(email);
    const user =
      userExists ??
      User.create({
        firstName,
        lastName,
        nickName: nickName ?? firstName,
        email,
        password: "",
      });

    // Verifica senha
    const passwordRequirements = StringHelper.passwordRequirements(password);
    if (passwordRequirements != null) {
      return failure(
        new BadRequestError("Senha inválida.", {
          password: passwordRequirements,
        })
      );
    }

    // Cryptografar password do usuário
    const passwordHash = await this.hasher.hash(password);
    user.password = passwordHash;

    const membership = UserTenantMembership.create({
      userId: user.id.toString(),
      tenantId: newTenant.id.toString(),
      role: "admin",
      owner: true,
    });

    // Adicionar/Atualiza usuário
    if (user.isNew()) await this.usersRepository.create(user);
    else await this.usersRepository.save(user);

    // Registrar novo tenant
    await this.tenantsRepository.create(newTenant);
    await this.membershipsRepository.create(membership);

    return success({
      userId: user.id.toString(),
      tenantId: newTenant.id.toString(),
    });
  }
}
