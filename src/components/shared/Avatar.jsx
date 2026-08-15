import React from 'react';

/**
 * Helper para extrair 2 iniciais a partir do nome ou e-mail
 */
function getInitials(name = '') {
  if (!name) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Avatar Component
 * @param {Object} props
 * @param {string} [props.name=''] - Nome do usuário
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Tamanho do avatar
 * @param {'online' | 'pending' | 'offline' | null} [props.status=null] - Ponto de status
 * @param {Function} [props.onClick] - Evento de clique
 */
export default function Avatar({
  name = '',
  size = 'md',
  status = null,
  onClick,
  className = '',
  ...props
}) {
  const initials = getInitials(name);

  const sizeStyles = {
    sm: { width: 28, height: 28, fontSize: '0.72rem' },
    md: { width: 36, height: 36, fontSize: '0.85rem' },
    lg: { width: 48, height: 48, fontSize: '1.05rem' }
  }[size] || { width: 36, height: 36, fontSize: '0.85rem' };

  const statusColors = {
    online: '#2f6fed',
    pending: '#e63946',
    offline: '#6b7a99'
  };

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '9999px',
        backgroundColor: 'var(--panel-elevated)',
        border: '1px solid var(--panel-line)',
        color: 'var(--text)',
        fontFamily: 'var(--font-mono)',
        fontWeight: 600,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        flexShrink: 0,
        ...sizeStyles
      }}
      className={className}
      {...props}
    >
      <span>{initials}</span>

      {status && (
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: size === 'sm' ? 7 : 9,
            height: size === 'sm' ? 7 : 9,
            borderRadius: '9999px',
            backgroundColor: statusColors[status] || statusColors.offline,
            border: '2px solid var(--panel)'
          }}
        />
      )}
    </div>
  );
}
