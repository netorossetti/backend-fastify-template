import z from "zod";

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
  file: Buffer;
  filename: string;
  filesize: number;
  mimetype: string;
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
      file: z.instanceof(Buffer),
      filename: z.string(),
      filesize: z.number(),
      mimetype: z
        .string()
        .refine((mimetype) => acceptedMimeTypes.includes(mimetype), {
          message:
            "Formato inválido. Valores aceitos: " + acceptedMimeTypes.join(" "),
        }),
    })
    .refine((file) => file.filesize <= maxSizeMB * 1024 * 1024, {
      message: `Tamanho máximo permitido: ${maxSizeMB}MB`,
      path: ["filesize"], // Aponta para o campo correto
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
