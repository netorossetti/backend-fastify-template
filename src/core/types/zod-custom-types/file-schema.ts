import z from "zod/v4";

export const acceptedAvatarsMimeTypes = [
  "image/png",
  "image/jpeg",
  "image/webp",
];

export const acceptedAttachmentMimeTypes = [
  // Imagens
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/bmp",
  "image/webp",

  // PDF
  "application/pdf",

  // Word (DOC e DOCX)
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx

  // Excel (XLS e XLSX)
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
];

// Tipagem do arquivo
export type FileField = {
  fileName: string;
  fileSize: number;
  mimeType: string;
  buffer: Buffer;
};

/**
 * Cria um schema Zod dinâmico para validação de arquivos
 */
export function zodFileSchema({
  acceptedMimeTypes,
  maxSizeMB,
}: {
  acceptedMimeTypes: readonly string[];
  maxSizeMB: number;
}) {
  return z
    .object({
      buffer: z.instanceof(Buffer),
      fileName: z.string(),
      fileSize: z.number(),
      mimeType: z
        .string()
        .refine((mimeType) => acceptedMimeTypes.includes(mimeType), {
          message:
            "Formato inválido. Valores aceitos: " + acceptedMimeTypes.join(" "),
        }),
    })
    .refine((buffer) => buffer.fileSize <= maxSizeMB * 1024 * 1024, {
      message: `Tamanho máximo permitido: ${maxSizeMB}MB`,
      path: ["fileSize"], // Aponta para o campo correto
    });
}

const schema = zodFileSchema({
  maxSizeMB: 5,
  acceptedMimeTypes: [
    ...acceptedAvatarsMimeTypes,
    ...acceptedAttachmentMimeTypes,
  ],
});
export type FileSchema = z.infer<typeof schema>;
