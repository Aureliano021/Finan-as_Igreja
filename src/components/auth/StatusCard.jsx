import React, { useState } from 'react';
import { Clock, ShieldAlert, WifiOff, MessageCircle, Copy, Check, RefreshCw, LogOut } from 'lucide-react';
import { logout } from '../../services/auth';

/**
 * StatusCard Component
 * Exibido quando o usuário está pendente de aprovação, teve acesso negado ou o servidor está offline.
 */
export default function StatusCard({
  status = 'pending', // 'pending' | 'denied' | 'offline'
  user = null,
  message = '',
  onRetry = null,
  onBackToLogin = null,
  onConfigureApi = null
}) {
  const [copied, setCopied] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const adminEmail = 'admin@igreja.org.br';
  const adminPhone = '5511999999999';

  const isDenied = status === 'denied' || status === 'negado';
  const isOffline = status === 'offline';
  const isPending = !isDenied && !isOffline;

  const defaultMessage = isOffline
    ? 'O servidor backend está desligado (sistema sob demanda). Solicite ao administrador a inicialização do serviço para continuar utilizando o aplicativo.'
    : isDenied
    ? 'Seu acesso ao sistema foi restrito pelo administrador da congregação.'
    : 'Seu cadastro foi realizado com sucesso e está aguardando a liberação de acesso pelo administrador.';

  const displayMessage = message || defaultMessage;

  const whatsappMessage = encodeURIComponent(
    isOffline
      ? `Olá Administrador, estou no app Finanças IMW e o servidor backend está offline. Poderia ligá-lo, por favor?`
      : `Olá Administrador, solicito a liberação de acesso para a conta (${user?.nome || user?.email || 'Novo Usuário'}) no app Finanças IMW.`
  );

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(adminEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently handle clipboard errors
    }
  };

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

      {/* User Info Tag (if provided) */}
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

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <a
          href={`https://wa.me/${adminPhone}?text=${whatsappMessage}`}
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
          {isOffline ? 'Pedir no WhatsApp para Ligar' : 'Falar com Administrador (WhatsApp)'}
        </a>

        <button
          type="button"
          onClick={handleRetry}
          disabled={isRetrying}
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
          <RefreshCw size={15} className={isRetrying ? 'animate-spin text-blue' : ''} />
          {isRetrying ? 'Verificando conexão…' : 'Recarregar / Testar Conexão'}
        </button>

        {!isOffline && (
          <button
            type="button"
            onClick={handleCopyEmail}
            className="btn btn-ghost"
          >
            {copied ? <Check size={16} className="text-blue-glow" /> : <Copy size={16} />}
            {copied ? 'E-mail copiado!' : `Copiar e-mail: ${adminEmail}`}
          </button>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 6,
          paddingTop: 12,
          borderTop: '1px solid var(--panel-line)'
        }}>
          {onConfigureApi ? (
            <button
              type="button"
              onClick={onConfigureApi}
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
