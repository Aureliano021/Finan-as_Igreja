import React from 'react';
import { ChevronDown } from 'lucide-react';
import { MONTHS } from '../../services/utils';

/**
 * PeriodPicker Component
 * Barra compacta de seleção de período (Mês/Ano e Modo Mensal/Anual).
 */
export default function PeriodPicker({
  viewMode = 'month', // 'month' | 'year'
  onChangeViewMode,
  selectedYear = 2026,
  selectedMonth = 7,
  onChangeYear,
  onChangeMonth,
  availableYears = [2026, 2025, 2024]
}) {
  const yearsList = Array.isArray(availableYears) && availableYears.length > 0
    ? availableYears
    : [2026, 2025, 2024];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 16
    }}>
      {/* Selects de Mês e Ano */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200 }}>
        {viewMode === 'month' && (
          <div style={{ position: 'relative', flex: 1 }}>
            <select
              value={selectedMonth}
              onChange={(e) => onChangeMonth && onChangeMonth(Number(e.target.value))}
              className="select font-mono"
              style={{
                padding: '8px 28px 8px 12px',
                fontSize: '0.82rem',
                backgroundColor: 'var(--panel)',
                borderColor: 'var(--panel-line)',
                appearance: 'none',
                WebkitAppearance: 'none'
              }}
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--muted)' }} />
          </div>
        )}

        <div style={{ position: 'relative', width: viewMode === 'month' ? 96 : '100%' }}>
          <select
            value={selectedYear}
            onChange={(e) => onChangeYear && onChangeYear(Number(e.target.value))}
            className="select font-mono"
            style={{
              padding: '8px 26px 8px 10px',
              fontSize: '0.82rem',
              backgroundColor: 'var(--panel)',
              borderColor: 'var(--panel-line)',
              appearance: 'none',
              WebkitAppearance: 'none'
            }}
          >
            {yearsList.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--muted)' }} />
        </div>
      </div>

      {/* Pill Toggle: Mensal vs Anual */}
      {onChangeViewMode && (
        <div style={{
          display: 'flex',
          background: 'var(--panel)',
          border: '1px solid var(--panel-line)',
          borderRadius: 'var(--radius-sm)',
          padding: 2
        }}>
          <button
            type="button"
            onClick={() => onChangeViewMode('month')}
            style={{
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: viewMode === 'month' ? 600 : 500,
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              background: viewMode === 'month' ? 'var(--blue-bg)' : 'transparent',
              color: viewMode === 'month' ? 'var(--blue-glow)' : 'var(--muted)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            Mensal
          </button>
          <button
            type="button"
            onClick={() => onChangeViewMode('year')}
            style={{
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: viewMode === 'year' ? 600 : 500,
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              background: viewMode === 'year' ? 'var(--blue-bg)' : 'transparent',
              color: viewMode === 'year' ? 'var(--blue-glow)' : 'var(--muted)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            Anual
          </button>
        </div>
      )}
    </div>
  );
}
