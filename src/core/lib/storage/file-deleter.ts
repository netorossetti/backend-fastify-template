export interface FileDeleter {
  delete(fileUrl: string): Promise<void>;
}
