import { z } from 'zod'

// Definindo os valores possíveis para sortOrder
const SortOrderSchema = z.enum(['asc', 'desc'])

// Schema para os parâmetros de consulta
export const SchemaReqQueryOptions = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  sortBy: z.string().optional(),
  sortOrder: SortOrderSchema.optional(),
  filters: z
    .string()
    .optional()
    .transform((val) => (val ? JSON.parse(val) : undefined)),
})

export type ReqQueryOptions = z.infer<typeof SchemaReqQueryOptions>
