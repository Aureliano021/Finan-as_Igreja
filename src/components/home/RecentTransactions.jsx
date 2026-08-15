import React, { useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, Clock, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDateBR, getRecordValue, getRecordDate } from '../../services/utils';

/**
 * RecentTransactions Component
 * Lista resumida das últimas transações financeiras na tela inicial.
 */
export default function RecentTransactions({
  dizimos = [],
  ofertas = [],
  despesas = [],
  membrosMap = {},
  onViewAll
}) {
  // Combina e ordena por data decrescente (as 5 mais recentes)
  const recentList = useMemo(() => {
    const safeDizimos = Array.isArray(dizimos) ? dizimos : [];
    const safeOfertas = Array.isArray(ofertas) ? ofertas : [];
    const safeDespesas = Array.isArray(despesas) ? despesas : [];

    const combined = [
      ...safeDizimos.map((d) => {
        const member = membrosMap[d.membro_id];
        const memberName = typeof member === 'object' ? (member.nome || '') : String(member || `Membro #${d.membro_id}`);
        return {
          id: `diz-${d.id}`,
          type: 'dizimo',
          title: `Dízimo • ${memberName}`,
          date: getRecordDate(d),
          value: getRecordValue(d),
          isIncome: true
        };
      }),
      ...safeOfertas.map((o) => ({
        id: `ofe-${o.id}`,
        type: 'oferta',
        title: 'Oferta de Culto',
        date: getRecordDate(o),
        value: getRecordValue(o),
        isIncome: true
      })),
      ...safeDespesas.map((desp) => ({
        id: `desp-${desp.id}`,
        type: 'despesa',
        title: desp.nome || desp.descricao || 'Despesa Geral',
        date: getRecordDate(desp),
        value: getRecordValue(desp),
        isIncome: false
      }))
    ];

    // Ordena do mais recente para o mais antigo
    return combined
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [dizimos, ofertas, despesas, membrosMap]);

  return (
    <div className="card" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={16} className="text-blue-glow" />
          <h3 style={{ fontSize: '0.95rem', margin: 0 }}>Últimas Movimentações</h3>
        </div>

        {onViewAll && recentList.length > 0 && (
          <button
            type="button"
            onClick={onViewAll}
            className="btn-ghost"
            style={{
              fontSize: '0.75rem',
              color: 'var(--blue-glow)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              padding: '4px 6px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Ver todas <ChevronRight size={13} />
          </button>
        )}
      </div>

      {recentList.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {recentList.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg)',
                border: '1px solid var(--panel-line)',
                gap: 12
              }}
            >
              {/* Esquerda: Ícone + Título + Data */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-full)',
                  background: item.isIncome ? 'var(--blue-bg)' : 'var(--red-bg)',
                  border: `1px solid ${item.isIncome ? 'var(--blue-border)' : 'var(--red-border)'}`,
                  color: item.isIncome ? 'var(--blue-glow)' : 'var(--red-glow)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {item.isIncome ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--text)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    margin: 0
                  }}>
                    {item.title}
                  </p>
                  <p style={{
                    fontSize: '0.7rem',
                    color: 'var(--muted)',
                    fontFamily: 'var(--font-mono)',
                    margin: '2px 0 0 0'
                  }}>
                    {formatDateBR(item.date)}
                  </p>
                </div>
              </div>

              {/* Direita: Valor em IBM Plex Mono */}
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.88rem',
                fontWeight: 700,
                color: item.isIncome ? 'var(--blue-glow)' : 'var(--red-glow)',
                flexShrink: 0,
                textAlign: 'right'
              }}>
                {item.isIncome ? '+' : '-'}{formatCurrency(item.value)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '0.82rem' }}>
          Nenhuma movimentação registrada no período selecionado.
        </div>
      )}
    </div>
  );
}
