export class LoggerService {
  private static isDevelopment = import.meta.env.MODE === 'development';

  static info(message: string, ...optionalParams: any[]) {
    if (LoggerService.isDevelopment) {
      console.info(`[INFO]: ${message}`, ...optionalParams);
    }
  }

  static warn(message: string, ...optionalParams: any[]) {
    if (LoggerService.isDevelopment) {
      console.warn(`[WARN]: ${message}`, ...optionalParams);
    }
  }

  static error(message: string, ...optionalParams: any[]) {
    // We may want to send errors to an external service in production, 
    // so we don't restrict this to development only.
    console.error(`[ERROR]: ${message}`, ...optionalParams);
  }

  static debug(message: string, ...optionalParams: any[]) {
    if (LoggerService.isDevelopment) {
      console.debug(`[DEBUG]: ${message}`, ...optionalParams);
    }
  }
}
