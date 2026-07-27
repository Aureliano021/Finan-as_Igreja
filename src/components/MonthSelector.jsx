import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { MONTHS } from '../services/utils';

export default function MonthSelector({ 
  selectedYear = 2026, 
  selectedMonth = 7, 
  onChangeYear, 
  onChangeMonth, 
  availableYearsMap, 
  availableYears = [] 
}) {
  // Safe extraction of available months for current selected year
  const availableMonthsSet = (availableYearsMap && typeof availableYearsMap.get === 'function')
    ? (availableYearsMap.get(selectedYear) || new Set())
    : new Set();

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      if (typeof onChangeMonth === 'function') onChangeMonth(12);
      if (typeof onChangeYear === 'function') onChangeYear(selectedYear - 1);
    } else {
      if (typeof onChangeMonth === 'function') onChangeMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      if (typeof onChangeMonth === 'function') onChangeMonth(1);
      if (typeof onChangeYear === 'function') onChangeYear(selectedYear + 1);
    } else {
      if (typeof onChangeMonth === 'function') onChangeMonth(selectedMonth + 1);
    }
  };

  const hasDataForSelectedMonth = availableMonthsSet.has(selectedMonth);
  const yearsList = Array.isArray(availableYears) && availableYears.length > 0 ? availableYears : [2024, 2025, 2026, 2027];

  return (
    <div className="glass-card no-print" style={{
      padding: '14px 20px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px'
    }}>
      {/* Label and Month Display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          background: 'rgba(99, 102, 241, 0.15)',
          color: 'var(--accent-primary)',
          padding: '8px',
          borderRadius: '10px'
        }}>
          <Calendar size={20} />
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
            Período Selecionado
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, textTransform: 'capitalize' }}>
              {MONTHS.find(m => m.value === selectedMonth)?.label || 'Julho'} de {selectedYear}
            </h2>
            {hasDataForSelectedMonth && (
              <span className="badge badge-online" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                <CheckCircle size={11} /> Registros encontrados
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {/* Navigation Buttons */}
        <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <button onClick={handlePrevMonth} className="btn btn-secondary btn-sm" style={{ border: 'none', borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)' }} title="Mês Anterior">
            <ChevronLeft size={16} />
          </button>
          
          <button onClick={handleNextMonth} className="btn btn-secondary btn-sm" style={{ border: 'none', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }} title="Próximo Mês">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Select Month Dropdown */}
        <select 
          className="select-input"
          value={selectedMonth}
          onChange={(e) => onChangeMonth && onChangeMonth(Number(e.target.value))}
          style={{ minWidth: '150px' }}
        >
          {MONTHS.map(m => {
            const hasData = availableMonthsSet.has(m.value);
            return (
              <option key={m.value} value={m.value}>
                {m.label} {hasData ? '✓ (com dados)' : ''}
              </option>
            );
          })}
        </select>

        {/* Select Year Dropdown */}
        <select 
          className="select-input"
          value={selectedYear}
          onChange={(e) => onChangeYear && onChangeYear(Number(e.target.value))}
          style={{ minWidth: '100px' }}
        >
          {yearsList.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
