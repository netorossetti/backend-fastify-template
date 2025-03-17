import { env } from "@core/env";
import * as winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

export type LoggerLevel = "info" | "debug" | "warn" | "error";

class Logger {
  private static instances: Record<string, Logger> = {};
  private logger: winston.Logger;
  private loggerLevel: LoggerLevel[];

  private constructor(contextName: string) {
    this.loggerLevel = this.getLoggerLevels();

    this.logger = winston.createLogger({
      level: "debug",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(
          ({ timestamp, level, message, service, ...meta }) => {
            const metaString = Object.keys(meta).length
              ? JSON.stringify(meta)
              : "";
            return `[${timestamp}] [${service}] ${level}: ${message} ${metaString}`;
          }
        )
      ),
      defaultMeta: { service: contextName },
      transports: this.getTransports(),
      exitOnError: false,
    });
  }

  private getLoggerLevels(): LoggerLevel[] {
    return env.NODE_ENV === "production"
      ? ["warn", "error"]
      : ["info", "debug", "warn", "error"];
  }

  private getTransports(): winston.transport[] {
    const dirname = env.LOGGER_FOLDER || "logs";
    const filename = `${env.LOGGER_FILENAME || "application"}-%DATE%.log`;

    const dailyRotateFileTransport = new DailyRotateFile({
      dirname,
      filename,
      datePattern: "YYYYMMDD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    });

    const transports: winston.transport[] = [dailyRotateFileTransport];

    if (env.NODE_ENV === "dev") {
      transports.push(new winston.transports.Console());
    }

    return transports;
  }

  static getInstance(contextName: string = "Application"): Logger {
    if (!Logger.instances[contextName]) {
      Logger.instances[contextName] = new Logger(contextName);
    }
    return Logger.instances[contextName];
  }

  log(
    level: LoggerLevel,
    message: string,
    meta?: Record<string, unknown>
  ): void {
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
