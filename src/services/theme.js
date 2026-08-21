/**
 * Theme Service
 * Gerencia a alternância e persistência entre Dark Mode e Light Mode.
 */

const THEME_STORAGE_KEY = 'igreja_theme';

export function getStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // Ignora falhas de localStorage
  }
  return 'dark'; // Dark mode padrão fintech IMW
}

export function applyTheme(theme) {
  const targetTheme = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', targetTheme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, targetTheme);
    window.dispatchEvent(new CustomEvent('theme-change', { detail: targetTheme }));
  } catch {
    // Ignora
  }
  return targetTheme;
}

export function toggleTheme() {
  const current = getStoredTheme();
  const next = current === 'light' ? 'dark' : 'light';
  return applyTheme(next);
}

// Inicializa o tema imediatamente ao carregar o script
applyTheme(getStoredTheme());
