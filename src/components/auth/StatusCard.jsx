import React, { useState } from 'react';
import { Clock, ShieldAlert, WifiOff, MessageCircle, Copy, Check, RefreshCw, LogOut, Server } from 'lucide-react';
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
  onOpenApiConfig = null,
  onBackToLogin = null
}) {
  const [copied, setCopied] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const adminEmail = 'admin@igreja.org.br';
  const adminPhone = '5511999999999';

  const isDenied = status === 'denied' || status === 'negado';
  const isOffline = status === 'offline';

  const defaultMessage = isOffline
    ? 'O servidor da aplicação está offline no momento. Entre em contato com o administrador para ligar o sistema.'
    : isDenied
    ? 'Seu acesso ao sistema foi restrito pelo administrador da congregação.'
    : 'Seu cadastro foi realizado com sucesso e está aguardando a liberação de acesso pelo administrador.';

  const displayMessage = message || defaultMessage;

  const whatsappMessage = encodeURIComponent(
    isOffline
      ? 'Olá! Estou tentando acessar o aplicativo de Finanças da Igreja Metodista Wesleyana, mas o servidor está offline. Poderia ligar o sistema, por favor?'
      : `Olá Administrador, solicito a liberação de acesso para a minha conta (${user?.nome || user?.email || 'Novo Usuário'}) no app Finanças IMW.`
  );

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(adminEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignora erro de clipboard
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
      window.location.href = '/login.html';
    }
  };

  return (
    <div className="card" style={{ maxWidth: 480, margin: '32px auto', padding: '32px 22px', textAlign: 'center', boxShadow: 'var(--shadow-modal)' }}>
      {/* Icon Badge com animação de pulso se offline */}
      <div style={{
        width: 60,
        height: 60,
        borderRadius: 'var(--radius-full)',
        background: isDenied ? 'var(--red-bg)' : isOffline ? 'var(--red-bg)' : 'var(--blue-bg)',
        border: `1px solid ${isDenied || isOffline ? 'var(--red-border)' : 'var(--blue-border)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 18px auto',
        position: 'relative'
      }}>
        {isOffline && (
          <span style={{
            position: 'absolute',
            inset: -4,
            borderRadius: 'var(--radius-full)',
            border: '2px solid var(--red)',
            opacity: 0.4,
            animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
          }} />
        )}

        {isDenied ? (
          <ShieldAlert size={28} className="text-red-glow" />
        ) : isOffline ? (
          <WifiOff size={28} className="text-red-glow" />
        ) : (
          <Clock size={28} className="text-blue-glow" />
        )}
      </div>

      {/* Título Principal */}
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 10, color: 'var(--text)' }}>
        {isDenied ? 'Acesso Restrito' : isOffline ? 'Servidor Offline' : 'Aguardando Aprovação'}
      </h2>

      {/* Mensagem Explicativa */}
      <div style={{
        background: isOffline ? 'var(--red-bg)' : 'var(--bg)',
        border: `1px solid ${isOffline ? 'var(--red-border)' : 'var(--panel-line)'}`,
        borderRadius: 'var(--radius-sm)',
        padding: '14px 16px',
        marginBottom: 20,
        textAlign: 'left'
      }}>
        <p style={{
          fontSize: '0.88rem',
          color: isOffline ? 'var(--text)' : 'var(--muted)',
          lineHeight: 1.5,
          fontWeight: isOffline ? 600 : 400,
          margin: 0
        }}>
          {displayMessage}
        </p>
      </div>

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
          <span style={{ color: 'var(--muted)' }}>Usuário:</span>
          <span style={{ color: 'var(--text)', fontWeight: 600 }}>{user.nome || user.email}</span>
        </div>
      ) : null}

      {/* Ações de Contato e Resolução */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <a
          href={`https://wa.me/${adminPhone}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-block"
          style={{ textDecoration: 'none', justifyContent: 'center' }}
        >
          <MessageCircle size={18} />
          Falar com o Administrador no WhatsApp
        </a>

        <button
          type="button"
          onClick={handleCopyEmail}
          className="btn btn-panel btn-block"
          style={{ justifyContent: 'center' }}
        >
          {copied ? <Check size={16} className="text-blue-glow" /> : <Copy size={16} />}
          {copied ? 'E-mail copiado para a área de transferência!' : `Copiar e-mail: ${adminEmail}`}
        </button>

        {onRetry ? (
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="btn btn-panel btn-block"
            style={{ justifyContent: 'center', marginTop: 4 }}
          >
            <RefreshCw size={15} className={isRetrying ? 'animate-spin text-blue' : ''} />
            {isRetrying ? 'Testando conexão com o servidor…' : 'Tentar reconectar'}
          </button>
        ) : null}

        {onOpenApiConfig ? (
          <button
            type="button"
            onClick={onOpenApiConfig}
            className="btn-ghost"
            style={{ color: 'var(--blue-glow)', fontSize: '0.8rem', padding: '6px 0', border: 'none', cursor: 'pointer' }}
          >
            <Server size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            Configurar Endereço da API
          </button>
        ) : null}

        <button
          type="button"
          onClick={handleLogout}
          className="btn-ghost"
          style={{ color: 'var(--muted)', fontSize: '0.8rem', padding: '6px 0', border: 'none', cursor: 'pointer', marginTop: 4 }}
        >
          <LogOut size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
          Encerrar sessão / Trocar de conta
        </button>
      </div>
    </div>
  );
}
