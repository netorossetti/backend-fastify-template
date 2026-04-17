// test/repositories/in-memory-uploader.ts
import { FileDeleter } from "src/core/lib/storage/file-deleter";
import { FileFetcher } from "src/core/lib/storage/file-fetcher";
import { FileUploader, UploadParams } from "src/core/lib/storage/file-uploader";

export class FakerStorage implements FileUploader, FileDeleter, FileFetcher {
  uploaded: UploadParams[] = [];

  async upload(params: UploadParams): Promise<string> {
    this.uploaded.push(params);
    return `/uploads/${params.folder ?? "default"}/${params.fileName}`;
  }

  // Implementação para retornar o conteúdo binário (Buffer)
  async fetchFileBuffer(filePathOrUrl: string): Promise<Buffer | null> {
    // Em um ambiente de teste, o "filePathOrUrl" é o caminho retornado pelo método upload()

    // Tentamos encontrar o arquivo armazenado na memória
    const foundUpload = this.uploaded.find((params) => filePathOrUrl.includes(params.fileName));

    if (!foundUpload) {
      // Se o teste passar um URL que não está na lista, lançamos um erro
      return null;
    }

    // Retornamos o buffer original que foi "salvo"
    return foundUpload.buffer;
  }

  // Implementação para retornar o conteúdo em Base64
  async fetchFileAsBase64(filePathOrUrl: string): Promise<string | null> {
    // Reutilizamos o método acima para obter o buffer
    const buffer = await this.fetchFileBuffer(filePathOrUrl);

    // Convertemos o buffer para Base64 (simulando o comportamento real)
    return !buffer ? null : buffer.toString("base64");
  }

  async delete(fileUrl: string): Promise<void> {
    // Encontra o índice do arquivo simulado que contém o nome presente na URL
    const index = this.uploaded.findIndex((params) => fileUrl.includes(params.fileName));

    if (index === -1) {
      // Opcional: dependendo da sua regra de negócio, deletar algo
      // que não existe pode lançar erro ou apenas retornar silenciosamente.
      throw new Error(`Tentativa de deletar arquivo inexistente: ${fileUrl}`);
    }

    // Remove do array "em memória"
    this.uploaded.splice(index, 1);
  }
}
