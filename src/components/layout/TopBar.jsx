import React from 'react';
import { ArrowLeft, RefreshCw, Sun, Moon } from 'lucide-react';
import Avatar from '../shared/Avatar';
import useTheme from '../../hooks/useTheme';

/**
 * TopBar Component
 * Header minimalista e refinado com a identidade do projeto e botão de alternância de tema.
 */
export default function TopBar({
  title = 'Finanças IMW',
  subtitle = '',
  user = null,
  connectionStatus = 'online', // 'online' | 'offline' | 'pending'
  onRefresh = null,
  isRefreshing = false,
  onAvatarClick = null,
  backButton = null,
  theme: customTheme = null,
  onToggleTheme = null,
  showThemeToggle = true
}) {
  const defaultThemeHook = useTheme();
  const theme = customTheme || defaultThemeHook.theme;
  const toggleTheme = onToggleTheme || defaultThemeHook.toggleTheme;
  const isDark = theme === 'dark';

  return (
    <header className="top-bar">
      <div className="top-bar-brand">
        {backButton && (
          <button
            onClick={backButton.onClick}
            aria-label="Voltar"
            className="btn-ghost"
            style={{
              padding: 6,
              marginRight: 4,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text)'
            }}
          >
            <ArrowLeft size={18} />
          </button>
        )}

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: connectionStatus === 'online' ? 'var(--blue)' : 'var(--red)',
                boxShadow: connectionStatus === 'online' ? '0 0 8px var(--blue)' : '0 0 8px var(--red)',
                transition: 'background-color 200ms ease, box-shadow 200ms ease'
              }}
            />
            <h1 className="top-bar-title">{title}</h1>
          </div>
          {subtitle && (
            <p style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="top-bar-actions">
        {showThemeToggle && (
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
            title={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
            className="btn-ghost"
            style={{
              padding: 8,
              borderRadius: 'var(--radius-full)',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform var(--transition-fast), color var(--transition-fast), background-color var(--transition-fast)'
            }}
          >
            {isDark ? (
              <Sun
                size={17}
                style={{
                  color: '#fbbf24',
                  transition: 'transform var(--transition-fast)'
                }}
              />
            ) : (
              <Moon
                size={17}
                style={{
                  color: '#6366f1',
                  transition: 'transform var(--transition-fast)'
                }}
              />
            )}
          </button>
        )}

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Atualizar dados"
            title="Atualizar dados"
            className="btn-ghost"
            style={{
              padding: 8,
              borderRadius: 'var(--radius-full)',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-blue' : ''} />
          </button>
        )}

        {user && (
          <Avatar
            name={user.nome || user.email}
            size="sm"
            status={connectionStatus === 'online' ? 'online' : 'offline'}
            onClick={onAvatarClick}
          />
        )}
      </div>
    </header>
  );
}
