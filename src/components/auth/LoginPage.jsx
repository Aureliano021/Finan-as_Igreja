import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, LogIn, UserPlus, AlertCircle, Sun, Moon } from 'lucide-react';
import { getStoredUser, getUserStatus } from '../../services/auth';
import { getStoredTheme, toggleTheme } from '../../services/theme';
import { checkApiHealth } from '../../services/api';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import StatusCard from './StatusCard';
import ApiConfigSheet from '../account/ApiConfigSheet';

/**
 * LoginPage Component
 * Página de autenticação completa (Login / Registro / Restrições).
 */
export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [accessRestriction, setAccessRestriction] = useState(null); // { status, message, user }
  const [errorMessage, setErrorMessage] = useState('');
  const [theme, setTheme] = useState(() => getStoredTheme());
  const [isApiConfigOpen, setIsApiConfigOpen] = useState(false);

  // Verificação inicial rápida da saúde do servidor
  const checkHealth = useCallback(async () => {
    try {
      const health = await checkApiHealth();
      if (!health.online) {
        setAccessRestriction({
          status: 'offline',
          message: 'O servidor da aplicação está offline no momento. Entre em contato com o administrador para ligar o sistema.'
        });
      } else if (accessRestriction?.status === 'offline') {
        setAccessRestriction(null);
      }
    } catch {
      setAccessRestriction({
        status: 'offline',
        message: 'O servidor da aplicação está offline no momento. Entre em contato com o administrador para ligar o sistema.'
      });
    }
  }, [accessRestriction]);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  useEffect(() => {
    const handleThemeChange = (e) => {
      setTheme(e.detail || getStoredTheme());
    };
    window.addEventListener('theme-change', handleThemeChange);
    return () => window.removeEventListener('theme-change', handleThemeChange);
  }, []);

  // Se o usuário salvo tiver status pendente ou negado
  const userStatus = currentUser ? getUserStatus(currentUser) : null;
  const isBlocked = userStatus === 'pendente' || userStatus === 'negado';

  const handleAuthSuccess = () => {
    // Redireciona para o dashboard
    window.location.href = '/index.html';
  };

  const handleAccessRestricted = (restriction) => {
    setAccessRestriction(restriction);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setErrorMessage('');
  };

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative'
    }}>
      {/* Botão de Tema no Login */}
      <button
        onClick={() => {
          const next = toggleTheme();
          setTheme(next);
        }}
        type="button"
        aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
        title={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          padding: 8,
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--panel-line)',
          background: 'var(--panel)',
          color: 'var(--text)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          boxShadow: 'var(--shadow-card)'
        }}
      >
        {theme === 'light' ? <Moon size={18} className="text-blue-glow" /> : <Sun size={18} style={{ color: '#ffb703' }} />}
      </button>

      {/* Ticker / Top bar indicator */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: 'linear-gradient(90deg, var(--blue) 0%, var(--red) 100%)'
      }} />

      {/* Main Container */}
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Header / Brand Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-md)',
            background: 'var(--panel)',
            border: '1px solid var(--panel-line)',
            boxShadow: 'var(--shadow-card)',
            marginBottom: 12
          }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.25rem',
              background: 'linear-gradient(135deg, var(--blue-glow) 0%, var(--red-glow) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              IMW
            </span>
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>
            Finanças da Igreja
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', fontFamily: 'var(--font-body)' }}>
            Igreja Metodista Wesleyana • Prestação de Contas
          </p>
        </div>

        {/* Condition 1: Servidor Offline ou Restrição de Acesso */}
        {accessRestriction || isBlocked ? (
          <StatusCard
            status={accessRestriction?.status || userStatus}
            user={accessRestriction?.user || currentUser}
            message={accessRestriction?.message}
            onRetry={checkHealth}
            onOpenApiConfig={() => setIsApiConfigOpen(true)}
            onBackToLogin={() => {
              setAccessRestriction(null);
              setCurrentUser(null);
            }}
          />
        ) : currentUser && userStatus === 'aceito' ? (
          /* Condition 2: Já autenticado */
          <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-full)',
              background: 'var(--blue-bg)',
              border: '1px solid var(--blue-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px auto'
            }}>
              <ShieldCheck size={24} className="text-blue-glow" />
            </div>
            <h2 style={{ fontSize: '1.15rem', marginBottom: 6 }}>Sessão Ativa</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 20 }}>
              Você já está autenticado como <strong>{currentUser.nome || currentUser.email}</strong>.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href="/index.html" className="btn btn-primary">
                Acessar Painel Principal
              </a>
              <button
                type="button"
                onClick={() => {
                  setCurrentUser(null);
                  setAccessRestriction(null);
                }}
                className="btn btn-panel"
              >
                Trocar de Conta
              </button>
            </div>
          </div>
        ) : (
          /* Condition 3: Formulário de Login / Cadastro */
          <div className="card" style={{ padding: '24px 20px' }}>
            {/* Mode Switcher Tabs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: 'var(--bg)',
              border: '1px solid var(--panel-line)',
              borderRadius: 'var(--radius-sm)',
              padding: 3,
              marginBottom: 20
            }}>
              <button
                type="button"
                onClick={() => handleModeChange('login')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-xs)',
                  border: 'none',
                  background: mode === 'login' ? 'var(--panel)' : 'transparent',
                  color: mode === 'login' ? 'var(--text)' : 'var(--muted)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  fontWeight: mode === 'login' ? 600 : 500,
                  cursor: 'pointer',
                  boxShadow: mode === 'login' ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <LogIn size={15} />
                Entrar
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('register')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-xs)',
                  border: 'none',
                  background: mode === 'register' ? 'var(--panel)' : 'transparent',
                  color: mode === 'register' ? 'var(--text)' : 'var(--muted)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  fontWeight: mode === 'register' ? 600 : 500,
                  cursor: 'pointer',
                  boxShadow: mode === 'register' ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <UserPlus size={15} />
                Criar Conta
              </button>
            </div>

            {/* Error Message Box */}
            {errorMessage ? (
              <div style={{
                background: 'var(--red-bg)',
                border: '1px solid var(--red-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: 'var(--red-glow)',
                fontSize: '0.82rem'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            ) : null}

            {/* Form rendering based on active mode */}
            {mode === 'login' ? (
              <LoginForm
                onSuccess={handleAuthSuccess}
                onAccessRestricted={handleAccessRestricted}
                onError={setErrorMessage}
              />
            ) : (
              <RegisterForm
                onSuccess={handleAuthSuccess}
                onAccessRestricted={handleAccessRestricted}
                onError={setErrorMessage}
              />
            )}
          </div>
        )}

        {/* Footer info */}
        <p style={{
          textAlign: 'center',
          marginTop: 24,
          fontSize: '0.75rem',
          color: 'var(--text-dim)',
          fontFamily: 'var(--font-mono)'
        }}>
          Gestão Financeira Metodista Wesleyana
        </p>
      </div>

      <ApiConfigSheet
        isOpen={isApiConfigOpen}
        onClose={() => setIsApiConfigOpen(false)}
        onSuccess={() => {
          setIsApiConfigOpen(false);
          checkHealth();
        }}
      />
    </div>
  );
}
