import { UsersRepository } from "src/domain/application/repositories/users-repository";
import { User } from "src/domain/enterprise/entities/user";

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = [];

  async findById(id: string): Promise<User | null> {
    const user = this.items.find((u) => u.id.toString() === id);
    return user ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.items.find((u) => u.email === email);
    return user ?? null;
  }

  async create(user: User): Promise<User> {
    if (user.isNew()) {
      this.items.push(user);
      return user;
    }
    throw new Error("User is not a new register.");
  }

  async save(user: User): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === user.id);
    if (itemIndex !== -1) {
      this.items[itemIndex] = user;
    }
  }

  async delete(user: User): Promise<boolean> {
    const newItems = this.items.filter((i) => i.id !== user.id);
    const excluded = newItems.length < this.items.length;
    this.items = newItems;
    return excluded;
  }
}
