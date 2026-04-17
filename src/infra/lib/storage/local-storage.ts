import fs from "fs/promises";
import path from "path";
import Logger from "src/core/lib/logger/logger";
import { FileDeleter } from "src/core/lib/storage/file-deleter";
import { FileFetcher } from "src/core/lib/storage/file-fetcher";
import { FileUploader, UploadParams } from "src/core/lib/storage/file-uploader";

export class LocalStorage implements FileUploader, FileDeleter, FileFetcher {
  private baseDir: string;
  private logger: Logger;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
    this.logger = Logger.getInstance("LocalStorage");
  }

  // --- Métodos de Upload ---

  async upload({ fileName, buffer, mimeType, folder }: UploadParams): Promise<string> {
    const uploadFolder = folder ?? "default";
    const targetFolder = path.join(this.baseDir, uploadFolder);
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

  // --- Métodos de Fetch/Download ---

  /** Converte a URL pública (ex: '/uploads/faces/123.jpg') para o caminho absoluto no sistema de arquivos. */
  private getAbsolutePathFromUrl(urlPath: string): string {
    // Remove o prefixo público esperado (ex: '/uploads/')
    const relativePath = urlPath.replace(/^\/uploads\//, "");

    // Combina com o diretório base configurado na instância
    return path.join(this.baseDir, relativePath);
  }

  /**
   * Busca o arquivo no sistema de arquivos e retorna seu conteúdo binário (Buffer).
   */
  async fetchFileBuffer(filePathOrUrl: string): Promise<Buffer | null> {
    const absolutePath = this.getAbsolutePathFromUrl(filePathOrUrl);

    try {
      // Usa fs.readFile para ler o conteúdo do arquivo
      const buffer = await fs.readFile(absolutePath);
      return buffer;
    } catch (error) {
      // É crucial tratar o erro caso o arquivo não exista ou não possa ser lido
      this.logger.error(`Falha ao ler o arquivo local: ${absolutePath}`, { error });
      return null;
    }
  }

  /**
   * Busca o arquivo e retorna seu conteúdo como uma string Base64, pronta para o protocolo da catraca.
   */
  async fetchFileAsBase64(filePathOrUrl: string): Promise<string | null> {
    // Obtém o buffer primeiro
    const buffer = await this.fetchFileBuffer(filePathOrUrl);

    // Converte o buffer para a string Base64
    return !buffer ? null : buffer.toString("base64");
  }

  /**
   * Remove o arquivo do sistema de arquivos físico.
   */
  async delete(fileUrl: string): Promise<void> {
    const absolutePath = this.getAbsolutePathFromUrl(fileUrl);

    try {
      await fs.unlink(absolutePath);
    } catch (error: any) {
      // Se o arquivo já não existir, não precisamos travar a execução (idempotência)
      if (error.code === "ENOENT") {
        this.logger.warn(`Tentativa de deletar arquivo inexistente: ${absolutePath}`);
        return;
      }
      this.logger.error(`Erro ao deletar arquivo local: ${absolutePath}`, { error });
    }
  }
}
