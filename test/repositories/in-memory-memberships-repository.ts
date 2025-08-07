import { MembershipsRepository } from "src/domain/application/repositories/memberships-repository";
import { Membership } from "src/domain/enterprise/entities/membership";

export class InMemoryMembershipsRepository implements MembershipsRepository {
  public items: Membership[] = [];

  async findById(id: string): Promise<Membership | null> {
    const membership = this.items.find((u) => u.id.toString() === id);
    return membership ?? null;
  }

  async findByUserAndTenant(
    userId: string,
    tenantId: string
  ): Promise<Membership | null> {
    const membership = this.items.find(
      (u) => u.userId === userId && u.tenantId === tenantId
    );
    return membership ?? null;
  }

  async findManyByUser(userId: string): Promise<Membership[]> {
    const memberships = this.items.filter((u) => u.userId === userId);
    return memberships;
  }

  async findManyByTenant(tenantId: string): Promise<Membership[]> {
    const memberships = this.items.filter((u) => u.tenantId === tenantId);
    return memberships;
  }

  async updateLastAccess(userId: string, tenantId: string): Promise<boolean> {
    const itemIndex = this.items.findIndex(
      (u) => u.userId === userId && u.tenantId === tenantId
    );
    if (itemIndex !== -1) {
      this.items[itemIndex].lastAccessAt = new Date();
      return true;
    }
    return false;
  }

  async create(membership: Membership): Promise<Membership> {
    if (membership.isNew()) {
      this.items.push(membership);
      return membership;
    }
    throw new Error("Membership is not a new register.");
  }

  async save(membership: Membership): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === membership.id);
    if (itemIndex !== -1) {
      this.items[itemIndex] = membership;
    }
  }

  async delete(membership: Membership): Promise<boolean> {
    const newItems = this.items.filter((i) => i.id !== membership.id);
    const excluded = newItems.length < this.items.length;
    this.items = newItems;
    return excluded;
  }
}
