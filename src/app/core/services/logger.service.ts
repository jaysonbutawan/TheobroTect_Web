import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
  None = 4
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private logLevel: LogLevel = environment.production ? LogLevel.Error : LogLevel.Debug;

  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.Debug, message, args);
  }

  info(message: string, ...args: any[]): void {
    this.log(LogLevel.Info, message, args);
  }

  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.Warn, message, args);
  }

  error(message: string, ...args: any[]): void {
    this.log(LogLevel.Error, message, args);
  }

  private log(level: LogLevel, message: string, args: any[]): void {
    if (level < this.logLevel) {
      return;
    }

    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];

    switch (level) {
      case LogLevel.Debug:
        console.debug(`[${timestamp}] [DEBUG] ${message}`, ...args);
        break;
      case LogLevel.Info:
        console.info(`[${timestamp}] [INFO] ${message}`, ...args);
        break;
      case LogLevel.Warn:
        console.warn(`[${timestamp}] [WARN] ${message}`, ...args);
        break;
      case LogLevel.Error:
        console.error(`[${timestamp}] [ERROR] ${message}`, ...args);
        break;
    }
  }
}
