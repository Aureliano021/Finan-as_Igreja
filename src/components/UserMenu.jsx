import React, { useState, useEffect, useRef } from 'react';
import { User, LogIn, LogOut, ShieldCheck, ShieldAlert, Clock, ChevronDown } from 'lucide-react';
import { getStoredUser, getUserStatus, logout } from '../services/auth';

export default function UserMenu({ isScrolled = false, isMobile = false }) {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Sync auth state
  const syncUser = () => {
    setUser(getStoredUser());
  };

  useEffect(() => {
    syncUser();
    const handleAuthChange = () => syncUser();
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    setUser(null);
  };

  // Helper to extract initials (e.g. "João Silva" -> "JS")
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // If user NOT logged in
  if (!user) {
    return (
      <a
        href="/login.html"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: isScrolled ? '5px 12px' : '7px 16px',
          borderRadius: '9999px',
          background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
          color: '#ffffff',
          fontFamily: 'var(--font-sans)',
          fontSize: isScrolled ? '0.75rem' : '0.8rem',
          fontWeight: 800,
          textDecoration: 'none',
          boxShadow: '0 4px 12px rgba(21, 101, 192, 0.25)',
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap'
        }}
      >
        <LogIn size={isScrolled ? 13 : 15} />
        <span>Entrar / Cadastrar</span>
      </a>
    );
  }

  // If user IS logged in
  const initials = getInitials(user.nome || user.email);
  const status = getUserStatus(user);

  const statusConfig = {
    aceito: { label: 'Aceito', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', icon: ShieldCheck },
    pendente: { label: 'Pendente', color: '#d97706', bg: 'rgba(245, 158, 11, 0.14)', icon: Clock },
    negado: { label: 'Negado', color: '#dc2626', bg: 'rgba(239, 68, 68, 0.14)', icon: ShieldAlert }
  }[status] || { label: 'Pendente', color: '#d97706', bg: 'rgba(245, 158, 11, 0.14)', icon: Clock };

  const StatusIcon = statusConfig.icon;

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: isScrolled ? '4px 10px 4px 4px' : '5px 12px 5px 5px',
          borderRadius: '9999px',
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.2s ease'
        }}
        title={`Conectado como ${user.nome || user.email} (Status: ${statusConfig.label})`}
      >
        {/* Avatar Circle */}
        <div style={{
          width: isScrolled ? '26px' : '30px',
          height: isScrolled ? '26px' : '30px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isScrolled ? '0.68rem' : '0.75rem',
          fontWeight: 800,
          flexShrink: 0,
          position: 'relative'
        }}>
          {initials}
        </div>

        {/* User Short Name (Desktop) */}
        {!isMobile && (
          <span style={{
            fontSize: isScrolled ? '0.72rem' : '0.78rem',
            fontWeight: 800,
            color: '#0f172a',
            maxWidth: '110px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {user.nome ? user.nome.split(' ')[0] : user.email.split('@')[0]}
          </span>
        )}

        {/* Mini Status Pill Badge */}
        <span style={{
          fontSize: '0.65rem',
          fontWeight: 800,
          padding: '2px 7px',
          borderRadius: '9999px',
          background: statusConfig.bg,
          color: statusConfig.color,
          textTransform: 'uppercase',
          letterSpacing: '0.03em'
        }}>
          {statusConfig.label}
        </span>

        <ChevronDown size={isScrolled ? 12 : 14} color="#64748b" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
      </button>

      {/* Glassmorphic Dropdown Popover */}
      {open && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: isScrolled ? '36px' : '42px',
          width: '250px',
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          borderRadius: '20px',
          padding: '14px',
          boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(0,0,0,0.05)',
          zIndex: 250,
          animation: 'glassPopIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {/* User Info Header */}
          <div style={{ paddingBottom: '10px', borderBottom: '1px solid #f1f5f9', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.7rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: statusConfig.color,
                background: statusConfig.bg,
                padding: '2px 8px',
                borderRadius: '9999px',
                letterSpacing: '0.04em'
              }}>
                <StatusIcon size={12} color={statusConfig.color} />
                {statusConfig.label}
              </span>
            </div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
              {user.nome || 'Usuário'}
            </h4>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '3px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.email}
            </p>
          </div>

          {/* Actions */}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              border: 'none',
              background: 'rgba(239, 68, 68, 0.08)',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: 800,
              color: '#dc2626',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.2s ease'
            }}
          >
            <LogOut size={15} color="#dc2626" />
            Sair da Conta
          </button>
        </div>
      )}
    </div>
  );
}
