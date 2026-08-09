import React, { useState, useEffect, useRef, Suspense } from 'react';

import Navbar from './components/Navbar';
import PeriodSelector from './components/PeriodSelector';
import KpiCards from './components/KpiCards';
const FinancialCharts = React.lazy(() => import('./components/FinancialCharts'));
import TransactionsTable from './components/TransactionsTable';
import DataExplorer from './components/DataExplorer';
import ApiConfigModal from './components/ApiConfigModal';
import PrintableReport from './components/PrintableReport';
import AccessNoticeCard from './components/AccessNoticeCard';

import { fetchAllFinancialData } from './services/api';
import { getStoredUser, getUserStatus, setAuth, getStoredToken } from './services/auth';
import { isSameMonthAndYear, getRecordDate, getRecordValue, parseDateParts } from './services/utils';

/**
 * Generic period filter — avoids duplicating the same logic for each entity.
 * viewMode: 'all' | 'year' | 'month'
 */
function filterByPeriod(items, viewMode, year, month) {
  if (!Array.isArray(items)) return [];
  if (viewMode === 'all') return items;
  return items.filter(item => {
    const rawDate = item?.data ?? item?.data_despesa ?? item?.data_oferta ?? item?.date ?? item?.created_at ?? item?.data_criacao;
    if (!rawDate) return true; // Include records even if date is missing
    const { year: itemYear, month: itemMonth } = parseDateParts(rawDate);
    if (!itemYear || !itemMonth) return true; // Include records if unparseable rather than dropping to 0
    if (viewMode === 'year') return itemYear === year;
    return itemYear === year && itemMonth === month;
  });
}

export default function App() {
  const currentDate = new Date();

  // Current logged in user & status
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());

  // Main Top Tab ('dashboard' | 'explorer')
  const [mainTab, setMainTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'explorer' || tab === 'dashboard') {
        return tab;
      }
    }
    return 'dashboard';
  });

  // Sync URL query param when mainTab changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (mainTab === 'explorer') {
        url.searchParams.set('tab', 'explorer');
      } else {
        url.searchParams.delete('tab');
      }
      window.history.replaceState({}, '', url.toString());
    }
  }, [mainTab]);

  // Period View Mode ('month' | 'year') - Default to 'month' as requested
  const [viewMode, setViewMode] = useState('month');
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState({ status: 'offline', message: 'Carregando…' });

  const [membros, setMembros] = useState([]);
  const [dizimos, setDizimos] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [despesas, setDespesas] = useState([]);

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const dashboardRef = useRef(null);

  // Sync user state on auth events
  useEffect(() => {
    const syncUser = () => setCurrentUser(getStoredUser());
    window.addEventListener('auth-change', syncUser);
    window.addEventListener('storage', syncUser);
    return () => {
      window.removeEventListener('auth-change', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);

  // Load financial data with safety timeout to prevent infinite loading screen
  const loadData = async () => {
    setLoading(true);

    // Safety timeout: force stop loading spinner after 6 seconds max
    const safetyTimer = setTimeout(() => {
      setLoading(false);
      setConnectionStatus(prev => ({
        ...prev,
        message: prev.message || 'A conexão demorou para responder. Verifique se o servidor backend está ativo.'
      }));
    }, 6000);

    try {
      const data = await fetchAllFinancialData();
      setMembros(Array.isArray(data?.membros) ? data.membros : []);
      setDizimos(Array.isArray(data?.dizimos) ? data.dizimos : []);
      setOfertas(Array.isArray(data?.ofertas) ? data.ofertas : []);
      setDespesas(Array.isArray(data?.despesas) ? data.despesas : []);
      setConnectionStatus({
        status: data?.status || 'offline',
        userStatus: data?.userStatus,
        message: data?.message || 'Não foi possível obter dados da API.'
      });

      // If backend returned online (200 OK), user's access is active! Sync local user status to 'aceito'
      if (data?.status === 'online') {
        const stored = getStoredUser();
        if (stored && getUserStatus(stored) !== 'aceito') {
          const updatedUser = { ...stored, status: 'aceito' };
          setAuth(getStoredToken(), updatedUser);
          setCurrentUser(updatedUser);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados da API:', err);
      setConnectionStatus({
        status: 'offline',
        message: 'Ocorreu um erro ao comunicar com a API Backend.'
      });
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute available Years present in DB records
  const availableYearsAndMonths = React.useMemo(() => {
    const yearsMap = new Map();
    const allRecords = [...dizimos, ...ofertas, ...despesas];

    allRecords.forEach(item => {
      const dateStr = getRecordDate(item);
      if (!dateStr) return;
      const parts = dateStr.split('-');
      if (parts.length >= 2) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        if (!isNaN(y) && !isNaN(m) && y > 1900 && y < 2100 && m >= 1 && m <= 12) {
          if (!yearsMap.has(y)) {
            yearsMap.set(y, new Set());
          }
          yearsMap.get(y).add(m);
        }
      }
    });

    const sortedYears = Array.from(yearsMap.keys()).sort((a, b) => b - a);
    return { yearsMap, sortedYears };
  }, [dizimos, ofertas, despesas]);

  // Derived effective selected year — ensures selectedYear falls back to most recent year with data
  const effectiveSelectedYear = React.useMemo(() => {
    if (availableYearsAndMonths.sortedYears.length > 0 && !availableYearsAndMonths.sortedYears.includes(selectedYear)) {
      return availableYearsAndMonths.sortedYears[0];
    }
    return selectedYear;
  }, [availableYearsAndMonths.sortedYears, selectedYear]);

  // Map member IDs to member objects for quick lookup
  const membrosMap = React.useMemo(() => {
    const map = {};
    if (Array.isArray(membros)) {
      membros.forEach(m => {
        if (m && m.id != null) {
          map[m.id] = m;
        }
      });
    }
    return map;
  }, [membros]);

  // Filter datasets based on viewMode using shared filterByPeriod helper
  const dizimosFiltered = React.useMemo(
    () => filterByPeriod(dizimos, viewMode, effectiveSelectedYear, selectedMonth),
    [dizimos, viewMode, effectiveSelectedYear, selectedMonth]
  );

  const ofertasFiltered = React.useMemo(
    () => filterByPeriod(ofertas, viewMode, effectiveSelectedYear, selectedMonth),
    [ofertas, viewMode, effectiveSelectedYear, selectedMonth]
  );

  const despesasFiltered = React.useMemo(
    () => filterByPeriod(despesas, viewMode, effectiveSelectedYear, selectedMonth),
    [despesas, viewMode, effectiveSelectedYear, selectedMonth]
  );

  // Memoized totals calculation to prevent unnecessary work on non-data renders
  const totalDizimos = React.useMemo(() => dizimosFiltered.reduce((acc, item) => acc + getRecordValue(item), 0), [dizimosFiltered]);
  const totalOfertas = React.useMemo(() => ofertasFiltered.reduce((acc, item) => acc + getRecordValue(item), 0), [ofertasFiltered]);
  const totalDespesas = React.useMemo(() => despesasFiltered.reduce((acc, item) => acc + getRecordValue(item), 0), [despesasFiltered]);

  // Export Dashboard as PNG image (Dynamic import for bundle optimization)
  const handleExportPng = async () => {
    if (!dashboardRef.current) return;
    setIsExporting(true);
    try {
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default || html2canvasModule;
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: '#eef2ff',
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (clonedDoc, element) => {
          // 1. Replicate website's ambient glass background
          element.style.background = 'linear-gradient(135deg, #eef2ff 0%, #f0fdf4 50%, #f8fafc 100%)';
          element.style.padding = '28px';
          element.style.borderRadius = '24px';
          element.style.boxSizing = 'border-box';

          // 2. High contrast cards floating above background
          const cards = element.querySelectorAll('.glass-card, .kpi-card');
          cards.forEach(c => {
            c.style.background = '#ffffff';
            c.style.border = '1px solid rgba(226, 232, 240, 0.9)';
            c.style.boxShadow = '0 10px 25px -4px rgba(15, 23, 42, 0.08)';
            c.style.borderRadius = '18px';
            c.style.backdropFilter = 'none';
          });

          // 3. Elegant Developer Credit & Certification Footer Badge
          const footer = clonedDoc.createElement('div');
          footer.style.marginTop = '28px';
          footer.style.padding = '14px 20px';
          footer.style.background = '#ffffff';
          footer.style.border = '1px solid rgba(21, 101, 192, 0.25)';
          footer.style.borderRadius = '16px';
          footer.style.display = 'flex';
          footer.style.alignItems = 'center';
          footer.style.justifyContent = 'space-between';
          footer.style.flexWrap = 'wrap';
          footer.style.gap = '12px';
          footer.style.boxShadow = '0 4px 16px rgba(15, 23, 42, 0.05)';
          footer.innerHTML = `
            <div style="display: flex; alignItems: center; gap: 10px;">
              <span style="background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%); color: #ffffff; padding: 5px 12px; border-radius: 999px; font-weight: 800; font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase;">
                FINANÇAS IGREJA
              </span>
              <span style="font-size: 0.8rem; color: #475569; font-weight: 700;">
                Relatório de Prestação de Contas
              </span>
            </div>
            <div style="font-size: 0.8rem; color: #475569; font-weight: 600;">
              Sistema desenvolvido por <strong style="color: #0f172a; font-weight: 800;">Aureliano Peixoto Neto</strong>, com o auxílio de Inteligência Artificial
            </div>
          `;
          element.appendChild(footer);
        }
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `relatorio-financeiro-${viewMode}-${selectedYear}.png`;
      link.click();
    } catch (err) {
      console.error('Erro ao exportar PNG:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Print Report PDF
  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* 🌊 Ambient Glass Background Orbs & Church Logo Watermark */}
      <div className="ambient-bg-orbs no-print" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'clamp(360px, 70vw, 620px)',
          height: 'clamp(360px, 70vw, 620px)',
          pointerEvents: 'none',
          opacity: 0.45,
          zIndex: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mixBlendMode: 'multiply'
        }}>
          <img src="/church-logo-bw.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      </div>

      {/* Top Navigation */}
      <Navbar
        mainTab={mainTab}
        onChangeMainTab={setMainTab}
        connectionStatus={connectionStatus}
        onRefresh={loadData}
        onOpenConfig={() => setIsConfigOpen(true)}
        onPrint={handlePrint}
        onExportPng={handleExportPng}
        isExporting={isExporting}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1320px', width: '100%', margin: '0 auto', padding: '24px 16px' }} ref={dashboardRef}>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }} role="status" aria-live="polite">
            <div className="animate-spin" aria-hidden="true" style={{
              width: 36,
              height: 36,
              border: '3px solid var(--border-color)',
              borderTopColor: 'var(--accent-primary)',
              borderRadius: '50%',
              margin: '0 auto 16px auto'
            }}></div>
            <p>Carregando dados da igreja…</p>
          </div>
        ) : connectionStatus.status === 'unauthenticated' ? (
          <div style={{
            maxWidth: '540px',
            margin: '40px auto',
            padding: '32px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(16px)',
            borderRadius: '24px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.08)',
            textAlign: 'center'
          }} role="alert">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              🔒
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
              Autenticação Necessária
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '20px' }}>
              {connectionStatus.message || 'Sessão expirada ou não autenticada. Por favor, entre com sua conta.'}
            </p>
            <a
              href="/login.html"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.875rem',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(21, 101, 192, 0.3)'
              }}
            >
              Fazer Login / Criar Conta
            </a>
          </div>
        ) : connectionStatus.status === 'offline' ? (
          <AccessNoticeCard
            status="offline"
            user={currentUser}
            onRefreshData={loadData}
            message={connectionStatus.message || 'O servidor de API Backend está desligado (funciona sob demanda). Peça ao administrador para ligar o servidor.'}
          />
        ) : connectionStatus.status === 'pending_approval' ? (
          <AccessNoticeCard
            status={connectionStatus.userStatus || getUserStatus(currentUser) || 'pendente'}
            user={currentUser}
            onRefreshData={loadData}
            message={connectionStatus.message}
          />
        ) : (
          <>
            {/* MAIN TAB 1: PAINEL & GRÁFICOS */}
            {mainTab === 'dashboard' && (
              <>
                {/* Period Selector (Visão Geral / Por Ano / Por Mês) */}
                <PeriodSelector
                  viewMode={viewMode}
                  onChangeViewMode={setViewMode}
                  selectedYear={effectiveSelectedYear}
                  selectedMonth={selectedMonth}
                  onChangeYear={setSelectedYear}
                  onChangeMonth={setSelectedMonth}
                  availableYears={availableYearsAndMonths.sortedYears}
                />

                {/* KPI Summary Cards */}
                <KpiCards
                  totalDizimos={totalDizimos}
                  countDizimos={dizimosFiltered.length}
                  totalOfertas={totalOfertas}
                  countOfertas={ofertasFiltered.length}
                  totalDespesas={totalDespesas}
                  countDespesas={despesasFiltered.length}
                />

                {/* Financial Visual Charts (lazy-loaded for bundle optimization) */}
                <Suspense fallback={
                  <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', marginBottom: '28px' }}>
                    Carregando gráficos…
                  </div>
                }>
                  <FinancialCharts
                    dizimosMonth={dizimosFiltered}
                    ofertasMonth={ofertasFiltered}
                    despesasMonth={despesasFiltered}
                    totalDizimos={totalDizimos}
                    totalOfertas={totalOfertas}
                    totalDespesas={totalDespesas}
                  />
                </Suspense>

                {/* Detailed Data Tables */}
                <TransactionsTable
                  dizimosMonth={dizimosFiltered}
                  ofertasMonth={ofertasFiltered}
                  despesasMonth={despesasFiltered}
                  membrosMap={membrosMap}
                  viewMode={viewMode}
                  isExporting={isExporting}
                />
              </>
            )}

            {/* MAIN TAB 2: CENTRAL DE CADASTROS & LISTAGEM DEDICADA */}
            {mainTab === 'explorer' && (
              <DataExplorer
                membros={membros}
                dizimos={dizimos}
                ofertas={ofertas}
                despesas={despesas}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print" style={{
        textAlign: 'center',
        padding: '20px',
        borderTop: '1px solid var(--border-color)',
        color: 'var(--text-muted)',
        fontSize: '0.8rem'
      }}>
        Gestão Financeira de Igreja • Desenvolvido em React + Vite & API Python (FastAPI / PostgreSQL)
      </footer>

      {/* Api Configuration Modal */}
      <ApiConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onSaved={loadData}
      />

      {/* Printable PDF A4 Report Component */}
      <PrintableReport
        selectedYear={effectiveSelectedYear}
        selectedMonth={selectedMonth}
        dizimosMonth={dizimosFiltered}
        ofertasMonth={ofertasFiltered}
        despesasMonth={despesasFiltered}
        membrosMap={membrosMap}
      />
    </div>
  );
}
