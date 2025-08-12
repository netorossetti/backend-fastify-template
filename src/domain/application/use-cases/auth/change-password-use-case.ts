import { NotFoundError } from "@core/errors/not-found-error";
import { Result, failure, success } from "@core/result";
import { BadRequestError } from "src/core/errors/bad-request-error";
import { StringHelper } from "src/core/helpers/string-helper";
import { HashCompare } from "src/core/lib/criptography/hash-compare";
import { HashGenerator } from "src/core/lib/criptography/hash-generator";
import { UsersRepository } from "../../repositories/users-repository";

interface ChangePasswordUseCaseRequest {
  userId: string;
  password: string;
  newPassword: string;
  newPasswordCheck: string;
}

type ChangePasswordUseCaseResponse = Result<
  NotFoundError | BadRequestError,
  {}
>;

export class ChangePasswordUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hasher: HashCompare & HashGenerator
  ) {}

  async execute({
    userId,
    password,
    newPassword,
    newPasswordCheck,
  }: ChangePasswordUseCaseRequest): Promise<ChangePasswordUseCaseResponse> {
    // Validar nova senha e senha de confirmação
    if (newPassword !== newPasswordCheck)
      return failure(
        new BadRequestError(
          "A senha de confirmação está diferente da nova senha."
        )
      );

    // Verifica senha
    const passwordRequirements = StringHelper.passwordRequirements(newPassword);
    if (passwordRequirements != null) {
      return failure(
        new BadRequestError("Senha inválida.", {
          password: passwordRequirements,
        })
      );
    }

    const user = await this.usersRepository.findById(userId);
    if (!user) return failure(new NotFoundError("Usuário não encontrado."));

    // Validar senha atual
    const compare = await this.hasher.compare(password, user.password);
    if (!compare) return failure(new NotFoundError("Senha atual incorreta."));

    // Atualizar dados do usuário
    user.password = await this.hasher.hash(newPassword);
    await this.usersRepository.save(user);

    return success({});
  }
}
