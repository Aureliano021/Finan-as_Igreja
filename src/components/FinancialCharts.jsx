import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency, categorizeExpense } from '../services/utils';
import { BarChart3, PieChart as PieIcon } from 'lucide-react';

// Semantically distinct color palette for expense categories
const PIE_COLORS = ['#1565c0', '#c62828', '#2e7d32', '#e65100', '#6a1b9a', '#00695c', '#f9a825', '#0277bd'];

// Custom Tooltip component extracted outside to avoid re-creation on render
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#ffffff',
        border: '1px solid #0f172a',
        padding: '10px 14px',
        borderRadius: '8px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
        fontSize: '0.85rem'
      }}>
        <p style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>{label || payload[0].name}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ margin: '4px 0 0 0', fontWeight: 600, color: '#0f172a' }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function FinancialCharts({ dizimosMonth = [], ofertasMonth = [], despesasMonth = [], totalDizimos = 0, totalOfertas = 0, totalDespesas = 0 }) {
  const safeDizimos = Array.isArray(dizimosMonth) ? dizimosMonth : [];
  const safeOfertas = Array.isArray(ofertasMonth) ? ofertasMonth : [];
  const safeDespesas = Array.isArray(despesasMonth) ? despesasMonth : [];

  // Use pre-computed totals from App.jsx — no duplicate reduction
  const totalEntradas = totalDizimos + totalOfertas;

  // Categorized expenses list (Memoized for performance)
  const expenseCategoriesList = React.useMemo(() => {
    const expenseCategoriesMap = {};
    safeDespesas.forEach(item => {
      if (!item) return;
      const category = categorizeExpense(item.nome);
      const val = Number(item.valor) || 0;
      expenseCategoriesMap[category] = (expenseCategoriesMap[category] || 0) + val;
    });

    return Object.keys(expenseCategoriesMap).map(cat => ({
      name: cat,
      value: expenseCategoriesMap[cat],
      percent: totalDespesas > 0 ? (expenseCategoriesMap[cat] / totalDespesas) * 100 : 0
    })).sort((a, b) => b.value - a.value);
  }, [safeDespesas, totalDespesas]);

  // Data for Recharts Bar Chart - Semantically colored bars (Memoized)
  const comparisonData = React.useMemo(() => [
    { name: 'Dízimos', valor: totalDizimos, fill: '#1565c0' },
    { name: 'Ofertas', valor: totalOfertas, fill: '#2e7d32' },
    { name: 'Total Entradas', valor: totalEntradas, fill: '#0277bd' },
    { name: 'Total Saídas', valor: totalDespesas, fill: '#c62828' }
  ], [totalDizimos, totalOfertas, totalEntradas, totalDespesas]);

  // Percentages for mobile proportion bar (Memoized)
  const { pctDizimos, pctOfertas, pctDespesas } = React.useMemo(() => {
    const totalMovimentado = totalEntradas + totalDespesas;
    return {
      pctDizimos: totalMovimentado > 0 ? Math.round((totalDizimos / totalMovimentado) * 100) : 0,
      pctOfertas: totalMovimentado > 0 ? Math.round((totalOfertas / totalMovimentado) * 100) : 0,
      pctDespesas: totalMovimentado > 0 ? Math.round((totalDespesas / totalMovimentado) * 100) : 0
    };
  }, [totalEntradas, totalDespesas, totalDizimos, totalOfertas]);

  return (
    <div className="no-print" style={{ marginBottom: '28px' }}>

      {/* MOBILE-AUTOMATIC VIEW: SIMPLIFIED COMPACT PROGRESS & CATEGORIES */}
      <div className="mobile-charts-view">
        {/* Card 1: Proportion Bar Entradas vs Saídas */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={16} color="#0f172a" />
              <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a' }}>
                Proporção de Receitas e Despesas
              </h3>
            </div>
          </div>

          {/* Stacked Progress Bar */}
          <div style={{
            height: '12px',
            width: '100%',
            background: '#e2e8f0',
            borderRadius: '999px',
            display: 'flex',
            overflow: 'hidden',
            marginBottom: '12px'
          }}>
            <div style={{ width: `${pctDizimos}%`, background: '#0f172a' }} title={`Dízimos: ${pctDizimos}%`} />
            <div style={{ width: `${pctOfertas}%`, background: '#334155' }} title={`Ofertas: ${pctOfertas}%`} />
            <div style={{ width: `${pctDespesas}%`, background: '#64748b' }} title={`Despesas: ${pctDespesas}%`} />
          </div>

          {/* Legend Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0f172a', display: 'inline-block' }}></span>
                Dízimos
              </span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>
                {formatCurrency(totalDizimos)} <span style={{ color: '#64748b', fontWeight: 400, fontSize: '0.72rem' }}>({pctDizimos}%)</span>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#334155', display: 'inline-block' }}></span>
                Ofertas
              </span>
              <span style={{ fontWeight: 700, color: '#334155' }}>
                {formatCurrency(totalOfertas)} <span style={{ color: '#64748b', fontWeight: 400, fontSize: '0.72rem' }}>({pctOfertas}%)</span>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#64748b', display: 'inline-block' }}></span>
                Despesas Pagas
              </span>
              <span style={{ fontWeight: 700, color: '#64748b' }}>
                {formatCurrency(totalDespesas)} <span style={{ color: '#64748b', fontWeight: 400, fontSize: '0.72rem' }}>({pctDespesas}%)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Categories Breakdown with Mini Progress Bars */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <PieIcon size={16} color="#0f172a" />
            <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a' }}>
              Despesas por Categoria
            </h3>
          </div>

          {expenseCategoriesList.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {expenseCategoriesList.map((cat, idx) => (
                <div key={`cat-${idx}`} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                    <span style={{ color: '#0f172a', fontWeight: 600 }}>{cat.name}</span>
                    <span style={{ color: '#334155', fontWeight: 700 }}>
                      {formatCurrency(cat.value)} <span style={{ fontSize: '0.7rem', color: '#64748b' }}>({Math.round(cat.percent)}%)</span>
                    </span>
                  </div>
                  <div style={{ height: '5px', width: '100%', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${cat.percent}%`,
                      background: PIE_COLORS[idx % PIE_COLORS.length],
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '20px 0', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
              Nenhuma despesa lançada neste período.
            </div>
          )}
        </div>
      </div>

      {/* DESKTOP-AUTOMATIC VIEW: RECHARTS INTERACTIVE GRAPHICS */}
      <div className="desktop-charts-view">
        {/* 1. Bar Chart */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <BarChart3 size={18} color="#0f172a" />
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>
              Comparativo de Balanço
            </h3>
          </div>
          <div style={{ width: '100%', height: 240 }} role="img" aria-label="Gráfico comparativo de balanço financeiro entre dízimos, ofertas e despesas">
            <ResponsiveContainer>
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickFormatter={(v) => `R$${v}`}
                  domain={[0, (dataMax) => (dataMax === 0 ? 100 : Math.ceil(dataMax * 1.1))]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Donut Chart & Category Breakdown */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <PieIcon size={18} color="#0f172a" />
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>
              Distribuição de Despesas
            </h3>
          </div>
          {expenseCategoriesList.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', height: 240 }}>
              {/* Donut Graphic */}
              <div style={{ width: '180px', height: '100%', flexShrink: 0 }} role="img" aria-label="Gráfico de rosca da distribuição de despesas por categoria">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Pie
                      data={expenseCategoriesList}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {expenseCategoriesList.map((entry, index) => (
                        <Cell key={`cell-exp-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Side Category Breakdown List */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '230px', paddingRight: '4px' }}>
                {expenseCategoriesList.map((cat, idx) => (
                  <div key={`desktop-cat-${idx}`} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: 600 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[idx % PIE_COLORS.length], display: 'inline-block' }}></span>
                        {cat.name}
                      </span>
                      <span style={{ color: '#334155', fontWeight: 700 }}>
                        {formatCurrency(cat.value)} <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>({Math.round(cat.percent)}%)</span>
                      </span>
                    </div>
                    <div style={{ height: '5px', width: '100%', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${cat.percent}%`,
                        background: PIE_COLORS[idx % PIE_COLORS.length],
                        borderRadius: '4px'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.9rem' }}>
              Nenhuma despesa registrada neste período.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
