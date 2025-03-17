export abstract class WatchedList<T> {
  public currentItems: T[];
  private initial: T[];
  private new: T[];
  private removed: T[];
  private modified: T[]; // Para armazenar itens modificados

  constructor(initialItems?: T[]) {
    this.currentItems = initialItems || [];
    this.initial = initialItems ? [...initialItems] : [];
    this.new = [];
    this.removed = [];
    this.modified = [];
  }

  abstract compareItems(a: T, b: T): boolean; // Para comparar se dois itens são iguais
  abstract isItemModified(initial: T, current: T): boolean; // Para comparar se houve mudança no item

  public getItems(): T[] {
    return this.currentItems;
  }

  public getNewItems(): T[] {
    return this.new;
  }

  public getRemovedItems(): T[] {
    return this.removed;
  }

  public getModifiedItems(): T[] {
    return this.modified;
  }

  public getInitializedItems(): T[] {
    return this.initial;
  }

  public getUnchangedItems(): T[] {
    return this.initial.filter((initialItem) => {
      const isStillPresent = this.currentItems.some((currentItem) =>
        this.compareItems(initialItem, currentItem)
      );
      const isNotModified = !this.modified.some((modifiedItem) =>
        this.compareItems(initialItem, modifiedItem)
      );
      const isNotRemoved = !this.removed.some((removedItem) =>
        this.compareItems(initialItem, removedItem)
      );

      return isStillPresent && isNotModified && isNotRemoved;
    });
  }

  private isCurrentItem(item: T): boolean {
    return this.currentItems.some((v: T) => this.compareItems(item, v));
  }

  private isNewItem(item: T): boolean {
    return this.new.some((v: T) => this.compareItems(item, v));
  }

  private isRemovedItem(item: T): boolean {
    return this.removed.some((v: T) => this.compareItems(item, v));
  }

  private isModifiedItem(item: T): boolean {
    const initialItem = this.initial.find((v: T) => this.compareItems(v, item));
    return initialItem ? this.isItemModified(initialItem, item) : false;
  }

  private removeFromNew(item: T): void {
    this.new = this.new.filter((v) => !this.compareItems(v, item));
  }

  private removeFromCurrent(item: T): void {
    this.currentItems = this.currentItems.filter(
      (v) => !this.compareItems(item, v)
    );
  }

  private removeFromRemoved(item: T): void {
    this.removed = this.removed.filter((v) => !this.compareItems(item, v));
  }

  private wasAddedInitially(item: T): boolean {
    return this.initial.some((v: T) => this.compareItems(item, v));
  }

  public exists(item: T): boolean {
    return this.isCurrentItem(item);
  }

  public addMany(itens: T[]): void {
    for (const item of itens) {
      this.add(item);
    }
  }

  public add(item: T): void {
    // Se o item estiver na lista de removidos, removê-lo de lá
    if (this.isRemovedItem(item)) {
      this.removeFromRemoved(item);
    }

    // Se o item for novo e não estava na lista inicial, adicioná-lo à lista de novos
    if (!this.isNewItem(item) && !this.wasAddedInitially(item)) {
      this.new.push(item);
    }

    // Verifica se o item já está na lista inicial
    if (this.wasAddedInitially(item)) {
      // Se o item foi modificado em relação ao inicial
      if (this.isModifiedItem(item)) {
        // Adiciona à lista de itens modificados
        this.modified.push(item);

        // Atualiza o item na lista `currentItems` para refletir a modificação
        const currentItemIndex = this.currentItems.findIndex((v) =>
          this.compareItems(v, item)
        );
        if (currentItemIndex !== -1) {
          this.currentItems[currentItemIndex] = item; // Atualiza o item na lista de itens atuais
        } else {
          this.currentItems.push(item); // Caso o item não esteja na lista, adiciona-o
        }
      } else {
        // Se não esta na lista corrente
        if (!this.isCurrentItem(item)) {
          // Adiciona à lista de itens
          this.currentItems.push(item);
        }
      }
    } else {
      // Se o item não existe na lista inicial, adicioná-lo aos itens atuais
      if (!this.isCurrentItem(item)) {
        this.currentItems.push(item);
      }
    }
  }

  public remove(item: T): void {
    this.removeFromCurrent(item);

    if (this.isNewItem(item)) {
      this.removeFromNew(item);
      return;
    }

    if (!this.isRemovedItem(item)) {
      this.removed.push(item);
    }
  }

  public update(items: T[]): void {
    const newItems = items.filter((a) => {
      return !this.getItems().some((b) => this.compareItems(a, b));
    });

    const removedItems = this.getItems().filter((a) => {
      return !items.some((b) => this.compareItems(a, b));
    });

    // Verifica itens modificados
    const modifiedItems = items.filter((a) => {
      return this.initial.some(
        (b) => this.compareItems(a, b) && this.isItemModified(b, a)
      );
    });

    this.currentItems = items;
    this.new = newItems;
    this.removed = removedItems;
    this.modified = modifiedItems; // Atualiza a lista de modificados
  }
}
