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
  onBackToLogin = null
}) {
  const [copied, setCopied] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const adminEmail = 'admin@igreja.org.br';
  const adminPhone = '5511999999999';

  const isDenied = status === 'denied' || status === 'negado';
  const isOffline = status === 'offline';
  const isPending = !isDenied && !isOffline;

  const defaultMessage = isOffline
    ? 'O servidor backend está offline no momento. Solicite ao administrador a inicialização do serviço.'
    : isDenied
    ? 'Seu acesso ao sistema foi restrito pelo administrador da congregação.'
    : 'Seu cadastro foi realizado com sucesso e está aguardando a liberação de acesso pelo administrador.';

  const displayMessage = message || defaultMessage;

  const whatsappMessage = encodeURIComponent(
    isOffline
      ? `Olá Administrador, estou acessando o app Finanças IMW e o servidor backend está offline. Poderia ativá-lo?`
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
    if (!onRetry) return;
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
      window.location.reload();
    }
  };

  return (
    <div className="card" style={{ maxWidth: 480, margin: '24px auto', padding: '28px 20px', textAlign: 'center' }}>
      {/* Icon Badge */}
      <div style={{
        width: 54,
        height: 54,
        borderRadius: 'var(--radius-full)',
        background: isDenied ? 'var(--red-bg)' : isOffline ? 'rgba(230, 57, 70, 0.12)' : 'var(--blue-bg)',
        border: `1px solid ${isDenied || isOffline ? 'var(--red-border)' : 'var(--blue-border)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px auto'
      }}>
        {isDenied ? (
          <ShieldAlert size={26} className="text-red-glow" />
        ) : isOffline ? (
          <WifiOff size={26} className="text-red-glow" />
        ) : (
          <Clock size={26} className="text-blue-glow" />
        )}
      </div>

      {/* Header */}
      <h2 style={{ fontSize: '1.25rem', marginBottom: 8 }}>
        {isDenied ? 'Acesso Restrito' : isOffline ? 'Servidor Offline' : 'Aguardando Aprovação'}
      </h2>

      <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: 24, lineHeight: 1.5 }}>
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
          <span style={{ color: 'var(--muted)' }}>Usuário:</span>
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
          style={{ textDecoration: 'none' }}
        >
          <MessageCircle size={17} />
          Falar com Administrador (WhatsApp)
        </a>

        <button
          type="button"
          onClick={handleCopyEmail}
          className="btn btn-panel"
        >
          {copied ? <Check size={16} className="text-blue-glow" /> : <Copy size={16} />}
          {copied ? 'E-mail copiado!' : `Copiar e-mail: ${adminEmail}`}
        </button>

        {onRetry ? (
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="btn btn-ghost"
            style={{ marginTop: 4 }}
          >
            <RefreshCw size={15} className={isRetrying ? 'animate-spin text-blue' : ''} />
            {isRetrying ? 'Verificando status…' : 'Verificar novamente'}
          </button>
        ) : null}

        <button
          type="button"
          onClick={handleLogout}
          className="btn btn-ghost"
          style={{ color: 'var(--muted)', fontSize: '0.8rem' }}
        >
          <LogOut size={14} />
          Sair desta conta
        </button>
      </div>
    </div>
  );
}
