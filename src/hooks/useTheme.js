import { useState, useEffect, useCallback } from 'react';

const THEME_STORAGE_KEY = 'imw_theme';

/**
 * Obtém o tema inicial baseado no localStorage ou preferência do sistema.
 */
function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';

  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  } catch {
    // Caso o localStorage esteja bloqueado
  }

  return 'dark';
}

/**
 * Aplica as configurações do tema no DOM e na meta tag theme-color.
 */
function applyThemeToDocument(theme) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme;

  // Atualiza meta tag theme-color se existir
  let metaTheme = document.querySelector('meta[name="theme-color"]');
  if (!metaTheme) {
    metaTheme = document.createElement('meta');
    metaTheme.name = 'theme-color';
    document.head.appendChild(metaTheme);
  }
  metaTheme.setAttribute('content', theme === 'light' ? '#f8fafc' : '#0a0e17');
}

/**
 * Hook para controle de tema Dark / Light
 */
export function useTheme() {
  const [theme, setThemeState] = useState(getInitialTheme);

  // Aplica o tema imediatamente ao montar e quando mudar
  useEffect(() => {
    applyThemeToDocument(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignora erro se localStorage inacessível
    }
  }, [theme]);

  // Sincroniza caso o tema seja alterado em outra aba ou via evento de storage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === THEME_STORAGE_KEY && (e.newValue === 'light' || e.newValue === 'dark')) {
        setThemeState(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      setThemeState(newTheme);
    }
  }, []);

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme
  };
}

export default useTheme;
