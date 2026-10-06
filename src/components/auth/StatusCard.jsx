import React, { useState } from 'react';
import { Clock, ShieldAlert, WifiOff, MessageSquare, RefreshCw, LogOut, Server } from 'lucide-react';
import { logout } from '../../services/auth';

/**
 * StatusCard Component
 * Exibido quando o servidor está offline, acesso pendente de aprovação ou acesso negado.
 */
export default function StatusCard({
  status = 'pending', // 'pending' | 'denied' | 'offline'
  user = null,
  message = '',
  onRetry = null,
  onBackToLogin = null,
  onConfigureApi = null,
  onOpenApiConfig = null
}) {
  const [isRetrying, setIsRetrying] = useState(false);

  const isDenied = status === 'denied' || status === 'negado';
  const isOffline = status === 'offline';
  const handleConfigApi = onConfigureApi || onOpenApiConfig;

  const defaultMessage = isOffline
    ? 'O servidor backend está desligado (sistema sob demanda). Solicite ao administrador a inicialização do serviço para continuar utilizando o aplicativo.'
    : isDenied
    ? 'Seu acesso ao sistema foi restrito pelo administrador da congregação.'
    : 'Seu cadastro foi realizado com sucesso e está aguardando a liberação de acesso pelo administrador.';

  const displayMessage = message || defaultMessage;

  const handleRetry = async () => {
    if (!onRetry) {
      window.location.reload();
      return;
    }
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setTimeout(() => setIsRetrying(false), 600);
    }
  };

  const handleLogout = () => {
    logout();
    if (onBackToLogin) {
      onBackToLogin();
    } else {
      window.location.href = '/login.html';
    }
  };

  return (
    <div className="card" style={{ maxWidth: 480, margin: '24px auto', padding: '32px 24px', textAlign: 'center' }}>
      {/* Icon Badge */}
      <div style={{
        width: 56,
        height: 56,
        borderRadius: 'var(--radius-full)',
        background: isDenied || isOffline ? 'var(--red-bg)' : 'var(--blue-bg)',
        border: `1px solid ${isDenied || isOffline ? 'var(--red-border)' : 'var(--blue-border)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px auto',
        boxShadow: isOffline ? '0 0 20px rgba(230, 57, 70, 0.15)' : 'none'
      }}>
        {isDenied ? (
          <ShieldAlert size={28} className="text-red-glow" />
        ) : isOffline ? (
          <WifiOff size={28} className="text-red-glow" />
        ) : (
          <Clock size={28} className="text-blue-glow" />
        )}
      </div>

      {isOffline && (
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
      )}

      {/* Header */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>
        {isDenied ? 'Acesso Restrito' : isOffline ? 'Sistema Sob Demanda' : 'Aguardando Aprovação'}
      </h2>

      <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: 24, lineHeight: 1.5, maxWidth: 380, marginInline: 'auto' }}>
        {displayMessage}
      </p>

      {/* Informações da Conta (se logado) */}
      {user ? (
        <div style={{
          background: 'var(--bg)',
          border: '1px solid var(--panel-line)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 14px',
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem'
        }}>
          <span style={{ color: 'var(--muted)' }}>Usuário conectado:</span>
          <span style={{ color: 'var(--text)', fontWeight: 600 }}>{user.nome || user.email}</span>
        </div>
      ) : null}

      {/* Card de Orientação e Segurança */}
      <div style={{
        background: isOffline ? 'rgba(230, 57, 70, 0.05)' : 'rgba(47, 111, 237, 0.06)',
        border: `1px solid ${isOffline ? 'rgba(230, 57, 70, 0.2)' : 'rgba(47, 111, 237, 0.2)'}`,
        borderRadius: 'var(--radius-sm)',
        padding: '14px 16px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        textAlign: 'left',
        lineHeight: 1.45
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 'var(--radius-full)',
          background: isOffline ? 'var(--red-bg)' : 'var(--blue-bg)',
          border: `1px solid ${isOffline ? 'var(--red-border)' : 'var(--blue-border)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {isOffline ? (
            <WifiOff size={18} className="text-red-glow" />
          ) : (
            <Clock size={18} className="text-blue-glow" />
          )}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)', marginBottom: 2 }}>
            {isOffline ? 'Servidor em Repouso' : 'Liberação de Acesso'}
          </div>
          <div style={{ color: 'var(--muted)', fontSize: '0.79rem' }}>
            {isOffline
              ? 'Por economia e segurança, o servidor fica desligado quando não está em uso. Peça ao Aureliano pelo WhatsApp para ligá-lo.'
              : 'Para proteger as finanças da congregação, a aprovação é individual. Avise o Aureliano pelo WhatsApp para ativar sua conta.'}
          </div>
        </div>
      </div>

      {/* Ações de Resolução */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          type="button"
          onClick={handleRetry}
          disabled={isRetrying}
          className="btn btn-primary"
          style={{
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontWeight: 600
          }}
        >
          <RefreshCw size={16} className={isRetrying ? 'animate-spin' : ''} />
          {isRetrying
            ? 'Verificando…'
            : isOffline
            ? 'Já ligou? Testar Conexão'
            : 'Já foi aprovado? Atualizar Agora'}
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 6,
          paddingTop: 12,
          borderTop: '1px solid var(--panel-line)'
        }}>
          {handleConfigApi ? (
            <button
              type="button"
              onClick={handleConfigApi}
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
              <Server size={13} />
              Configurar API
            </button>
          ) : (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn btn-ghost"
              style={{ fontSize: '0.78rem', padding: '6px 8px', color: 'var(--muted)' }}
            >
              Recarregar página
            </button>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-ghost"
            style={{ color: 'var(--muted)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <LogOut size={13} />
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
}
