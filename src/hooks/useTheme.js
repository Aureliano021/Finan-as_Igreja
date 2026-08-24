import { useState, useEffect, useCallback } from 'react';
import { getStoredTheme, applyTheme, toggleTheme as serviceToggleTheme } from '../services/theme';

/**
 * Hook customizado para alternar e ouvir mudanças de tema Dark / Light.
 */
export function useTheme() {
  const [theme, setThemeState] = useState(getStoredTheme);

  useEffect(() => {
    const handleThemeChange = (e) => {
      const newTheme = e.detail || getStoredTheme();
      setThemeState(newTheme);
    };

    const handleStorageChange = (e) => {
      if (e.key === 'imw_theme' || e.key === 'igreja_theme') {
        if (e.newValue === 'light' || e.newValue === 'dark') {
          setThemeState(e.newValue);
        }
      }
    };

    window.addEventListener('theme-change', handleThemeChange);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('theme-change', handleThemeChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const toggle = useCallback(() => {
    const next = serviceToggleTheme();
    setThemeState(next);
  }, []);

  const set = useCallback((newTheme) => {
    const applied = applyTheme(newTheme);
    setThemeState(applied);
  }, []);

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme: toggle,
    setTheme: set
  };
}

export default useTheme;
