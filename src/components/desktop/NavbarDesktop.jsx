import React, { useState, useEffect, useRef, startTransition } from 'react';
import { Printer, Download, Settings, RefreshCw, Database, LayoutDashboard, DatabaseZap, ChevronDown } from 'lucide-react';
import UserMenu from '../UserMenu';

export default function NavbarDesktop({
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
  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > 60) {
        setIsScrolled(true);
      } else if (currentScroll < 15) {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close export dropdown popover on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target)) {
        setActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabChange = (tab) => {
    startTransition(() => {
      onChangeMainTab(tab);
    });
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%',
      height: '76px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      padding: '0 16px',
      margin: '0 0 8px 0'
    }} className="desktop-only no-print">
      {/* Floating & Dynamic Bar Container */}
      <div style={{
        pointerEvents: 'auto',
        width: '100%',
        maxWidth: isScrolled ? '1240px' : 'calc(1340px - 32px)',
        background: isScrolled ? 'rgba(15, 23, 42, 0.095)' : 'rgba(15, 23, 42, 0.05)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: isScrolled ? '1px solid rgba(15, 23, 42, 0.15)' : '1px solid rgba(15, 23, 42, 0.08)',
        borderTop: isScrolled ? '1px solid rgba(255, 255, 255, 0.85)' : '4px solid #c62828',
        borderRadius: isScrolled ? '9999px' : '16px',
        padding: isScrolled ? '6px 18px' : '10px 20px',
        boxShadow: isScrolled
          ? '0 14px 36px -6px rgba(15, 23, 42, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.95)'
          : '0 8px 30px -4px rgba(15, 23, 42, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
        gap: '12px',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Brand & Main Navigation Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isScrolled ? '12px' : '16px', flexWrap: 'nowrap', transition: 'gap 0.3s ease' }}>

          {/* Brand Title with Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '4px', whiteSpace: 'nowrap' }}>
            <div style={{
              width: isScrolled ? '34px' : '38px',
              height: isScrolled ? '34px' : '38px',
              borderRadius: '12px',
              background: '#ffffff',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
              flexShrink: 0,
              transition: 'all 0.3s ease'
            }}>
              <img src="/church-logo-color.jpg" alt="IMW Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <span style={{
                fontSize: isScrolled ? '0.58rem' : '0.62rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: '#64748b',
                display: 'block',
                lineHeight: 1,
                transition: 'all 0.3s ease'
              }}>
                Igreja Metodista Wesleyana
              </span>
              <h1 style={{
                fontSize: isScrolled ? '1rem' : '1.15rem',
                fontWeight: 900,
                color: '#0f172a',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                margin: isScrolled ? '2px 0 0 0' : '3px 0 0 0',
                transition: 'all 0.3s ease'
              }}>
                Gestão Financeira
              </h1>
            </div>
          </div>

          {/* Segmented Navigation Tabs */}
          <div style={{
            display: 'flex',
            background: '#f1f5f9',
            padding: '3px',
            borderRadius: '9999px',
            border: '1px solid #e2e8f0',
            gap: '2px',
            whiteSpace: 'nowrap',
            transition: 'all 0.3s ease'
          }}>
            <button
              onClick={() => handleTabChange('dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: isScrolled ? '5px 12px' : '6px 14px',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: isScrolled ? '0.75rem' : '0.8rem',
                fontWeight: mainTab === 'dashboard' ? 800 : 600,
                background: mainTab === 'dashboard' ? '#1565c0' : 'transparent',
                color: mainTab === 'dashboard' ? '#ffffff' : '#64748b',
                boxShadow: mainTab === 'dashboard' ? '0 2px 8px rgba(21, 101, 192, 0.25)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <LayoutDashboard size={isScrolled ? 13 : 15} />
              Painel
            </button>

            <button
              onClick={() => handleTabChange('explorer')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: isScrolled ? '5px 12px' : '6px 14px',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: isScrolled ? '0.75rem' : '0.8rem',
                fontWeight: mainTab === 'explorer' ? 800 : 600,
                background: mainTab === 'explorer' ? '#1565c0' : 'transparent',
                color: mainTab === 'explorer' ? '#ffffff' : '#64748b',
                boxShadow: mainTab === 'explorer' ? '0 2px 8px rgba(21, 101, 192, 0.25)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <DatabaseZap size={isScrolled ? 13 : 15} />
              Cadastros
            </button>

            <a
              href="/gerenciar.html"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: isScrolled ? '5px 12px' : '6px 14px',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: isScrolled ? '0.75rem' : '0.8rem',
                fontWeight: mainTab === 'gerenciar' ? 800 : 600,
                background: mainTab === 'gerenciar' ? '#1565c0' : 'transparent',
                color: mainTab === 'gerenciar' ? '#ffffff' : '#64748b',
                boxShadow: mainTab === 'gerenciar' ? '0 2px 8px rgba(21, 101, 192, 0.25)' : 'none',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Database size={isScrolled ? 13 : 15} />
              Gerenciar
            </a>
          </div>
        </div>

        {/* Status Badge & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isScrolled ? '6px' : '10px', flexWrap: 'nowrap', transition: 'gap 0.3s ease' }}>

          {/* API Connection Badge */}
          <button
            onClick={onOpenConfig}
            aria-live="polite"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
            title="Clique para configurar a API"
          >
            {connectionStatus.status === 'online' ? (
              <span className="badge badge-online" style={{ borderRadius: '9999px', padding: isScrolled ? '4px 10px' : '6px 14px', fontSize: isScrolled ? '0.7rem' : '0.75rem', whiteSpace: 'nowrap' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0f172a', display: 'inline-block' }}></span>
                API Online
              </span>
            ) : (
              <span className="badge badge-offline" style={{ borderRadius: '9999px', padding: isScrolled ? '4px 10px' : '6px 14px', fontSize: isScrolled ? '0.7rem' : '0.75rem', whiteSpace: 'nowrap' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ffffff', display: 'inline-block' }}></span>
                API Offline
              </span>
            )}
          </button>

          {/* Refresh Button */}
          <button onClick={onRefresh} className="btn btn-secondary btn-sm" style={{ borderRadius: '9999px', padding: isScrolled ? '6px 10px' : '8px 14px' }} title="Recarregar Dados">
            <RefreshCw size={isScrolled ? 13 : 15} />
          </button>

          {/* Compact Export / Print Dropdown Menu */}
          {mainTab === 'dashboard' && (
            <div ref={actionsRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setActionsOpen(!actionsOpen)}
                className="btn btn-secondary btn-sm"
                style={{
                  borderRadius: '9999px',
                  padding: isScrolled ? '6px 12px' : '8px 15px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 700,
                  fontSize: isScrolled ? '0.75rem' : '0.8rem'
                }}
                title="Opções de Exportação e Impressão"
              >
                <Printer size={isScrolled ? 13 : 15} />
                <span>Imprimir</span>
                <ChevronDown size={isScrolled ? 12 : 14} style={{ transform: actionsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
              </button>

              {/* Glass Dropdown Popover */}
              {actionsOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: isScrolled ? '38px' : '44px',
                  width: '215px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.9)',
                  borderRadius: '18px',
                  padding: '8px',
                  boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(0,0,0,0.05)',
                  zIndex: 250,
                  animation: 'glassPopIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                  <button
                    onClick={() => { setActionsOpen(false); onPrint(); }}
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
                      color: '#0f172a',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <Printer size={16} color="#64748b" />
                    Imprimir PDF A4
                  </button>

                  <button
                    onClick={() => { setActionsOpen(false); onExportPng(); }}
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
                      textAlign: 'left',
                      marginTop: '4px',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <Download size={16} color="#1565c0" />
                    {isExporting ? 'Exportando PNG...' : 'Exportar Imagem PNG'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Settings Button */}
          <button onClick={onOpenConfig} className="btn btn-secondary btn-sm" style={{ borderRadius: '9999px', padding: isScrolled ? '6px 10px' : '8px 14px' }} title="Configurações da API">
            <Settings size={isScrolled ? 13 : 15} />
          </button>

          {/* User Identification & Menu */}
          <UserMenu isScrolled={isScrolled} />
        </div>
      </div>
    </header>
  );
}
