import { BadRequestError } from "src/core/errors/bad-request-error";
import { ConflictError } from "src/core/errors/conflict-error";
import { StringHelper } from "src/core/helpers/string-helper";
import { HashGenerator } from "src/core/lib/criptography/hash-generator";
import { Result, failure, success } from "src/core/result";
import { Membership } from "src/domain/enterprise/entities/membership";
import { DocumentType, Tenant } from "src/domain/enterprise/entities/tenant";
import { isCNH, isCNPJ, isCPF } from "validation-br";
import { User } from "../../../enterprise/entities/user";
import { MembershipsRepository } from "../../repositories/memberships-repository";
import { TenantsRepository } from "../../repositories/tenants-repository";
import { UsersRepository } from "../../repositories/users-repository";

interface CreateTenantUseCaseRequest {
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

type CreateTenantUseCaseResponse = Result<
  ConflictError | BadRequestError,
  { userId: string; tenantId: string }
>;

export class CreateTenantUseCase {
  constructor(
    private tenantsRepository: TenantsRepository,
    private usersRepository: UsersRepository,
    private membershipsRepository: MembershipsRepository,
    private hasher: HashGenerator
  ) {}
  async execute({
    firstName,
    lastName,
    nickName,
    email,
    password,
    tenant,
  }: CreateTenantUseCaseRequest): Promise<CreateTenantUseCaseResponse> {
    // Verificar se o tenant já existe
    let documentOnlyNumbers = StringHelper.onlyNumbers(tenant.documentNumber);
    const tenantAlreadyExists = await this.tenantsRepository.findByDocument(
      documentOnlyNumbers
    );
    if (tenantAlreadyExists)
      return failure(
        new ConflictError(
          "Organização já foi registrada com o documento informado."
        )
      );

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

    const membership = Membership.create({
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
