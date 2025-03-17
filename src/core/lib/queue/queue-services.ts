import Logger from "../logger/logger";

export class ProcessingQueue {
  private logger: Logger;
  private queue: {
    key: string;
    func: () => Promise<void>;
    reprocessCaseFailed: number;
  }[] = [];
  private processing: boolean = false;
  private runningProcessKey = "";
  private activeProcesses: number = 0;
  private runningProcessKeys: Set<string> = new Set(); // 🔥 Agora suporta múltiplos processos
  private maxConcurrency: number; // 🔥 Número máximo de processos simultâneos

  constructor(private name: string, maxConcurrency: number = 1) {
    this.logger = Logger.getInstance(this.name);
    this.maxConcurrency = maxConcurrency;
  }

  public push(
    key: string,
    func: () => Promise<void>,
    reprocessCaseFailed: number = 0
  ): void {
    this.queue.push({ key, func, reprocessCaseFailed });
    if (!this.processing) {
      this.processNext();
    }
  }

  public async processNext(): Promise<void> {
    while (
      this.queue.length > 0 &&
      this.activeProcesses < this.maxConcurrency
    ) {
      const nextQueueJob = this.queue.shift();
      if (!nextQueueJob) return;

      this.activeProcesses++;
      this.runningProcessKeys.add(nextQueueJob.key);

      this.logger.info(`▶️ Iniciando processo: ${nextQueueJob.key}`);

      try {
        await nextQueueJob.func();
        this.logger.info(`Processo concluído: ${nextQueueJob.key}`);
      } catch (error) {
        if (nextQueueJob.reprocessCaseFailed > 0) {
          this.logger.warn(`🔄 Reprocessando job: ${nextQueueJob.key}`);
          this.queue.push({
            ...nextQueueJob,
            reprocessCaseFailed: nextQueueJob.reprocessCaseFailed - 1,
          });
        } else {
          const message =
            error instanceof Error
              ? error.message
              : "Process queue job failure.";
          this.logger.error(`Erro no job ${nextQueueJob.key}: ${message}`, {
            error,
          });
        }
      }

      this.activeProcesses--;
      this.runningProcessKeys.delete(nextQueueJob.key);
      this.processNext(); // 🔥 Continua processando a fila imediatamente
    }
  }

  public getPlaceInQueue(key: string): number | null {
    const queueKeys = this.queue.reduce<string[]>((result, current) => {
      if (!result.includes(current.key)) result.push(current.key);
      return result;
    }, []);

    const idxPlaceInQueue = queueKeys.findIndex((q) => q === key);
    return idxPlaceInQueue >= 0 ? idxPlaceInQueue + 1 : null;
  }

  public getRunningProcessKey(): string[] {
    return Array.from(this.runningProcessKeys);
  }

  public isProcessing(): boolean {
    return this.processing;
  }
}

export default new ProcessingQueue("processing-queue");
