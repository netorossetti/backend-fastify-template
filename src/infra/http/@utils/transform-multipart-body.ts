import type { MultipartFile, MultipartValue } from "@fastify/multipart";
import { Buffer } from "node:buffer";
import z from "zod/v4";

export type MultipartBody = Record<
  string,
  MultipartValue | MultipartFile | MultipartValue[] | MultipartFile[]
>;

type FileField = {
  buffer: Buffer;
  fileName: string;
  fileSize: number;
  mimeType: string;
};

export function isMultipartBody(body: unknown): body is MultipartBody {
  return typeof body === "object" && body !== null;
}

function parsePrimitive(value: string): unknown {
  return value;
}

const fileFieldNames = [
  "buffer",
  "files",
  "attachment",
  "attachments",
  "avatar",
];

export async function transformMultipartBody<T extends z.ZodSchema<any>>(
  body: MultipartBody,
  schema: T
): Promise<z.infer<T>> {
  const transformed: Partial<T> = {};

  for (const [key, entry] of Object.entries(body)) {
    const values = Array.isArray(entry) ? entry : [entry];

    for (const value of values) {
      if ("type" in value && value.type === "field") {
        if (value.value === "" && fileFieldNames.includes(key)) {
          continue;
        }

        const parsedValue = parsePrimitive(value.value as string);
        if (key in transformed) {
          const current = transformed[key as keyof T];
          transformed[key as keyof T] = Array.isArray(current)
            ? ([...current, parsedValue] as T[keyof T])
            : ([current, parsedValue] as T[keyof T]);
        } else {
          transformed[key as keyof T] = parsedValue as T[keyof T];
        }
      }

      if ("type" in value && value.type === "file") {
        const fileBuffer = await value.toBuffer();
        const fileObj: FileField = {
          buffer: fileBuffer,
          fileName: value.filename,
          fileSize: fileBuffer.length,
          mimeType: value.mimetype,
        };

        if (key in transformed) {
          const current = transformed[key as keyof T];
          transformed[key as keyof T] = Array.isArray(current)
            ? ([...current, fileObj] as T[keyof T])
            : ([current, fileObj] as T[keyof T]);
        } else {
          transformed[key as keyof T] = fileObj as T[keyof T];
        }
      }
    }
  }

  // ✅ Validação com o schema
  const parsed = schema.safeParse(transformed);
  if (!parsed.success) {
    throw new z.ZodError(parsed.error.issues);
  }

  return parsed.data;
}
