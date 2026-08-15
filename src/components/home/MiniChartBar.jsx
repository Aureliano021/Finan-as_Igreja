import React, { useMemo } from 'react';
import { Layers } from 'lucide-react';
import { formatCurrency, categorizeExpense, getRecordValue } from '../../services/utils';

// Paleta semântica em tons escuros e azuis/vermelhos para categorias
const CATEGORY_COLORS = [
  '#e63946', // Vermelho IMW
  '#2f6fed', // Azul IMW
  '#ff9f1c', // Laranja
  '#a78bfa', // Violeta
  '#2ec4b6', // Ciano / Esmeralda
  '#f72585', // Rosa
  '#6b7a99'  // Neutro
];

/**
 * MiniChartBar Component
 * Distribuição nativa de despesas por categoria sem necessidade de bibliotecas pesadas no mobile.
 */
export default function MiniChartBar({
  despesas = [],
  totalDespesas = 0
}) {
  const categoryList = useMemo(() => {
    if (!Array.isArray(despesas) || despesas.length === 0 || totalDespesas <= 0) return [];

    const map = {};
    despesas.forEach((item) => {
      if (!item) return;
      const desc = item.nome || item.descricao || 'Diversos';
      const category = categorizeExpense(desc);
      const val = getRecordValue(item);
      map[category] = (map[category] || 0) + val;
    });

    return Object.keys(map)
      .map((cat) => ({
        name: cat,
        value: map[cat],
        percent: (map[cat] / totalDespesas) * 100
      }))
      .sort((a, b) => b.value - a.value);
  }, [despesas, totalDespesas]);

  return (
    <div className="card" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={16} className="text-red-glow" />
          <h3 style={{ fontSize: '0.95rem', margin: 0 }}>Despesas por Categoria</h3>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
          {categoryList.length} categoria{categoryList.length !== 1 ? 's' : ''}
        </span>
      </div>

      {categoryList.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {categoryList.map((cat, idx) => {
            const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];

            return (
              <div key={cat.name} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
                    {cat.name}
                  </span>

                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text)' }}>
                    {formatCurrency(cat.value)}{' '}
                    <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: '0.72rem' }}>
                      ({Math.round(cat.percent)}%)
                    </span>
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{
                  height: 5,
                  width: '100%',
                  background: 'var(--panel-line)',
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
        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '0.82rem' }}>
          Nenhuma despesa registrada neste período.
        </div>
      )}
    </div>
  );
}
