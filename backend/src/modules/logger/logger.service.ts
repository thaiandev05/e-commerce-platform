import { LoggerService, LogLevel } from '@nestjs/common';
import { createLogger, format, Logger, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import chalk from 'chalk';

const customLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    verbose: 5,
  },
  colors: {
    fatal: 'red bold',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
    verbose: 'cyan',
  },
};

export class MyLogger implements LoggerService {
  private logger: Logger;

  constructor() {
    this.logger = createLogger({
      levels: customLevels.levels,
      level: 'debug',
      format: format.combine(
        format.timestamp({ format: `DD/MM/YYYY HH:mm:ss` }),
        format.errors({ stack: true }),
      ),
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize({ all: true }),
            format.printf(({ level, message, timestamp, context }) => {
              const strApp = chalk.green(`[NEST]`);
              const strContext = chalk.yellow(`[${context}]`);
              return `${strApp} - ${timestamp} ${level} ${strContext} ${message}`;
            }),
          ),
        }),
        new DailyRotateFile({
          dirname: 'log',
          filename: 'nest-log-%DATE%.log',
          datePattern: 'YYYY-MM-DD-HH',
          zippedArchive: false,
          maxSize: '20m',
          maxFiles: '14d',
          format: format.combine(format.timestamp(), format.json()),
        }),
      ],
    });
  }

  private wrap(
    level: keyof typeof customLevels.levels,
    message: string,
    context?: string,
  ) {
    this.logger.log(level, message, { context });
  }

  log(message: string, context: string) {
    this.wrap('info', message, context);
  }
  error(message: string, context: string) {
    this.wrap('error', message, context);
  }
  warn(message: string, context: string) {
    this.wrap('warn', message, context);
  }
  debug?(message: string, context: string) {
    this.wrap('debug', message, context);
  }
  verbose?(message: string, context: string) {
    this.wrap('verbose', message, context);
  }
  fatal?(message: string, context: string) {
    this.wrap('fatal', message, context);
  }
  setLogLevels?(levels: LogLevel[]) {}
}
