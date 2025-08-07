import { NotFoundError } from "@core/errors/not-found-error";
import { Result, failure, success } from "@core/result";
import { BadRequestError } from "src/core/errors/bad-request-error";
import { ConflictError } from "src/core/errors/conflict-error";
import { NotAllowedError } from "src/core/errors/not-allowed-error";
import { StringHelper } from "src/core/helpers/string-helper";
import { DocumentType, Tenant } from "src/domain/enterprise/entities/tenant";
import { isCNH, isCNPJ, isCPF } from "validation-br";
import { MembershipsRepository } from "../../repositories/memberships-repository";
import { TenantsRepository } from "../../repositories/tenants-repository";
import { UsersRepository } from "../../repositories/users-repository";

interface UpdateTenantUseCaseRequest {
  userId: string;
  tenantId: string;
  name: string;
  nickName: string;
  documentType: DocumentType;
  documentNumber: string;
}

type UpdateTenantUseCaseResponse = Result<
  NotFoundError | NotAllowedError | ConflictError | BadRequestError,
  { tenant: Tenant }
>;

export class UpdateTenantUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private tenantsRepository: TenantsRepository,
    private membershipsRepository: MembershipsRepository
  ) {}

  async execute({
    userId,
    tenantId,
    documentType,
    documentNumber,
    name,
    nickName,
  }: UpdateTenantUseCaseRequest): Promise<UpdateTenantUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user) return failure(new NotFoundError("Usuário não localizado."));

    // Recuperar o tenant
    const tenant = await this.tenantsRepository.findById(tenantId);
    if (!tenant)
      return failure(new NotFoundError("Organização não localizado."));

    // Validar se usuário pertence a organização
    const membership = await this.membershipsRepository.findByUserAndTenant(
      userId,
      tenantId
    );
    if (!membership)
      return failure(new NotAllowedError("Usuário não pernete a organização."));

    // Validar se usuário pode alterar o tenant (owner or 'ADMIN'/'SUPERADMIN')
    if (
      !(membership.owner || ["admin", "superAdmin"].includes(membership.role))
    )
      return failure(
        new NotAllowedError(
          "Usuário não tem permisão necessária para alterar dados da organização."
        )
      );

    // Verificar se o tenant já existe
    let documentOnlyNumbers = StringHelper.onlyNumbers(documentNumber);
    const tenantAlreadyExists = await this.tenantsRepository.findByDocument(
      documentOnlyNumbers
    );

    if (tenantAlreadyExists && !tenantAlreadyExists.id.equals(tenant.id))
      return failure(
        new ConflictError(
          "Organização já foi registrada com o documento informado."
        )
      );

    // Alterar os dados do tenant
    tenant.name = name;
    tenant.nickName = nickName;
    tenant.documentType = documentType;
    tenant.documentNumber = documentOnlyNumbers;

    //Validar documentos caso tenha sido alterado
    switch (tenant.documentType) {
      case "CPF":
        if (!isCPF(tenant.documentNumber)) {
          return failure(
            new BadRequestError(
              "Numero do documento informado não é um CPF válido."
            )
          );
        }
        break;

      case "CNPJ":
        if (!isCNPJ(tenant.documentNumber)) {
          return failure(
            new BadRequestError(
              "Numero do documento informado não é um CNPJ válido."
            )
          );
        }
        break;

      case "CNH":
        if (!isCNH(tenant.documentNumber)) {
          return failure(
            new BadRequestError(
              "Numero do documento informado não é um CNH válido."
            )
          );
        }
        break;

      default:
        return failure(new BadRequestError("Tipo de documento inválido."));
        break;
    }

    // Salvar dados
    await this.tenantsRepository.save(tenant);

    return success({ tenant });
  }
}
