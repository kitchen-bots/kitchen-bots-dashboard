import { eventBus } from '../events/EventBus';
import { StorageService } from '../storage/StorageService';

export type ThemeType = 'light' | 'dark' | 'system';

export class ThemeService {
  private static THEME_KEY = 'kb_theme_preference';

  static getTheme(): ThemeType {
    const storedTheme = StorageService.get<ThemeType>(this.THEME_KEY);
    return storedTheme || 'system';
  }

  static setTheme(theme: ThemeType): void {
    StorageService.set(this.THEME_KEY, theme);
    this.applyTheme(theme);
    eventBus.publish('ThemeChanged', { theme });
  }

  static applyTheme(theme: ThemeType): void {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }

  static initialize(): void {
    const currentTheme = this.getTheme();
    this.applyTheme(currentTheme);

    // Listen for system theme changes if we are on system theme
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (this.getTheme() === 'system') {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(e.matches ? 'dark' : 'light');
      }
    });
  }
}
