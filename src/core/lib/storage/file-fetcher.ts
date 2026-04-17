export interface FileFetcher {
  /**
   * Busca um arquivo pelo seu caminho/URL retornado pelo uploader.
   * @param filePathOrUrl O caminho relativo ou URL retornado pelo método upload.
   * @returns Uma Promise que resolve para o buffer do arquivo (conteúdo binário).
   */
  fetchFileBuffer(filePathOrUrl: string): Promise<Buffer | null>;

  /**
   * Busca um arquivo e retorna seu conteúdo como uma string Base64.
   * @param filePathOrUrl O caminho relativo ou URL retornado pelo método upload.
   * @returns Uma Promise que resolve para a string Base64 (sem o prefixo "data:image/...").
   */
  fetchFileAsBase64(filePathOrUrl: string): Promise<string | null>;
}
