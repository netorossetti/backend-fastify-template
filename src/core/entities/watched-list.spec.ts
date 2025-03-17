import { WatchedList } from "./watched-list";

// Exemplo de um item de teste com um id, nome e valor
interface MyItem {
  id: number;
  name: string;
  value: number;
}

// Classe concreta para testar a WatchedList com o tipo MyItem
class MyItemList extends WatchedList<MyItem> {
  compareItems(a: MyItem, b: MyItem): boolean {
    return a.id === b.id;
  }

  isItemModified(initial: MyItem, current: MyItem): boolean {
    return initial.name !== current.name || initial.value !== current.value;
  }
}

const initialItems: MyItem[] = [
  { id: 1, name: "Item 1", value: 10 },
  { id: 2, name: "Item 2", value: 20 },
];
let watchedList: MyItemList;

describe("WatchedList", () => {
  beforeEach(() => {
    // Renova a instância da lista observada com os itens limpos
    watchedList = new MyItemList([
      { id: 1, name: "Item 1", value: 10 },
      { id: 2, name: "Item 2", value: 20 },
    ]);
  });

  it("should initialize with the given items", () => {
    expect(watchedList.getItems()).toEqual(initialItems);
  });

  it("should detect new items added", () => {
    const newItem: MyItem = { id: 3, name: "Item 3", value: 30 };
    watchedList.add(newItem);

    expect(watchedList.getNewItems()).toEqual([newItem]);
    expect(watchedList.getItems()).toContain(newItem);
  });

  it("should detect removed items", () => {
    const removedItem: MyItem = initialItems[0];
    watchedList.remove(removedItem);

    expect(watchedList.getRemovedItems()).toEqual([removedItem]);
    expect(watchedList.getItems()).not.toContain(removedItem);
  });

  it("should detect modified items", () => {
    // Modificamos o nome e o valor do primeiro item
    const modifiedItem: MyItem = { id: 1, name: "Item 1 Modified", value: 100 };
    watchedList.add(modifiedItem);

    expect(watchedList.getModifiedItems()).toEqual([modifiedItem]);
    expect(watchedList.getItems()).toContain(modifiedItem);
  });

  it("should update with new, removed, and modified items", () => {
    const newItem: MyItem = { id: 3, name: "Item 3", value: 30 };
    const modifiedItem: MyItem = { id: 1, name: "Item 1 Modified", value: 100 };

    watchedList.update([modifiedItem, initialItems[1], newItem]);

    // Testa itens novos
    expect(watchedList.getNewItems()).toEqual([newItem]);

    // Testa itens modificados
    expect(watchedList.getModifiedItems()).toEqual([modifiedItem]);

    // Não deve haver itens removidos
    expect(watchedList.getRemovedItems()).toEqual([]);
  });

  it("should handle removed items during update", () => {
    // Remover o segundo item
    watchedList.update([initialItems[0]]);

    expect(watchedList.getRemovedItems()).toEqual([initialItems[1]]);
    expect(watchedList.getItems()).not.toContain(initialItems[1]);
  });

  it("should handle adding, removing, and modifying in one update", () => {
    const newItem: MyItem = { id: 3, name: "Item 3", value: 30 };
    const modifiedItem: MyItem = { id: 2, name: "Item 2 Modified", value: 200 };

    // Atualizar a lista com 1 novo, 1 modificado, e remover o item 1
    watchedList.update([modifiedItem, newItem]);

    expect(watchedList.getNewItems()).toEqual([newItem]);
    expect(watchedList.getModifiedItems()).toEqual([modifiedItem]);
    expect(watchedList.getRemovedItems()).toEqual([initialItems[0]]);
  });

  it("should handle adding modified item", () => {
    const modifiedItem: MyItem = { id: 2, name: "Item 2 Modified", value: 200 };

    // adiciona um item modificado a lista
    watchedList.add(modifiedItem);

    expect(watchedList.getItems()).toContain(modifiedItem);
    expect(watchedList.getModifiedItems()).toEqual([modifiedItem]);
  });

  it("should handle adding many itens", () => {
    const newItem: MyItem = { id: 3, name: "Item 3", value: 30 };
    const modifiedItem: MyItem = { id: 2, name: "Item 2 Modified", value: 200 };

    // adiciona um item modificado a lista
    watchedList.addMany([modifiedItem, newItem]);

    watchedList.remove({ id: 1, name: "Item 1", value: 10 });
    watchedList.add({ id: 1, name: "Item 1", value: 10 });

    expect(watchedList.getItems()).toContain(modifiedItem);
    expect(watchedList.getNewItems()).toEqual([newItem]);
    expect(watchedList.getModifiedItems()).toEqual([modifiedItem]);
  });

  it("should handle remove all itens and moving to include", () => {
    for (const item of watchedList.getItems()) {
      watchedList.remove(item);
    }

    // adiciona um item modificado a lista
    watchedList.addMany([
      { id: 1, name: "Item 1", value: 10 },
      { id: 2, name: "Item 2", value: 203 },
    ]);

    expect(watchedList.getItems()).toEqual([
      { id: 1, name: "Item 1", value: 10 },
      { id: 2, name: "Item 2", value: 203 },
    ]);
    expect(watchedList.getRemovedItems()).toHaveLength(0);
    expect(watchedList.getNewItems()).toHaveLength(0);
    expect(watchedList.getModifiedItems()).toHaveLength(1);
    expect(watchedList.getUnchangedItems()).toHaveLength(1);
    expect(watchedList.getInitializedItems()).toEqual([
      { id: 1, name: "Item 1", value: 10 },
      { id: 2, name: "Item 2", value: 20 },
    ]);
  });
});
