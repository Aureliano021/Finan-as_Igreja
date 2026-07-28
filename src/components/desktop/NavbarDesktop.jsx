import React, { useState, useEffect, startTransition } from 'react';
import { Printer, Download, Settings, RefreshCw, Database, LayoutDashboard, DatabaseZap } from 'lucide-react';

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

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > 60) {
        setIsScrolled(true);
      } else if (currentScroll < 15) {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
        maxWidth: isScrolled ? '1180px' : 'calc(1320px - 32px)',
        background: isScrolled ? 'rgba(15, 23, 42, 0.095)' : 'rgba(15, 23, 42, 0.05)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: isScrolled ? '1px solid rgba(15, 23, 42, 0.15)' : '1px solid rgba(15, 23, 42, 0.08)',
        borderTop: isScrolled ? '1px solid rgba(255, 255, 255, 0.85)' : '4px solid #c62828',
        borderRadius: isScrolled ? '9999px' : '16px',
        padding: isScrolled ? '8px 22px' : '12px 24px',
        boxShadow: isScrolled
          ? '0 14px 36px -6px rgba(15, 23, 42, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.95)'
          : '0 8px 30px -4px rgba(15, 23, 42, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Brand & Main Navigation Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isScrolled ? '20px' : '32px', flexWrap: 'wrap', transition: 'gap 0.3s ease' }}>

          {/* Brand Title with Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '4px' }}>
            <div style={{
              width: isScrolled ? '36px' : '42px',
              height: isScrolled ? '36px' : '42px',
              borderRadius: '12px',
              background: '#ffffff',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.3s ease'
            }}>
              <img src="/church-logo-color.jpg" alt="IMW Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
            <span style={{
              fontSize: isScrolled ? '0.6rem' : '0.68rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: '#64748b',
              display: 'block',
              lineHeight: 1,
              transition: 'all 0.3s ease'
            }}>
              Igreja Metodista Wesleyana
            </span>
            <h1 style={{
              fontSize: isScrolled ? '1.05rem' : '1.35rem',
              fontWeight: 900,
              color: '#0f172a',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              margin: isScrolled ? '2px 0 0 0' : '4px 0 0 0',
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
            padding: isScrolled ? '3px' : '4px',
            borderRadius: '9999px',
            border: '1px solid #e2e8f0',
            gap: '2px',
            transition: 'all 0.3s ease'
          }}>
            <button
              onClick={() => handleTabChange('dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: isScrolled ? '6px 14px' : '8px 18px',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: isScrolled ? '0.78rem' : '0.85rem',
                fontWeight: mainTab === 'dashboard' ? 800 : 600,
                background: mainTab === 'dashboard' ? '#1565c0' : 'transparent',
                color: mainTab === 'dashboard' ? '#ffffff' : '#64748b',
                boxShadow: mainTab === 'dashboard' ? '0 2px 8px rgba(21, 101, 192, 0.25)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <LayoutDashboard size={isScrolled ? 14 : 16} />
              Painel & Relatórios
            </button>

            <button
              onClick={() => handleTabChange('explorer')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: isScrolled ? '6px 14px' : '8px 18px',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: isScrolled ? '0.78rem' : '0.85rem',
                fontWeight: mainTab === 'explorer' ? 800 : 600,
                background: mainTab === 'explorer' ? '#1565c0' : 'transparent',
                color: mainTab === 'explorer' ? '#ffffff' : '#64748b',
                boxShadow: mainTab === 'explorer' ? '0 2px 8px rgba(21, 101, 192, 0.25)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <DatabaseZap size={isScrolled ? 14 : 16} />
              Cadastros & Listas
            </button>
          </div>
        </div>

        {/* Status Badge & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isScrolled ? '6px' : '10px', flexWrap: 'wrap', transition: 'gap 0.3s ease' }}>

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
              <span className="badge badge-online" style={{ borderRadius: '9999px', padding: isScrolled ? '4px 10px' : '6px 14px', fontSize: isScrolled ? '0.7rem' : '0.75rem' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0f172a', display: 'inline-block' }}></span>
                API Online
              </span>
            ) : connectionStatus.status === 'mock' ? (
              <span className="badge badge-mock" style={{ borderRadius: '9999px', padding: isScrolled ? '4px 10px' : '6px 14px', fontSize: isScrolled ? '0.7rem' : '0.75rem' }}>
                <Database size={isScrolled ? 11 : 13} />
                Modo Mock
              </span>
            ) : (
              <span className="badge badge-offline" style={{ borderRadius: '9999px', padding: isScrolled ? '4px 10px' : '6px 14px', fontSize: isScrolled ? '0.7rem' : '0.75rem' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ffffff', display: 'inline-block' }}></span>
                API Offline
              </span>
            )}
          </button>

          {/* Refresh Button */}
          <button onClick={onRefresh} className="btn btn-secondary btn-sm" style={{ borderRadius: '9999px', padding: isScrolled ? '6px 10px' : '8px 14px' }} title="Recarregar Dados">
            <RefreshCw size={isScrolled ? 13 : 15} />
          </button>

          {/* Print PDF Button */}
          {mainTab === 'dashboard' && (
            <>
              <button onClick={onPrint} className="btn btn-secondary btn-sm" style={{ borderRadius: '9999px', padding: isScrolled ? '6px 12px' : '8px 16px' }} title="Imprimir / Salvar PDF A4">
                <Printer size={isScrolled ? 13 : 15} />
                <span className="btn-label-desktop">Imprimir PDF</span>
              </button>

              <button onClick={onExportPng} disabled={isExporting} className="btn btn-primary btn-sm" style={{ borderRadius: '9999px', padding: isScrolled ? '6px 12px' : '8px 16px' }} title="Exportar Imagem PNG">
                <Download size={isScrolled ? 13 : 15} />
                <span className="btn-label-desktop">{isExporting ? 'Exportando...' : 'PNG'}</span>
              </button>
            </>
          )}

          {/* Settings Button */}
          <button onClick={onOpenConfig} className="btn btn-secondary btn-sm" style={{ borderRadius: '9999px', padding: isScrolled ? '6px 10px' : '8px 14px' }} title="Configurações da API">
            <Settings size={isScrolled ? 13 : 15} />
          </button>
        </div>
      </div>
    </header>
  );
}
