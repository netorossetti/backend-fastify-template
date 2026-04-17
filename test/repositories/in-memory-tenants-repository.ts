import { TenantsRepository } from "src/domain/application/repositories/tenants-repository";
import { Tenant } from "src/domain/enterprise/entities/tenant";
import { InMemoryMembershipsRepository } from "./in-memory-memberships-repository";

export class InMemoryTenantsRepository implements TenantsRepository {
  public items: Tenant[] = [];

  private getMembershipsRepository?: () => InMemoryMembershipsRepository;

  setMembershipsRepository(getter: () => InMemoryMembershipsRepository) {
    this.getMembershipsRepository = getter;
  }

  async findById(id: string): Promise<Tenant | null> {
    const tenant = this.items.find((u) => u.id.toString() === id);
    return tenant ?? null;
  }

  async findByDocument(documentNumber: string): Promise<Tenant | null> {
    const tenant = this.items.find((u) => u.documentNumber === documentNumber);
    return tenant ?? null;
  }

  async findManyByUser(userId: string): Promise<Tenant[]> {
    const membershipsRepository = this.getMembershipsRepository?.();
    if (!membershipsRepository) throw new Error("membershipsRepository not provider.");

    const tenantsIds = membershipsRepository.items
      .filter((i) => i.userId === userId)
      .reduce<string[]>((acc, curr) => {
        if (
          (curr.owner || ["admin", "superAdmin"].includes(curr.role)) &&
          !acc.includes(curr.tenantId)
        ) {
          acc.push(curr.tenantId);
        }
        return acc;
      }, []);

    const tenants = this.items.filter((i) => tenantsIds.includes(i.id.toString()));
    return tenants;
  }

  async create(tenant: Tenant): Promise<Tenant> {
    if (tenant.isNew()) {
      this.items.push(tenant);
      return tenant;
    }
    throw new Error("Tenant is not a new register.");
  }

  async save(tenant: Tenant): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id.equals(tenant.id));
    if (itemIndex !== -1) {
      this.items[itemIndex] = tenant;
    }
  }

  async delete(tenant: Tenant): Promise<boolean> {
    const newItems = this.items.filter((i) => !i.id.equals(tenant.id));
    const excluded = newItems.length < this.items.length;
    this.items = newItems;
    return excluded;
  }
}
