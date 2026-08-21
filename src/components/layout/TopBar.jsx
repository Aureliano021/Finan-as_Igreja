import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Sun, Moon } from 'lucide-react';
import Avatar from '../shared/Avatar';
import { getStoredTheme, toggleTheme } from '../../services/theme';

/**
 * TopBar Component
 * Header minimalista e refinado com a identidade do projeto.
 */
export default function TopBar({
  title = 'Finanças IMW',
  subtitle = '',
  user = null,
  connectionStatus = 'online', // 'online' | 'offline' | 'pending'
  onRefresh = null,
  isRefreshing = false,
  onAvatarClick = null,
  backButton = null
}) {
  const [theme, setTheme] = useState(() => getStoredTheme());

  useEffect(() => {
    const handleThemeChange = (e) => {
      setTheme(e.detail || getStoredTheme());
    };
    window.addEventListener('theme-change', handleThemeChange);
    return () => window.removeEventListener('theme-change', handleThemeChange);
  }, []);

  const handleToggle = () => {
    const next = toggleTheme();
    setTheme(next);
  };
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
                boxShadow: connectionStatus === 'online' ? '0 0 8px var(--blue)' : '0 0 8px var(--red)'
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
        {/* Alternador de Tema */}
        <button
          onClick={handleToggle}
          type="button"
          aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
          title={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
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
          {theme === 'light' ? (
            <Moon size={17} className="text-blue-glow" />
          ) : (
            <Sun size={17} style={{ color: '#ffb703' }} />
          )}
        </button>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Atualizar dados"
            className="btn-ghost"
            style={{
              padding: 8,
              borderRadius: 'var(--radius-full)',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted)',
              display: 'flex'
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
