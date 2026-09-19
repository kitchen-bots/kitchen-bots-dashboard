import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import { ThemeType } from '../services/theme/ThemeService';
import { usePlatform } from './PlatformContext';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme: ThemeService, events } = usePlatform();
  const [theme, setThemeState] = useState<ThemeType>(() => ThemeService.getTheme());

  useEffect(() => {
    // Initialize ThemeService logic (like system theme media query listener)
    ThemeService.initialize();

    const unsubscribe = events.subscribe('ThemeChanged', (payload) => {
      setThemeState(payload.theme);
    });

    return () => {
      unsubscribe();
    };
  }, [ThemeService, events]);

  const setTheme = useCallback((newTheme: ThemeType) => {
    ThemeService.setTheme(newTheme);
  }, [ThemeService]);

  const contextValue = useMemo(() => ({
    theme,
    setTheme
  }), [theme, setTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
