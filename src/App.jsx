import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';

import Navbar from './components/Navbar';
import PeriodSelector from './components/PeriodSelector';
import KpiCards from './components/KpiCards';
import FinancialCharts from './components/FinancialCharts';
import TransactionsTable from './components/TransactionsTable';
import DataExplorer from './components/DataExplorer';
import ApiConfigModal from './components/ApiConfigModal';
import PrintableReport from './components/PrintableReport';

import { fetchAllFinancialData } from './services/api';
import { isSameMonthAndYear } from './services/utils';

export default function App() {
  const currentDate = new Date();
  
  // Main Top Tab ('dashboard' | 'explorer')
  const [mainTab, setMainTab] = useState('dashboard');
  
  // Period View Mode ('month' | 'year') - Default to 'month' as requested
  const [viewMode, setViewMode] = useState('month');
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState({ status: 'mock', message: 'Carregando...' });
  
  const [membros, setMembros] = useState([]);
  const [dizimos, setDizimos] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [despesas, setDespesas] = useState([]);

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const dashboardRef = useRef(null);

  // Load financial data
  const loadData = async () => {
    setLoading(true);
    const data = await fetchAllFinancialData();
    setMembros(Array.isArray(data.membros) ? data.membros : []);
    setDizimos(Array.isArray(data.dizimos) ? data.dizimos : []);
    setOfertas(Array.isArray(data.ofertas) ? data.ofertas : []);
    setDespesas(Array.isArray(data.despesas) ? data.despesas : []);
    setConnectionStatus({ status: data.status, message: data.message });
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute available Years present in DB records
  const availableYearsAndMonths = React.useMemo(() => {
    const yearsMap = new Map();
    const allRecords = [...dizimos, ...ofertas, ...despesas];

    allRecords.forEach(item => {
      if (!item || !item.data) return;
      const str = String(item.data).trim().split('T')[0];
      const parts = str.split('-');
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

  // Auto-set selected year to most recent year with data if available
  useEffect(() => {
    if (!loading && availableYearsAndMonths.sortedYears.length > 0) {
      setSelectedYear(availableYearsAndMonths.sortedYears[0]);
    }
  }, [loading, availableYearsAndMonths]);

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

  // Filter datasets based on viewMode ('all' | 'year' | 'month')
  const dizimosFiltered = React.useMemo(() => {
    if (!Array.isArray(dizimos)) return [];
    if (viewMode === 'all') return dizimos;
    return dizimos.filter(item => {
      if (!item || !item.data) return false;
      const str = String(item.data).trim().split('T')[0];
      const parts = str.split('-');
      const y = parseInt(parts[0], 10);
      if (viewMode === 'year') return y === selectedYear;
      return isSameMonthAndYear(item.data, selectedYear, selectedMonth);
    });
  }, [dizimos, viewMode, selectedYear, selectedMonth]);

  const ofertasFiltered = React.useMemo(() => {
    if (!Array.isArray(ofertas)) return [];
    if (viewMode === 'all') return ofertas;
    return ofertas.filter(item => {
      if (!item || !item.data) return false;
      const str = String(item.data).trim().split('T')[0];
      const parts = str.split('-');
      const y = parseInt(parts[0], 10);
      if (viewMode === 'year') return y === selectedYear;
      return isSameMonthAndYear(item.data, selectedYear, selectedMonth);
    });
  }, [ofertas, viewMode, selectedYear, selectedMonth]);

  const despesasFiltered = React.useMemo(() => {
    if (!Array.isArray(despesas)) return [];
    if (viewMode === 'all') return despesas;
    return despesas.filter(item => {
      if (!item || !item.data) return false;
      const str = String(item.data).trim().split('T')[0];
      const parts = str.split('-');
      const y = parseInt(parts[0], 10);
      if (viewMode === 'year') return y === selectedYear;
      return isSameMonthAndYear(item.data, selectedYear, selectedMonth);
    });
  }, [despesas, viewMode, selectedYear, selectedMonth]);

  // Calculate totals for KPI cards
  const totalDizimos = dizimosFiltered.reduce((acc, item) => acc + (Number(item?.valor) || 0), 0);
  const totalOfertas = ofertasFiltered.reduce((acc, item) => acc + (Number(item?.valor) || 0), 0);
  const totalDespesas = despesasFiltered.reduce((acc, item) => acc + (Number(item?.valor) || 0), 0);

  // Export Dashboard as PNG image
  const handleExportPng = async () => {
    if (!dashboardRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: '#0b0f19',
        scale: 2,
        useCORS: true
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="animate-spin" style={{
              width: 36,
              height: 36,
              border: '3px solid var(--border-color)',
              borderTopColor: 'var(--accent-primary)',
              borderRadius: '50%',
              margin: '0 auto 16px auto'
            }}></div>
            <p>Carregando dados da igreja...</p>
          </div>
        ) : (
          <>
            {/* MAIN TAB 1: PAINEL & GRÁFICOS */}
            {mainTab === 'dashboard' && (
              <>
                {/* Period Selector (Visão Geral / Por Ano / Por Mês) */}
                <PeriodSelector 
                  viewMode={viewMode}
                  onChangeViewMode={setViewMode}
                  selectedYear={selectedYear}
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

                {/* Financial Visual Charts */}
                <FinancialCharts 
                  dizimosMonth={dizimosFiltered}
                  ofertasMonth={ofertasFiltered}
                  despesasMonth={despesasFiltered}
                />

                {/* Detailed Data Tables */}
                <TransactionsTable 
                  dizimosMonth={dizimosFiltered}
                  ofertasMonth={ofertasFiltered}
                  despesasMonth={despesasFiltered}
                  membrosMap={membrosMap}
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
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        dizimosMonth={dizimosFiltered}
        ofertasMonth={ofertasFiltered}
        despesasMonth={despesasFiltered}
        membrosMap={membrosMap}
      />
    </div>
  );
}
