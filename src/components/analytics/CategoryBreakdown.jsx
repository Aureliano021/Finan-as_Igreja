import React, { useMemo } from 'react';
import { Layers } from 'lucide-react';
import { formatCurrency, categorizeExpense, getRecordValue } from '../../services/utils';

const CATEGORY_PALETTE = [
  '#e63946', // Vermelho IMW
  '#2f6fed', // Azul IMW
  '#ff9f1c', // Laranja
  '#a78bfa', // Violeta
  '#2ec4b6', // Ciano
  '#f72585', // Rosa
  '#6b7a99'  // Neutro
];

/**
 * CategoryBreakdown Component
 * Análise detalhada da estrutura de custos da congregação.
 */
export default function CategoryBreakdown({
  despesas = [],
  totalDespesas = 0
}) {
  const categories = useMemo(() => {
    if (!Array.isArray(despesas) || despesas.length === 0 || totalDespesas <= 0) return [];

    const map = {};
    despesas.forEach((item) => {
      if (!item) return;
      const desc = item.nome || item.descricao || 'Diversos';
      const category = categorizeExpense(desc);
      const val = getRecordValue(item);

      if (!map[category]) {
        map[category] = { total: 0, count: 0, items: [] };
      }
      map[category].total += val;
      map[category].count += 1;
      map[category].items.push({ name: desc, value: val });
    });

    return Object.keys(map)
      .map((cat) => ({
        name: cat,
        total: map[cat].total,
        count: map[cat].count,
        percent: (map[cat].total / totalDespesas) * 100
      }))
      .sort((a, b) => b.total - a.total);
  }, [despesas, totalDespesas]);

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={18} className="text-red-glow" />
          <h3 style={{ fontSize: '1rem', margin: 0 }}>Distribuição de Gastos</h3>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
          {categories.length} categoria{categories.length !== 1 ? 's' : ''}
        </span>
      </div>

      {categories.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {categories.map((cat, idx) => {
            const color = CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length];

            return (
              <div key={cat.name} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{cat.name}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                      ({cat.count}x)
                    </span>
                  </div>

                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text)' }}>
                    {formatCurrency(cat.total)}{' '}
                    <span style={{ color: 'var(--muted)', fontWeight: 500, fontSize: '0.75rem' }}>
                      ({Math.round(cat.percent)}%)
                    </span>
                  </span>
                </div>

                {/* Progress bar estilizada */}
                <div style={{
                  height: 6,
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--panel-line)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${cat.percent}%`,
                    background: color,
                    borderRadius: 'var(--radius-full)',
                    transition: 'width var(--transition-normal)'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: '28px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>
          Nenhuma despesa para analisar no período selecionado.
        </div>
      )}
    </div>
  );
}
