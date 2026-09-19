import { LoggerService } from '../logger/LoggerService';

export class StorageService {
  private static getStorage(type: 'local' | 'session'): Storage {
    return type === 'local' ? window.localStorage : window.sessionStorage;
  }

  static get<T>(key: string, type: 'local' | 'session' = 'local'): T | null {
    try {
      const storage = this.getStorage(type);
      const item = storage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      LoggerService.error(`Failed to parse item from ${type} storage: ${key}`, error);
      return null;
    }
  }

  static set<T>(key: string, value: T, type: 'local' | 'session' = 'local'): void {
    try {
      const storage = this.getStorage(type);
      storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      LoggerService.error(`Failed to set item in ${type} storage: ${key}`, error);
    }
  }

  static remove(key: string, type: 'local' | 'session' = 'local'): void {
    try {
      const storage = this.getStorage(type);
      storage.removeItem(key);
    } catch (error) {
      LoggerService.error(`Failed to remove item from ${type} storage: ${key}`, error);
    }
  }

  static clear(type: 'local' | 'session' = 'local'): void {
    try {
      const storage = this.getStorage(type);
      storage.clear();
    } catch (error) {
      LoggerService.error(`Failed to clear ${type} storage`, error);
    }
  }
}
