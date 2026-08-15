import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LogOut, RefreshCw, ShieldCheck, Printer, Image, Server, Settings, ArrowRight } from 'lucide-react';
import AppShell from './components/layout/AppShell';
import TopBar from './components/layout/TopBar';
import BottomTabBar from './components/layout/BottomTabBar';
import StatusCard from './components/auth/StatusCard';
import Toast from './components/shared/Toast';
import FAB from './components/launch/FAB';
import LaunchBottomSheet from './components/launch/LaunchBottomSheet';
import ApiConfigSheet from './components/account/ApiConfigSheet';
import PrintableReport from './components/print/PrintableReport';

import BalanceSummaryCard from './components/home/BalanceSummaryCard';
import QuickStatsRow from './components/home/QuickStatsRow';
import MiniChartBar from './components/home/MiniChartBar';
import RecentTransactions from './components/home/RecentTransactions';
import TransactionsList from './components/transactions/TransactionsList';
import IncomeVsExpense from './components/analytics/IncomeVsExpense';
import CategoryBreakdown from './components/analytics/CategoryBreakdown';
import PeriodPicker from './components/shared/PeriodPicker';

import { fetchAllFinancialData } from './services/api';
import { getStoredUser, getUserStatus, setAuth, getStoredToken, logout } from './services/auth';
import { getRecordDate, getRecordValue, parseDateParts, MONTHS } from './services/utils';
import { exportReportCardToPng } from './utils/exportUtils';

/**
 * Filtro de período genérico
 */
function filterByPeriod(items, viewMode, year, month) {
  if (!Array.isArray(items)) return [];
  if (viewMode === 'all') return items;
  return items.filter((item) => {
    const rawDate = getRecordDate(item) || item?.created_at || item?.data_criacao;
    if (!rawDate) return true;
    const { year: itemYear, month: itemMonth } = parseDateParts(rawDate);
    if (!itemYear || !itemMonth) return true;
    if (viewMode === 'year') return itemYear === year;
    return itemYear === year && itemMonth === month;
  });
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'transactions' | 'analytics' | 'account'

  // Período (Padrão: Julho/2026 onde há dados cadastrados)
  const [viewMode, setViewMode] = useState('month');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(7); // Julho

  // Estados de UI e Diálogos
  const [isLaunchOpen, setIsLaunchOpen] = useState(false);
  const [isApiConfigOpen, setIsApiConfigOpen] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: '' }

  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState({ status: 'online', message: '' });

  // Conjuntos de dados
  const [membros, setMembros] = useState([]);
  const [dizimos, setDizimos] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [despesas, setDespesas] = useState([]);

  // Sincroniza usuário em eventos de autenticação
  useEffect(() => {
    const syncUser = () => setCurrentUser(getStoredUser());
    window.addEventListener('auth-change', syncUser);
    window.addEventListener('storage', syncUser);
    return () => {
      window.removeEventListener('auth-change', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);

  // Carrega dados da API backend
  const loadData = useCallback(async () => {
    setLoading(true);

    const safetyTimer = setTimeout(() => {
      setLoading(false);
      setConnectionStatus((prev) => ({
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
        message: data?.message || ''
      });

      // Se a resposta for online com sucesso, sincroniza status aceito
      if (data?.status === 'online') {
        const stored = getStoredUser();
        if (stored && getUserStatus(stored) !== 'aceito') {
          const updatedUser = { ...stored, status: 'aceito' };
          setAuth(getStoredToken(), updatedUser);
          setCurrentUser(updatedUser);
        }
      }
    } catch {
      setConnectionStatus({
        status: 'offline',
        message: 'Ocorreu um erro ao comunicar com a API Backend.'
      });
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Anos disponíveis com dados
  const availableYears = useMemo(() => {
    const yearsSet = new Set([2026, 2025, 2024]);
    [...dizimos, ...ofertas, ...despesas].forEach((item) => {
      const d = getRecordDate(item);
      if (d) {
        const { year } = parseDateParts(d);
        if (year && year > 2000 && year < 2100) yearsSet.add(year);
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [dizimos, ofertas, despesas]);

  // Mapa de membros por ID
  const membrosMap = useMemo(() => {
    const map = {};
    if (Array.isArray(membros)) {
      membros.forEach((m) => {
        if (m && m.id != null) map[m.id] = m;
      });
    }
    return map;
  }, [membros]);

  // Dados filtrados pelo período
  const dizimosFiltered = useMemo(
    () => filterByPeriod(dizimos, viewMode, selectedYear, selectedMonth),
    [dizimos, viewMode, selectedYear, selectedMonth]
  );

  const ofertasFiltered = useMemo(
    () => filterByPeriod(ofertas, viewMode, selectedYear, selectedMonth),
    [ofertas, viewMode, selectedYear, selectedMonth]
  );

  const despesasFiltered = useMemo(
    () => filterByPeriod(despesas, viewMode, selectedYear, selectedMonth),
    [despesas, viewMode, selectedYear, selectedMonth]
  );

  // Cálculos de totais
  const totalDizimos = useMemo(() => dizimosFiltered.reduce((acc, item) => acc + getRecordValue(item), 0), [dizimosFiltered]);
  const totalOfertas = useMemo(() => ofertasFiltered.reduce((acc, item) => acc + getRecordValue(item), 0), [ofertasFiltered]);
  const totalDespesas = useMemo(() => despesasFiltered.reduce((acc, item) => acc + getRecordValue(item), 0), [despesasFiltered]);
  const totalEntradas = totalDizimos + totalOfertas;
  const saldoLiquido = totalEntradas - totalDespesas;

  // Nome do mês / período formatado
  const periodLabel = useMemo(() => {
    if (viewMode === 'year') return `Ano de ${selectedYear}`;
    const mName = MONTHS.find((m) => m.value === selectedMonth)?.label || '';
    return `${mName} ${selectedYear}`;
  }, [viewMode, selectedYear, selectedMonth]);

  const [isExportingPng, setIsExportingPng] = useState(false);

  const handleExportPng = async () => {
    if (isExportingPng) return;
    setIsExportingPng(true);
    setToast({ type: 'success', message: 'Gerando imagem PNG em alta resolução…' });

    try {
      const filename = await exportReportCardToPng(periodLabel);
      setToast({ type: 'success', message: `Relatório exportado como "${filename}" com sucesso!` });
    } catch {
      setToast({ type: 'error', message: 'Não foi possível gerar a imagem PNG do relatório.' });
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleLaunchSuccess = (msg) => {
    setToast({ type: 'success', message: msg });
    loadData();
  };

  const handleLaunchError = (msg) => {
    setToast({ type: 'error', message: msg });
  };

  const isUnauth = !currentUser || connectionStatus.status === 'unauthenticated';
  const isPendingOrDenied = connectionStatus.status === 'pending_approval' || (currentUser && getUserStatus(currentUser) !== 'aceito');

  if (isUnauth) {
    return (
      <AppShell
        header={<TopBar title="Finanças IMW" connectionStatus="offline" />}
      >
        <div className="card" style={{ maxWidth: 440, margin: '40px auto', textAlign: 'center', padding: '32px 20px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Autenticação Necessária</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 20 }}>
            Você precisa estar autenticado para visualizar a prestação de contas.
          </p>
          <a href="/login.html" className="btn btn-primary btn-block">
            Fazer Login / Criar Conta
          </a>
        </div>
      </AppShell>
    );
  }

  if (isPendingOrDenied) {
    return (
      <AppShell
        header={<TopBar title="Finanças IMW" user={currentUser} connectionStatus={connectionStatus.status} />}
      >
        <StatusCard
          status={getUserStatus(currentUser)}
          user={currentUser}
          message={connectionStatus.message}
          onRetry={loadData}
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      header={
        <TopBar
          title={
            activeTab === 'home'
              ? 'Finanças IMW'
              : activeTab === 'transactions'
              ? 'Extrato Geral'
              : activeTab === 'analytics'
              ? 'Análise Financeira'
              : 'Minha Conta'
          }
          subtitle={periodLabel}
          user={currentUser}
          connectionStatus={connectionStatus.status === 'online' ? 'online' : 'offline'}
          onRefresh={loadData}
          isRefreshing={loading}
          onAvatarClick={() => setActiveTab('account')}
        />
      }
      fab={
        <FAB
          onClick={() => setIsLaunchOpen(true)}
          ariaLabel="Lançar Dízimo, Oferta ou Despesa"
        />
      }
      navigation={
        <BottomTabBar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
        />
      }
      toast={
        toast ? (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        ) : null
      }
      modal={
        <>
          <LaunchBottomSheet
            isOpen={isLaunchOpen}
            onClose={() => setIsLaunchOpen(false)}
            membros={membros}
            defaultDate={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`}
            onSuccess={handleLaunchSuccess}
            onError={handleLaunchError}
          />

          <ApiConfigSheet
            isOpen={isApiConfigOpen}
            onClose={() => setIsApiConfigOpen(false)}
            onSuccess={(msg) => {
              setToast({ type: 'success', message: msg });
              loadData();
            }}
          />
        </>
      }
    >
      {/* Relatório Imprimível Oculto (visível em modo print) */}
      <PrintableReport
        periodLabel={periodLabel}
        totalEntradas={totalEntradas}
        totalDespesas={totalDespesas}
        saldoLiquido={saldoLiquido}
        dizimos={dizimosFiltered}
        ofertas={ofertasFiltered}
        despesas={despesasFiltered}
        membrosMap={membrosMap}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* TAB 1: HOME / DASHBOARD */}
        {activeTab === 'home' && (
          <>
            <PeriodPicker
              viewMode={viewMode}
              onChangeViewMode={setViewMode}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onChangeYear={setSelectedYear}
              onChangeMonth={setSelectedMonth}
              availableYears={availableYears}
            />

            <BalanceSummaryCard
              totalEntradas={totalEntradas}
              totalDespesas={totalDespesas}
              saldoLiquido={saldoLiquido}
              periodLabel={periodLabel}
            />

            <QuickStatsRow
              totalDizimos={totalDizimos}
              countDizimos={dizimosFiltered.length}
              totalOfertas={totalOfertas}
              countOfertas={ofertasFiltered.length}
              totalDespesas={totalDespesas}
              countDespesas={despesasFiltered.length}
            />

            <MiniChartBar
              despesas={despesasFiltered}
              totalDespesas={totalDespesas}
            />

            <RecentTransactions
              dizimos={dizimosFiltered}
              ofertas={ofertasFiltered}
              despesas={despesasFiltered}
              membrosMap={membrosMap}
              onViewAll={() => setActiveTab('transactions')}
            />
          </>
        )}

        {/* TAB 2: EXTRATO COMPLETO DE TRANSAÇÕES */}
        {activeTab === 'transactions' && (
          <>
            <PeriodPicker
              viewMode={viewMode}
              onChangeViewMode={setViewMode}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onChangeYear={setSelectedYear}
              onChangeMonth={setSelectedMonth}
              availableYears={availableYears}
            />

            <TransactionsList
              dizimos={dizimosFiltered}
              ofertas={ofertasFiltered}
              despesas={despesasFiltered}
              membrosMap={membrosMap}
            />
          </>
        )}

        {/* TAB 3: ANÁLISE E MÉTRICAS */}
        {activeTab === 'analytics' && (
          <>
            <PeriodPicker
              viewMode={viewMode}
              onChangeViewMode={setViewMode}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onChangeYear={setSelectedYear}
              onChangeMonth={setSelectedMonth}
              availableYears={availableYears}
            />

            <IncomeVsExpense
              totalDizimos={totalDizimos}
              countDizimos={dizimosFiltered.length}
              totalOfertas={totalOfertas}
              countOfertas={ofertasFiltered.length}
              totalDespesas={totalDespesas}
              countDespesas={despesasFiltered.length}
            />

            <CategoryBreakdown
              despesas={despesasFiltered}
              totalDespesas={totalDespesas}
            />
          </>
        )}

        {/* TAB 4: CONTA E PREFERÊNCIAS */}
        {activeTab === 'account' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card" style={{ padding: '24px 20px', textAlign: 'center' }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 'var(--radius-full)',
                background: 'var(--panel-elevated)',
                border: '1px solid var(--blue-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: '1.2rem',
                color: 'var(--blue-glow)'
              }}>
                {(currentUser?.nome || 'U').substring(0, 2).toUpperCase()}
              </div>

              <h3 style={{ fontSize: '1.15rem', marginBottom: 4 }}>
                {currentUser?.nome || 'Usuário'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
                {currentUser?.email}
              </p>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--blue-bg)',
                color: 'var(--blue-glow)',
                border: '1px solid var(--blue-border)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)'
              }}>
                <ShieldCheck size={14} />
                Acesso Autorizado
              </div>
            </div>

            <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a
                href="/gerenciar.html"
                className="btn btn-panel"
                style={{ justifyContent: 'space-between' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Settings size={16} className="text-blue-glow" />
                  Central de Gestão e Cadastros
                </span>
                <ArrowRight size={15} style={{ color: 'var(--muted)' }} />
              </a>

              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-panel"
                style={{ justifyContent: 'flex-start', gap: 8 }}
              >
                <Printer size={16} className="text-blue-glow" />
                Imprimir Relatório A4 ({periodLabel})
              </button>

              <button
                type="button"
                onClick={handleExportPng}
                disabled={isExportingPng}
                className="btn btn-panel"
                style={{ justifyContent: 'flex-start', gap: 8 }}
              >
                <Image size={16} className="text-blue-glow" />
                {isExportingPng ? 'Gerando Imagem…' : 'Exportar Relatório em Imagem (PNG)'}
              </button>

              <button
                type="button"
                onClick={() => setIsApiConfigOpen(true)}
                className="btn btn-panel"
                style={{ justifyContent: 'flex-start', gap: 8 }}
              >
                <Server size={16} className="text-blue-glow" />
                Configurar Servidor da API
              </button>

              <button
                type="button"
                onClick={loadData}
                className="btn btn-panel"
                style={{ justifyContent: 'flex-start', gap: 8 }}
              >
                <RefreshCw size={15} />
                Atualizar Dados
              </button>

              <button
                type="button"
                onClick={() => {
                  logout();
                  window.location.href = '/login.html';
                }}
                className="btn btn-danger"
                style={{ marginTop: 8 }}
              >
                <LogOut size={16} />
                Encerrar Sessão
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
