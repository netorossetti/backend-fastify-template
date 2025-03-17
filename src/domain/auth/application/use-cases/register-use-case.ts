import { BadRequestError } from "src/core/errors/bad-request-error";
import { ConflictError } from "src/core/errors/conflict-error";
import { StringHelper } from "src/core/helpers/string-helper";
import { HashGenerator } from "src/core/lib/criptography/hash-generator";
import { Result, failure, success } from "src/core/result";
import { RoleUserType, User } from "../../enterprise/entities/user";
import { UsersRepository } from "../repositories/usuarios-repository";

interface RegisterUserUseCaseRequest {
  name: string;
  email: string;
  password: string;
  role: RoleUserType;
}

type RegisterUserUseCaseResponse = Result<
  ConflictError | BadRequestError,
  {
    name: string;
    email: string;
    role: RoleUserType;
  }
>;

export class RegisterUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hasher: HashGenerator
  ) {}
  async execute({
    name,
    email,
    password,
    role,
  }: RegisterUserUseCaseRequest): Promise<RegisterUserUseCaseResponse> {
    // Autenticar no sistema de contrato
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
