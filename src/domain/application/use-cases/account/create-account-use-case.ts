import { BadRequestError } from "src/core/errors/bad-request-error";
import { ConflictError } from "src/core/errors/conflict-error";
import { StringHelper } from "src/core/helpers/string-helper";
import { HashGenerator } from "src/core/lib/criptography/hash-generator";
import { Result, failure, success } from "src/core/result";
import { DocumentType, Tenant } from "src/domain/enterprise/entities/tenant";
import { isCNH, isCNPJ, isCPF } from "validation-br";
import { RoleUserType, User } from "../../../enterprise/entities/user";
import { TenantsRepository } from "../../repositories/tenants-repository";
import { UsersRepository } from "../../repositories/users-repository";

interface CreateAccountUseCaseRequest {
  firstName: string;
  lastName: string;
  nickName?: string;
  documentType: DocumentType;
  documentNumber: string;
  email: string;
  password: string;
  role: RoleUserType;
}

type CreateAccountUseCaseResponse = Result<
  ConflictError | BadRequestError,
  {
    name: string;
    email: string;
    role: RoleUserType;
  }
>;

export class CreateAccountUseCase {
  constructor(
    private tenantsRepository: TenantsRepository,
    private usersRepository: UsersRepository,
    private hasher: HashGenerator
  ) {}
  async execute({
    firstName,
    lastName,
    nickName,
    documentType,
    documentNumber,
    email,
    password,
    role,
  }: CreateAccountUseCaseRequest): Promise<CreateAccountUseCaseResponse> {
    // Verificar se o tenant já existe
    const tenantExists = await this.tenantsRepository.findByDocument(
      documentType
    );
    if (tenantExists)
      return failure(
        new ConflictError(
          "Organização já foi registrada com o documento informado."
        )
      );

    let documentOnlyNumbers = StringHelper.onlyNumbers(documentNumber);
    switch (documentType) {
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
      firstName,
      lastName,
      nickName: nickName ?? firstName,
      documentType,
      documentNumber,
    });

    const userExists = await this.usersRepository.findByEmail(email);
    if (userExists) {
      return failure(
        new ConflictError("Usuário já foi registrado com o email informado.")
      );
    }

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

    // Criar registro do usuário
    const user = await this.usersRepository.create(
      User.create({
        name,
        email,
        password: passwordHash,
        role,
      })
    );

    return success({
      name: user.name,
      email: user.email,
      role: user.role,
    });
  }
}
