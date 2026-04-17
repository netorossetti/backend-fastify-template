import { env } from "src/core/env";
import * as winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

export type LoggerLevel = "info" | "debug" | "warn" | "error";

const ALL_LOG_LEVELS: LoggerLevel[] = ["debug", "info", "warn", "error"] as const;

class Logger {
  private static instances: Record<string, Logger> = {};
  private logger: winston.Logger;
  private loggerLevel: LoggerLevel[];

  private constructor(contextName: string) {
    this.loggerLevel = this.getLoggerLevels();

    // 2. Definimos o formato base SEM colorização (para arquivos de log)
    this.logger = winston.createLogger({
      level: "debug",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
          const metaString = Object.keys(meta).length ? JSON.stringify(meta) : "";
          return `[${timestamp}] [${service}] ${level}: ${message} ${metaString}`;
        }),
      ),
      defaultMeta: { service: contextName },
      transports: this.getTransports(),
      exitOnError: false,
    });
  }

  private getLoggerLevels(): LoggerLevel[] {
    // Pega o nível configurado ou assume 'debug' como fallback para dev ou WARN oara produção
    const currentLevel = env.LOGGER_LEVEL ?? (env.NODE_ENV === "production" ? "warn" : "debug");
    const levelIndex = ALL_LOG_LEVELS.indexOf(currentLevel as any);
    return ALL_LOG_LEVELS.slice(levelIndex !== -1 ? levelIndex : 0);
  }

  private getTransports(): winston.transport[] {
    // Se for teste unitário, loga só no console e não cria arquivos
    if (env.NODE_ENV === "test") {
      return [new winston.transports.Console({ silent: true })];
    }

    const dirname = env.LOGGER_FOLDER || "temp/logs";
    const filename = `${env.LOGGER_FILENAME || "application"}-%DATE%.log`;

    const fileTransport = new DailyRotateFile({
      dirname,
      filename,
      datePattern: "YYYYMMDD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
          const metaString = Object.keys(meta).length ? JSON.stringify(meta) : "";
          return `[${timestamp}] [${service}] ${level}: ${message} ${metaString}`;
        }),
      ),
    });

    const transports: winston.transport[] = [fileTransport];

    if (env.NODE_ENV === "dev" || env.LOGGER_CONSOLE) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
              const metaString = Object.keys(meta).length ? JSON.stringify(meta) : "";
              return `[${timestamp}] [${service}] ${level}: ${message} ${metaString}`;
            }),
          ),
        }),
      );
    }

    return transports;
  }

  static getInstance(contextName: string = "Application"): Logger {
    if (!Logger.instances[contextName]) {
      Logger.instances[contextName] = new Logger(contextName);
    }
    return Logger.instances[contextName];
  }

  log(level: LoggerLevel, message: string, meta?: Record<string, unknown>): void {
    if (this.loggerLevel.includes(level)) {
      this.logger.log(level, message, meta);
    }
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.log("debug", message, meta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.log("info", message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.log("warn", message, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.log("error", message, meta);
  }
}

export default Logger;
