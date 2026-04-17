import { FakeEncrypter } from "test/lib/cryptography/faker-encrypter";
import { FakerHasher } from "test/lib/cryptography/faker-hasher";
import { FakerMailSender } from "test/lib/faker-mail-sender";
import { FakerRedisServices } from "test/lib/faker-redis-services";
import { FakerStorage } from "../lib/faker-storage";
import { InMemoryMembershipsRepository } from "../repositories/in-memory-memberships-repository";
import { InMemoryTenantsRepository } from "../repositories/in-memory-tenants-repository";
import { InMemoryUsersRepository } from "../repositories/in-memory-users-repository";

/**
 * Cria um "contexto de teste" padronizado com todos os repositórios
 * e fakes necessários para os casos de uso.
 */
export function createTestContext() {
  /* Instanciar fakes/libs */
  const fakerHasher = new FakerHasher();
  const fakeEncrypter = new FakeEncrypter();
  const fakerMailSender = new FakerMailSender();
  const fakerRedisServices = new FakerRedisServices();
  const fakerUploader = new FakerStorage();

  /* Instanciar repositórios isoladamente */
  const usersRepository = new InMemoryUsersRepository();
  const membershipsRepository = new InMemoryMembershipsRepository();
  const tenantsRepository = new InMemoryTenantsRepository();

  /* Injetar dependências em ordem correta */
  // Memberships → Users
  membershipsRepository.setUsersRepository(usersRepository);

  // Tenants → Memberships
  tenantsRepository.setMembershipsRepository(() => membershipsRepository);

  //  Retornar tudo que for necessário
  return {
    // Libs / fakes
    fakerHasher,
    fakeEncrypter,
    fakerMailSender,
    fakerRedisServices,
    fakerUploader,

    // Repositórios
    usersRepository,
    membershipsRepository,
    tenantsRepository,
  };
}
