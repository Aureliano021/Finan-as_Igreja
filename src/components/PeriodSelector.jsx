import React from 'react';
import { Calendar, Filter } from 'lucide-react';
import { MONTHS } from '../services/utils';

export default function PeriodSelector({
  viewMode, // 'month' | 'year'
  onChangeViewMode,
  selectedYear,
  selectedMonth,
  onChangeYear,
  onChangeMonth,
  availableYears
}) {
  const yearsList = Array.isArray(availableYears) && availableYears.length > 0 ? availableYears : [2024, 2025, 2026, 2027];

  return (
    <div className="glass-card no-print" style={{
      padding: '16px 20px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px'
    }}>
      {/* Label and Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: '1 1 240px' }}>
        <div style={{
          background: 'rgba(99, 102, 241, 0.15)',
          color: 'var(--accent-primary)',
          padding: '10px',
          borderRadius: '12px',
          flexShrink: 0
        }}>
          <Filter size={20} />
        </div>
        <div style={{ minWidth: 0 }}>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>
            Filtro de Período do Balanço
          </span>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, wordBreak: 'break-word' }}>
            {viewMode === 'year' ? `Acumulado do Ano de ${selectedYear}` : `${MONTHS.find(m => m.value === selectedMonth)?.label || ''} de ${selectedYear}`}
          </h2>
        </div>
      </div>

      {/* Mode Controls Wrapper */}
      <div className="period-controls-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>

        {/* Dynamic Selectors (Placed to the LEFT) */}
        <div className="period-selectors-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {viewMode === 'month' && (
            <select
              className="select-input"
              value={selectedMonth}
              onChange={(e) => onChangeMonth && onChangeMonth(Number(e.target.value))}
              style={{ minWidth: '130px' }}
            >
              {MONTHS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          )}

          <select
            className="select-input"
            value={selectedYear}
            onChange={(e) => onChangeYear && onChangeYear(Number(e.target.value))}
            style={{ minWidth: '95px' }}
          >
            {yearsList.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Fixed Width Pill Selector (Placed to the RIGHT) */}
        <div className="tab-list" role="tablist" aria-label="Modo de Visualização do Período" style={{ flex: '0 0 auto', width: '280px' }}>
          <button
            role="tab"
            aria-selected={viewMode === 'month'}
            className={`tab-button ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => onChangeViewMode('month')}
            style={{ whiteSpace: 'nowrap' }}
          >
            <Calendar size={14} />
            Visão Mensal
          </button>

          <button
            role="tab"
            aria-selected={viewMode === 'year'}
            className={`tab-button ${viewMode === 'year' ? 'active' : ''}`}
            onClick={() => onChangeViewMode('year')}
            style={{ whiteSpace: 'nowrap' }}
          >
            <Calendar size={14} />
            Visão Anual
          </button>
        </div>
      </div>
    </div>
  );
}
