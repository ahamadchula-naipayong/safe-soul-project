'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type SiteTheme = 'dark' | 'light';

interface ThemeContextType {
  theme: SiteTheme;
  setTheme: (theme: SiteTheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const THEME_STORAGE_KEY = 'fitrah_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<SiteTheme>('dark');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as SiteTheme | null;
      const initial: SiteTheme = saved === 'light' ? 'light' : 'dark';
      setThemeState(initial);
      document.documentElement.dataset.theme = initial;
    } catch {
      document.documentElement.dataset.theme = 'dark';
    }
  }, []);

  const setTheme = (next: SiteTheme) => {
    setThemeState(next);
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = next;
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {}
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
