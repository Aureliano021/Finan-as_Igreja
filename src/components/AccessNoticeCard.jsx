import React, { useState } from 'react';
import { Clock, ShieldAlert, ShieldCheck, MessageCircle, Mail, RefreshCw, LogOut, Copy, Check, ArrowLeft } from 'lucide-react';
import { logout } from '../services/auth';

/**
 * AccessNoticeCard Component
 * Displays a notice screen when user status is 'pendente' or 'negado',
 * or when API endpoints return 403 Forbidden.
 */
export default function AccessNoticeCard({ status = 'pendente', user = null, onRefreshData = null, onBackToLogin = null, message = '' }) {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isDenied = status === 'negado';
  const isOffline = status === 'offline';

  // Configurable contact info for church admin (or defaults)
  const adminEmail = 'admin@igreja.org.br';
  const adminPhone = '5511999999999'; // International format without +
  const whatsappMessage = encodeURIComponent(
    isOffline
      ? `Olá Administrador, estou acessando o sistema de Gestão Financeira da Igreja. Poderia, por favor, ligar o servidor backend para liberar o meu acesso aos dados?`
      : `Olá Administrador, solicito a liberação de acesso para a conta (${user?.nome || user?.email || 'Novo Usuário'}) no sistema de Gestão Financeira da Igreja.`
  );

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(adminEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Erro ao copiar email:', e);
    }
  };

  const handleRefresh = async () => {
    if (onRefreshData) {
      setIsRefreshing(true);
      await onRefreshData();
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  return (
    <div style={{
      maxWidth: '620px',
      margin: '40px auto',
      padding: '36px 32px',
      background: 'rgba(255, 255, 255, 0.92)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderRadius: '28px',
      border: isDenied 
        ? '1px solid rgba(239, 68, 68, 0.35)' 
        : isOffline
        ? '1px solid rgba(239, 68, 68, 0.35)'
        : '1px solid rgba(245, 158, 11, 0.35)',
      boxShadow: isDenied || isOffline
        ? '0 20px 50px -10px rgba(239, 68, 68, 0.15), 0 0 0 1px rgba(239, 68, 68, 0.1)'
        : '0 20px 50px -10px rgba(245, 158, 11, 0.15), 0 0 0 1px rgba(245, 158, 11, 0.1)',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Ambient Glow */}
      <div 
        aria-hidden="true" 
        style={{
          position: 'absolute',
          top: '-40%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '300px',
          height: '300px',
          background: isDenied || isOffline
            ? 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, rgba(255, 255, 255, 0) 70%)'
            : 'radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, rgba(255, 255, 255, 0) 70%)',
          pointerEvents: 'none',
          borderRadius: '50%'
        }} 
      />

      {/* Main Status Badge / Icon */}
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: isDenied || isOffline ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.12)',
        color: isDenied || isOffline ? '#dc2626' : '#d97706',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px auto',
        boxShadow: isDenied || isOffline
          ? '0 8px 24px -4px rgba(239, 68, 68, 0.25)'
          : '0 8px 24px -4px rgba(245, 158, 11, 0.25)'
      }}>
        {isDenied || isOffline ? <ShieldAlert size={32} /> : <Clock size={32} />}
      </div>

      {/* Status Pill Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 14px',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 800,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        marginBottom: '16px',
        background: isDenied || isOffline ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.14)',
        color: isDenied || isOffline ? '#b91c1c' : '#b45309',
        border: isDenied || isOffline ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(245, 158, 11, 0.25)'
      }}>
        {isDenied ? 'Acesso Negado' : isOffline ? 'Servidor Backend Offline (Sob Demanda)' : 'Aguardando Aprovação de Acesso'}
      </div>

      {/* Title */}
      <h2 style={{
        fontSize: '1.4rem',
        fontWeight: 900,
        color: '#0f172a',
        margin: '0 0 12px 0',
        letterSpacing: '-0.02em',
        lineHeight: 1.3
      }}>
        {isDenied
          ? 'Seu Acesso foi Restringido pelo Administrador'
          : isOffline
          ? 'Entre em Contato com o Administrador para Ligar o Servidor Backend'
          : 'Entre em Contato com o Administrador para Liberar seu Acesso'}
      </h2>

      {/* Description */}
      <p style={{
        fontSize: '0.92rem',
        color: '#475569',
        lineHeight: 1.6,
        margin: '0 0 24px 0'
      }}>
        {message || (isDenied
          ? 'Sua conta não possui permissão ativa para consultar dados financeiros no momento. Entre em contato com a liderança para revisar suas permissões.'
          : isOffline
          ? 'O servidor da API Backend funciona sob demanda. Peça ao administrador para ligar o servidor e liberar a conexão dos endpoints.'
          : 'Seu cadastro foi realizado com sucesso! Por motivos de segurança financeira, o acesso aos relatórios e cadastros é liberado manualmente pelo administrador da igreja.')}
      </p>

      {/* User Info Box */}
      {user && (
        <div style={{
          background: 'rgba(241, 245, 249, 0.7)',
          borderRadius: '16px',
          padding: '12px 16px',
          marginBottom: '28px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 600 }}>Usuário Conectado:</span>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
              {user.nome || user.email}
            </span>
          </div>
          <span style={{
            fontSize: '0.75rem',
            padding: '3px 10px',
            borderRadius: '9999px',
            background: isDenied ? '#fee2e2' : '#fef3c7',
            color: isDenied ? '#991b1b' : '#92400e',
            fontWeight: 700
          }}>
            Status: {isDenied ? 'negado' : 'pendente'}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '24px'
      }}>
        {/* WhatsApp Button */}
        <a
          href={`https://wa.me/${adminPhone}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '14px 24px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.92rem',
            textDecoration: 'none',
            boxShadow: '0 8px 20px rgba(37, 211, 102, 0.3)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
        >
          <MessageCircle size={18} />
          Solicitar Aprovação via WhatsApp
        </a>

        {/* Email Direct Link & Copy */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <a
            href={`mailto:${adminEmail}?subject=${encodeURIComponent('Solicitação de Aprovação de Acesso - Gestão Financeira')}`}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 18px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontWeight: 700,
              fontSize: '0.85rem',
              textDecoration: 'none',
              transition: 'background 0.2s ease'
            }}
          >
            <Mail size={16} />
            Enviar E-mail
          </a>

          <button
            onClick={handleCopyEmail}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '12px 16px',
              borderRadius: '14px',
              background: copied ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.9)',
              border: copied ? '1px solid #10b981' : '1px solid #cbd5e1',
              color: copied ? '#059669' : '#334155',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Copiar e-mail do administrador"
          >
            {copied ? <Check size={16} color="#059669" /> : <Copy size={16} />}
            {copied ? 'Copiado!' : 'Copiar E-mail'}
          </button>
        </div>
      </div>

      {/* Auxiliary Controls (Refresh, Back to Login, Logout) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '20px',
        borderTop: '1px solid rgba(226, 232, 240, 0.8)',
        fontSize: '0.82rem',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {onBackToLogin ? (
          <button
            onClick={onBackToLogin}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              background: 'transparent',
              color: '#2563eb',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={14} />
            Tentar Outro Login
          </button>
        ) : onRefreshData ? (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              background: 'transparent',
              color: '#2563eb',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Verificando...' : 'Já fui aprovado, verificar status'}
          </button>
        ) : <div />}

        {!onBackToLogin && (
          <button
            onClick={() => {
              logout();
              window.location.reload();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              background: 'transparent',
              color: '#dc2626',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <LogOut size={14} />
            Sair da Conta
          </button>
        )}
      </div>
    </div>
  );
}
