export interface UploadParams {
  fileName: string;
  buffer: Buffer;
  mimeType: string;
  folder?: string; // opcional: pode ser "avatars"
}

export interface Uploader {
  upload(params: UploadParams): Promise<string>; // retorna a URL do arquivo
}
