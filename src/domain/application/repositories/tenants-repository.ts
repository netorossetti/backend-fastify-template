import { Tenant } from "src/domain/enterprise/entities/tenant";

export interface TenantsRepository {
  findById(id: string): Promise<Tenant | null>;
  findByDocument(documentNumber: string): Promise<Tenant | null>;
  findManyByUser(userId: string): Promise<Tenant[]>;
  create(user: Tenant): Promise<Tenant>;
  save(user: Tenant): Promise<void>;
  delete(tenant: Tenant): Promise<boolean>;
}
