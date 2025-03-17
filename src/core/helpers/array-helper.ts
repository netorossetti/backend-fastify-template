// array-helper.ts

import { QueryOptions } from "../types/interfaces/query-options";

export class ArrayHelper {
  // Método para verificar duplicatas em uma propriedade específica
  static verificarDuplicatas<T>(array: T[], campo: keyof T): boolean {
    const valoresEncontrados: Set<any> = new Set();

    for (const objeto of array) {
      const valorCampo = objeto[campo];
      if (valoresEncontrados.has(valorCampo)) {
        return true; // Duplicata encontrada
      }
      valoresEncontrados.add(valorCampo);
    }

    return false; // Nenhuma duplicata encontrada
  }

  // Método para aplicar filtros com base nos operadores, com suporte a case insensitive
  static aplicarFiltros<T>(array: T[], filters: QueryOptions["filters"]): T[] {
    if (!filters) return array;

    return array.filter((item) => {
      return Object.entries(filters).every(([key, conditions]) => {
        const value = item[key as keyof T];

        if (
          conditions.equals !== undefined &&
          typeof value === "string" &&
          typeof conditions.equals === "string" &&
          value.toLowerCase() !== conditions.equals.toLowerCase()
        )
          return false;

        if (
          conditions.different !== undefined &&
          typeof value === "string" &&
          typeof conditions.different === "string" &&
          value.toLowerCase() === conditions.different.toLowerCase()
        )
          return false;

        if (
          conditions.in !== undefined &&
          conditions.in.every((val) => typeof val === "string") &&
          typeof value === "string" &&
          !conditions.in.some(
            (val) => val.toLowerCase() === value.toLowerCase()
          )
        )
          return false;

        if (
          conditions.gt !== undefined &&
          typeof value === "number" &&
          value <= conditions.gt
        )
          return false;
        if (
          conditions.gte !== undefined &&
          typeof value === "number" &&
          value < conditions.gte
        )
          return false;
        if (
          conditions.lt !== undefined &&
          typeof value === "number" &&
          value >= conditions.lt
        )
          return false;
        if (
          conditions.lte !== undefined &&
          typeof value === "number" &&
          value > conditions.lte
        )
          return false;

        if (conditions.between) {
          const [min, max] = conditions.between;
          if (typeof value === "number" && (value < min || value > max))
            return false;
        }

        if (
          conditions.contains !== undefined &&
          typeof value === "string" &&
          !value.toLowerCase().includes(conditions.contains.toLowerCase())
        )
          return false;

        if (
          conditions.notcontains !== undefined &&
          typeof value === "string" &&
          value.toLowerCase().includes(conditions.notcontains.toLowerCase())
        )
          return false;

        return true;
      });
    });
  }

  // Método para ordenar com base nas opções de ordenação, alterando o array original
  static ordenar<T>(array: T[], sortOptions: QueryOptions["sort"]): void {
    if (!sortOptions) return;

    const { sortBy, sortOrder } = sortOptions;
    array.sort((a, b) => {
      const aVal = a[sortBy as keyof T];
      const bVal = b[sortBy as keyof T];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.toLowerCase().localeCompare(bVal.toLowerCase())
          : bVal.toLowerCase().localeCompare(aVal.toLowerCase());
      }

      return sortOrder === "asc"
        ? aVal > bVal
          ? 1
          : -1
        : aVal < bVal
        ? 1
        : -1;
    });
  }

  // Método para paginar com base nas opções de paginação, alterando o array original para a página desejada
  static paginar<T>(array: T[], pagination: QueryOptions["pagination"]): void {
    const page = pagination?.page ?? 1;
    const pageSize = pagination?.limit ?? 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    // Mutação direta do array para conter apenas os itens da página
    array.splice(0, array.length, ...array.slice(start, end));
  }

  // Método principal para processar o array com base em queryOptions
  static query<T>(array: T[], options: QueryOptions): void {
    const filtrado = ArrayHelper.aplicarFiltros(array, options.filters);

    // Altera diretamente o array original para conter o resultado filtrado
    array.splice(0, array.length, ...filtrado);
    ArrayHelper.ordenar(array, options.sort);
    ArrayHelper.paginar(array, options.pagination);
  }
}
