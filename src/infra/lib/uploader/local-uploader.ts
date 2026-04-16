import fs from "fs/promises";
import path from "path";
import { Uploader, UploadParams } from "src/core/lib/uploader/uploader.js";

export class LocalUploader implements Uploader {
  private uploadDir: string;

  constructor(baseDir: string) {
    this.uploadDir = baseDir;
  }

  async upload({ fileName, buffer, mimeType, folder }: UploadParams): Promise<string> {
    const uploadFolder = folder ?? "default";
    const targetFolder = path.join(this.uploadDir, uploadFolder);
    await fs.mkdir(targetFolder, { recursive: true });

    const fileExt = path.extname(fileName) || this.getExtensionFromMimeType(mimeType);

    // 🔁 Nome do arquivo fornecido já é único (ex: userId.jpg)
    const finalFileName = fileName.endsWith(fileExt) ? fileName : fileName + fileExt;
    const filePath = path.join(targetFolder, finalFileName);

    // ⚠️ Sobrescreve o arquivo, se já existir
    await fs.writeFile(filePath, buffer);

    // 🔗 URL pública
    return `/uploads/${uploadFolder}/${finalFileName}`;
  }

  private getExtensionFromMimeType(mime: string): string {
    const map: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
    };
    return map[mime] ?? "";
  }
}
