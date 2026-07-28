import React, { useState, useEffect, useRef, startTransition } from 'react';
import { Printer, Download, Settings, RefreshCw, LayoutDashboard, DatabaseZap, MoreVertical, ShieldCheck, Database, AlertCircle } from 'lucide-react';

export default function NavbarMobile({
  mainTab,
  onChangeMainTab,
  connectionStatus,
  onRefresh,
  onOpenConfig,
  onPrint,
  onExportPng,
  isExporting
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleTabChange = (tab) => {
    startTransition(() => {
      onChangeMainTab(tab);
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusColor = () => {
    if (connectionStatus.status === 'online') return '#10b981';
    if (connectionStatus.status === 'mock') return '#f59e0b';
    return '#ef4444';
  };

  const getStatusLabel = () => {
    if (connectionStatus.status === 'online') return 'API Online';
    if (connectionStatus.status === 'mock') return 'Modo Mock';
    return 'API Offline';
  };

  return (
    <div className="mobile-only">
      {/* 🌊 TOP FLOATING LIQUID GLASS CAPSULE HEADER */}
      <header style={{
        position: 'sticky',
        top: '4px',
        zIndex: 100,
        width: '100%',
        padding: '0 12px',
        marginBottom: '4px',
        pointerEvents: 'none'
      }} className="no-print">
        <div style={{
          pointerEvents: 'auto',
          width: '100%',
          background: isScrolled ? 'rgba(15, 23, 42, 0.095)' : 'rgba(15, 23, 42, 0.05)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.65)',
          borderRadius: '24px',
          padding: '10px 16px',
          boxShadow: isScrolled
            ? '0 14px 32px -6px rgba(15, 23, 42, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.95)'
            : '0 8px 24px -4px rgba(15, 23, 42, 0.06), inset 0 1px 1px rgba(255, 255, 255, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>

          {/* Left Brand Identifier with Church Logo SVG Watermark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              background: '#ffffff',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
            }}>
              <img src="/church-logo-color.jpg" alt="IMW Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>

            <div style={{ minWidth: 0 }}>
              <span style={{
                fontSize: '0.62rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--text-muted)',
                display: 'block',
                lineHeight: 1
              }}>
                Igreja Metodista Wesleyana
              </span>
              <h1 style={{
                fontSize: '1rem',
                fontWeight: 900,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                margin: '2px 0 0 0',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                Gestão Financeira
              </h1>
            </div>
          </div>

          {/* Right Action LED + Menu Button */}
          <div ref={menuRef} style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
            
            {/* Status LED Pill Button */}
            <button
              onClick={onOpenConfig}
              title={getStatusLabel()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                borderRadius: '9999px',
                background: 'rgba(241, 245, 249, 0.75)',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: getStatusColor(),
                boxShadow: `0 0 8px ${getStatusColor()}`,
                animation: connectionStatus.status === 'online' ? 'pulse 2s infinite' : 'none'
              }} />
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {connectionStatus.status === 'online' ? 'API' : connectionStatus.status === 'mock' ? 'Mock' : 'Off'}
              </span>
            </button>

            {/* Menu Popover Trigger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              title="Mais Opções"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: menuOpen ? 'var(--accent-primary)' : 'rgba(241, 245, 249, 0.75)',
                color: menuOpen ? '#ffffff' : 'var(--text-primary)',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <MoreVertical size={16} />
            </button>

            {/* Glassmorphic Dropdown Popover */}
            {menuOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '46px',
                width: '210px',
                background: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(24px) saturate(200%)',
                WebkitBackdropFilter: 'blur(24px) saturate(200%)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                borderRadius: '20px',
                padding: '8px',
                boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(0,0,0,0.05)',
                zIndex: 200,
                animation: 'glassPopIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}>
                <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', marginBottom: '4px' }}>
                  {connectionStatus.status === 'online' ? (
                    <ShieldCheck size={14} color="#10b981" />
                  ) : connectionStatus.status === 'mock' ? (
                    <Database size={14} color="#f59e0b" />
                  ) : (
                    <AlertCircle size={14} color="#ef4444" />
                  )}
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {getStatusLabel()}
                  </span>
                </div>

                <button
                  onClick={() => { setMenuOpen(false); onRefresh(); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    border: 'none',
                    background: 'transparent',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  className="mobile-popover-item"
                >
                  <RefreshCw size={15} color="var(--text-muted)" />
                  Recarregar Dados
                </button>

                {mainTab === 'dashboard' && (
                  <button
                    onClick={() => { setMenuOpen(false); onPrint(); }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      border: 'none',
                      background: 'transparent',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    className="mobile-popover-item"
                  >
                    <Printer size={15} color="var(--text-muted)" />
                    Imprimir Relatório A4
                  </button>
                )}

                {mainTab === 'dashboard' && (
                  <button
                    onClick={() => { setMenuOpen(false); onExportPng(); }}
                    disabled={isExporting}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      border: 'none',
                      background: 'rgba(21, 101, 192, 0.08)',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#1565c0',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    className="mobile-popover-item"
                  >
                    <Download size={15} color="#1565c0" />
                    {isExporting ? 'Exportando…' : 'Exportar Imagem PNG'}
                  </button>
                )}

                <button
                  onClick={() => { setMenuOpen(false); onOpenConfig(); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    border: 'none',
                    background: 'transparent',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  className="mobile-popover-item"
                >
                  <Settings size={15} color="var(--text-muted)" />
                  Configurações da API
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 🌊 FLOATING LIQUID GLASS BOTTOM NAVIGATION DOCK PILL */}
      <nav className="mobile-bottom-dock no-print" style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '400px',
        zIndex: 999,
        pointerEvents: 'none'
      }}>
        <div style={{
          pointerEvents: 'auto',
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.78)',
          backdropFilter: 'blur(28px) saturate(200%)',
          WebkitBackdropFilter: 'blur(28px) saturate(200%)',
          border: '1px solid rgba(255, 255, 255, 0.75)',
          borderRadius: '9999px',
          padding: '4px',
          boxShadow: '0 16px 40px -8px rgba(15, 23, 42, 0.18), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4px'
        }}>
          
          {/* Active Liquid Pill Slider */}
          <div style={{
            position: 'absolute',
            top: '4px',
            bottom: '4px',
            left: mainTab === 'dashboard' ? '4px' : 'calc(50% + 2px)',
            width: 'calc(50% - 6px)',
            background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
            borderRadius: '9999px',
            boxShadow: '0 4px 14px rgba(21, 101, 192, 0.35)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 1
          }} />

          {/* Tab 1 Button: Dashboard */}
          <button
            onClick={() => handleTabChange('dashboard')}
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              height: '44px',
              border: 'none',
              background: 'transparent',
              borderRadius: '9999px',
              color: mainTab === 'dashboard' ? '#ffffff' : 'var(--text-secondary)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.825rem',
              fontWeight: mainTab === 'dashboard' ? 800 : 600,
              cursor: 'pointer',
              transition: 'color 0.2s ease',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            <LayoutDashboard size={17} />
            <span>Painel & Balanço</span>
          </button>

          {/* Tab 2 Button: Explorer */}
          <button
            onClick={() => handleTabChange('explorer')}
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              height: '44px',
              border: 'none',
              background: 'transparent',
              borderRadius: '9999px',
              color: mainTab === 'explorer' ? '#ffffff' : 'var(--text-secondary)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.825rem',
              fontWeight: mainTab === 'explorer' ? 800 : 600,
              cursor: 'pointer',
              transition: 'color 0.2s ease',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            <DatabaseZap size={17} />
            <span>Cadastros & Listas</span>
          </button>

        </div>
      </nav>
    </div>
  );
}
