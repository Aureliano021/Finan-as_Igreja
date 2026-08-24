/**
 * Theme Service
 * Gerencia a alternância e persistência entre Dark Mode e Light Mode.
 */

const THEME_STORAGE_KEY = 'imw_theme';

export function getStoredTheme() {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem('igreja_theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  } catch {
    // Ignora falhas de localStorage
  }
  return 'dark'; // Dark mode padrão fintech IMW
}

export function applyTheme(theme) {
  if (typeof document === 'undefined') return theme;
  const targetTheme = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', targetTheme);
  document.documentElement.style.colorScheme = targetTheme;

  let metaTheme = document.querySelector('meta[name="theme-color"]');
  if (!metaTheme) {
    metaTheme = document.createElement('meta');
    metaTheme.name = 'theme-color';
    document.head.appendChild(metaTheme);
  }
  metaTheme.setAttribute('content', targetTheme === 'light' ? '#f8fafc' : '#0a0e17');

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

// Inicializa o tema imediatamente
if (typeof window !== 'undefined') {
  applyTheme(getStoredTheme());
}
