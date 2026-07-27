import React, { useState, useEffect, useRef } from 'react';
import { Printer, Download, Settings, RefreshCw, LayoutDashboard, DatabaseZap, MoreVertical } from 'lucide-react';

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

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > 30) {
        setIsScrolled(true);
      } else if (currentScroll < 10) {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
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
      {/* 📱 MOBILE TOP FLOATING PILL WITH RICH BLUR */}
      <header className="mobile-header-root no-print">
        <div className={`mobile-header-pill ${isScrolled ? 'is-scrolled' : ''}`}>
          
          {/* Title on Top Left */}
          <div className="mobile-brand-section">
            <span className="mobile-subtitle">Igreja Metodista Wesleyana</span>
            <h1 className="mobile-title">Gestão Financeira</h1>
          </div>

          {/* LED + 3-Dots Menu on Top Right */}
          <div ref={menuRef} className="mobile-actions-section">
            <button onClick={onOpenConfig} title={getStatusLabel()} className="mobile-led-btn">
              <span className="mobile-led-dot" style={{ background: getStatusColor(), boxShadow: `0 0 6px ${getStatusColor()}` }} />
            </button>

            <button onClick={() => setMenuOpen(!menuOpen)} title="Mais Opções" className={`mobile-more-btn ${menuOpen ? 'active' : ''}`}>
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <div className="navbar-dropdown-menu mobile-dropdown">
                <div onClick={() => { setMenuOpen(false); onOpenConfig(); }} className="dropdown-status-item">
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: getStatusColor(), boxShadow: `0 0 6px ${getStatusColor()}` }} />
                  <span>{getStatusLabel()}</span>
                </div>

                <div className="dropdown-divider" />

                <button onClick={() => { setMenuOpen(false); onRefresh(); }} className="dropdown-action-button">
                  <RefreshCw size={15} color="#475569" />
                  Recarregar Dados
                </button>

                {mainTab === 'dashboard' && (
                  <button onClick={() => { setMenuOpen(false); onPrint(); }} className="dropdown-action-button">
                    <Printer size={15} color="#475569" />
                    Imprimir PDF A4
                  </button>
                )}

                {mainTab === 'dashboard' && (
                  <button onClick={() => { setMenuOpen(false); onExportPng(); }} disabled={isExporting} className="dropdown-action-button primary">
                    <Download size={15} color="#1565c0" />
                    {isExporting ? 'Exportando...' : 'Exportar PNG'}
                  </button>
                )}

                <button onClick={() => { setMenuOpen(false); onOpenConfig(); }} className="dropdown-action-button">
                  <Settings size={15} color="#475569" />
                  Configurações da API
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* 📱 MOBILE BOTTOM DOCK PILL (Muda de tamanho no scroll) */}
      <nav className={`mobile-bottom-dock ${isScrolled ? 'is-scrolled' : ''} no-print`}>
        <div className="mobile-dock-pill">
          <button
            onClick={() => onChangeMainTab('dashboard')}
            className={`mobile-dock-btn ${mainTab === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard size={isScrolled ? 13 : 14} />
            <span>Painel & Relatórios</span>
          </button>

          <button
            onClick={() => onChangeMainTab('explorer')}
            className={`mobile-dock-btn ${mainTab === 'explorer' ? 'active' : ''}`}
          >
            <DatabaseZap size={isScrolled ? 13 : 14} />
            <span>Cadastros & Listas</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
