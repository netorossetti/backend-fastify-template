import { BadRequestQueryError } from "src/core/errors/bad-request-query-error";
import { z } from "zod/v4";
import { ReqQueryOptions } from "./request-query-options";

// Definindo os operadores válidos
const validOperators = [
  "equals",
  "different",
  "contains",
  "notcontains",
  "between",
  "gt",
  "gte",
  "lt",
  "lte",
  "in",
  "notIn",
];

// Definindo o esquema para o valor dos filtros
const filterValueSchema = z.union([z.any(), z.array(z.any())]);

// Definindo o esquema para os filtros
const schemaFilterOptions = z.record(
  z.string(),
  z
    .object({
      equals: filterValueSchema.optional(),
      different: filterValueSchema.optional(),
      contains: filterValueSchema.optional(),
      notcontains: filterValueSchema.optional(),
      between: z.array(z.any()).length(2).optional(),
      gt: filterValueSchema.optional(),
      gte: filterValueSchema.optional(),
      lt: filterValueSchema.optional(),
      lte: filterValueSchema.optional(),
      in: z.array(z.any()).optional(),
      notIn: z.array(z.any()).optional(),
    })
    .refine(
      (obj) => Object.keys(obj).some((key) => validOperators.includes(key)),
      {
        message: "Pelo menos um operador válido deve ser fornecido",
      }
    )
);

// Definindo o esquema para as opções de paginação
const schemaPaginationOptions = z.object({
  page: z.number(),
  limit: z.number(),
});

// Definindo o esquema para as opções de ordenação
const schemaSortOptions = z.object({
  sortBy: z.string(),
  sortOrder: z.enum(["asc", "desc"]),
});

// Definindo o esquema para as opções de consulta
export const schemaQueryOptions = z.object({
  filters: schemaFilterOptions.optional(),
  sort: schemaSortOptions.optional(),
  pagination: schemaPaginationOptions.optional(),
});

export type PaginationOptions = z.infer<typeof schemaPaginationOptions>;

export type SortOptions = z.infer<typeof schemaSortOptions>;

export type FilterOptions = z.infer<typeof schemaFilterOptions>;

export type QueryOptions = z.infer<typeof schemaQueryOptions>;

export class QueryOptionsBuilder {
  static fromQueryParams(req: ReqQueryOptions): QueryOptions {
    let filters: FilterOptions | undefined = undefined;
    if (req.filters) {
      const parsedFilter = schemaFilterOptions.safeParse(req.filters);
      if (!parsedFilter.success)
        throw new BadRequestQueryError("filtro", parsedFilter.error.issues);
      filters = parsedFilter.data;
    }

    let sort: SortOptions | undefined = undefined;
    if (req.sortBy) {
      const parsedSort = schemaSortOptions.safeParse({
        sortBy: req.sortBy,
        sortOrder: req.sortOrder ?? "asc",
      });
      if (!parsedSort.success)
        throw new BadRequestQueryError("ordenação", parsedSort.error.issues);
      sort = parsedSort.data;
    }

    let pagination: PaginationOptions | undefined = undefined;
    const validarPaginacao: boolean = !(!req.page && !req.limit);
    if (validarPaginacao) {
      const parsedPagination = schemaPaginationOptions.safeParse({
        page: req.page ?? 1,
        limit: req.limit ?? 20,
      });
      if (!parsedPagination.success)
        throw new BadRequestQueryError(
          "paginação",
          parsedPagination.error.issues
        );
      pagination = parsedPagination.data;
    }

    // Construir o objeto QueryOptions
    return { filters, sort, pagination };
  }
}
