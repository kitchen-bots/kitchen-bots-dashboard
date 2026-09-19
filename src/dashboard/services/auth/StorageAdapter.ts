export interface SessionStorageAdapter {
  getToken(): string | null;
  setToken(token: string): void;
  removeToken(): void;
  
  getUserData(): any | null;
  setUserData(data: any): void;
  removeUserData(): void;
  
  clear(): void;
}

export class LocalStorageAdapter implements SessionStorageAdapter {
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  getToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch {
      return null;
    }
  }

  setToken(token: string): void {
    try {
      localStorage.setItem(this.tokenKey, token);
    } catch (e) {
      console.warn('Failed to save auth token', e);
    }
  }

  removeToken(): void {
    try {
      localStorage.removeItem(this.tokenKey);
    } catch {
      // Ignore
    }
  }

  getUserData(): any | null {
    try {
      const data = localStorage.getItem(this.userKey);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  setUserData(data: any): void {
    try {
      localStorage.setItem(this.userKey, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save user data', e);
    }
  }

  removeUserData(): void {
    try {
      localStorage.removeItem(this.userKey);
    } catch {
      // Ignore
    }
  }

  clear(): void {
    this.removeToken();
    this.removeUserData();
  }
}
