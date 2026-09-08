import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, LogIn, UserPlus, AlertCircle, WifiOff, RefreshCw, MessageCircle, Settings, CheckCircle2, Sun, Moon } from 'lucide-react';
import { getStoredUser, getUserStatus } from '../../services/auth';
import { checkApiHealth } from '../../services/api';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import StatusCard from './StatusCard';
import ApiConfigSheet from '../account/ApiConfigSheet';
import useTheme from '../../hooks/useTheme';

/**
 * LoginPage Component
 * Página de autenticação completa (Login / Registro / Restrições)
 * com verificação de status do servidor sob demanda.
 */
export default function LoginPage() {
  const { isDark, toggleTheme } = useTheme();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [accessRestriction, setAccessRestriction] = useState(null); // { status, message, user }
  const [errorMessage, setErrorMessage] = useState('');
  
  // Status do servidor backend (sistema sob demanda)
  const [serverStatus, setServerStatus] = useState('checking'); // 'checking' | 'online' | 'offline'
  const [isRetryingServer, setIsRetryingServer] = useState(false);
  const [isApiConfigOpen, setIsApiConfigOpen] = useState(false);

  const adminPhone = '5511999999999';

  // Verifica o status do servidor backend
  const checkServer = useCallback(async () => {
    try {
      const res = await checkApiHealth();
      setServerStatus(res.online ? 'online' : 'offline');
    } catch {
      setServerStatus('offline');
    }
  }, []);

  useEffect(() => {
    checkServer();
  }, [checkServer]);

  const handleRecheckServer = async () => {
    setIsRetryingServer(true);
    try {
      await checkServer();
    } finally {
      setTimeout(() => setIsRetryingServer(false), 500);
    }
  };

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

  const whatsappOnDemandMessage = encodeURIComponent(
    'Olá Administrador! Estou na tela de login do aplicativo Finanças IMW e o servidor está offline. Poderia ligar o servidor para que eu possa acessar?'
  );

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative',
      transition: 'var(--transition-theme)'
    }}>
      {/* Botão de Tema no Topo Direito */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 50 }}>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
          title={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
          className="btn-ghost"
          style={{
            padding: 8,
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--panel-line)',
            background: 'var(--panel)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-card)',
            transition: 'transform var(--transition-fast), background-color var(--transition-fast)'
          }}
        >
          {isDark ? (
            <Sun size={18} style={{ color: '#fbbf24' }} />
          ) : (
            <Moon size={18} style={{ color: '#6366f1' }} />
          )}
        </button>
      </div>

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
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
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

        {/* Condition 1: Restrição de Acesso */}
        {accessRestriction || isBlocked ? (
          <StatusCard
            status={accessRestriction?.status || userStatus}
            user={accessRestriction?.user || currentUser}
            message={accessRestriction?.message}
            onRetry={handleRecheckServer}
            onConfigureApi={() => setIsApiConfigOpen(true)}
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
        ) : serverStatus === 'offline' ? (
          /* Condition 3: Servidor Offline - Bloqueia inserção de dados e abas */
          <div className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-full)',
              background: 'var(--red-bg)',
              border: '1px solid var(--red-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 0 20px rgba(230, 57, 70, 0.15)'
            }}>
              <WifiOff size={26} className="text-red-glow" />
            </div>

            <div style={{
              display: 'inline-block',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              padding: '2px 8px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--red-bg)',
              color: 'var(--red-glow)',
              fontWeight: 700,
              letterSpacing: '0.05em',
              marginBottom: 8
            }}>
              SERVIDOR OFFLINE
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>
              Sistema Sob Demanda
            </h2>

            <p style={{
              fontSize: '0.85rem',
              color: 'var(--muted)',
              lineHeight: 1.5,
              marginBottom: 24,
              maxWidth: 360,
              marginInline: 'auto'
            }}>
              Por segurança contra acessos indevidos e economia, o servidor permanece desligado quando não está em uso. Peça ao administrador para ligá-lo antes de entrar.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a
                href={`https://wa.me/${adminPhone}?text=${whatsappOnDemandMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{
                  padding: '12px 18px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontWeight: 600
                }}
              >
                <MessageCircle size={17} />
                Pedir no WhatsApp para Ligar
              </a>

              <button
                type="button"
                onClick={() => {
                  handleRecheckServer();
                }}
                disabled={isRetryingServer}
                className="btn btn-panel"
                style={{
                  padding: '11px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontWeight: 600
                }}
              >
                <RefreshCw size={15} className={isRetryingServer ? 'animate-spin text-blue' : ''} />
                {isRetryingServer ? 'Verificando conexão…' : 'Recarregar / Testar Conexão'}
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 6,
                paddingTop: 12,
                borderTop: '1px solid var(--panel-line)'
              }}>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="btn btn-ghost"
                  style={{ fontSize: '0.78rem', padding: '6px 8px', color: 'var(--muted)' }}
                >
                  Recarregar página
                </button>

                <button
                  type="button"
                  onClick={() => setIsApiConfigOpen(true)}
                  className="btn btn-ghost"
                  style={{
                    fontSize: '0.78rem',
                    padding: '6px 8px',
                    color: 'var(--muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <Settings size={13} />
                  Configurar API
                </button>
              </div>
            </div>
          </div>
        ) : serverStatus === 'checking' ? (
          /* Condition 4: Verificando disponibilidade inicial */
          <div className="card" style={{ padding: '36px 20px', textAlign: 'center' }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-full)',
              background: 'var(--blue-bg)',
              border: '1px solid var(--blue-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <RefreshCw size={22} className="animate-spin text-blue-glow" />
            </div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 6 }}>
              Verificando Conexão
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
              Checando disponibilidade do servidor backend…
            </p>
          </div>
        ) : (
          /* Condition 5: Servidor Online - Formulário de Login / Cadastro liberado */
          <div className="card" style={{ padding: '24px 20px' }}>
            {/* Badge Servidor Online */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 12px',
              background: 'var(--bg)',
              border: '1px solid var(--panel-line)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 16,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.73rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={13} style={{ color: '#10b981' }} />
                <span style={{ color: 'var(--text)' }}>Servidor Online e Pronto</span>
              </div>
              <button
                type="button"
                onClick={() => setIsApiConfigOpen(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 4px',
                  fontSize: '0.72rem'
                }}
                title="Configurar servidor API"
              >
                <Settings size={12} />
                Config
              </button>
            </div>

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

        {/* Modal de Configuração de API */}
        <ApiConfigSheet
          isOpen={isApiConfigOpen}
          onClose={() => setIsApiConfigOpen(false)}
          onSuccess={() => {
            handleRecheckServer();
          }}
        />

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
    </div>
  );
}
