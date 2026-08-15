import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../../services/utils';
import Badge from '../shared/Badge';

/**
 * BalanceSummaryCard Component
 * Card principal de destaque com saldo líquido do período e barra de proporção.
 */
export default function BalanceSummaryCard({
  totalEntradas = 0,
  totalDespesas = 0,
  saldoLiquido = 0,
  periodLabel = ''
}) {
  const isPositivo = saldoLiquido >= 0;
  const totalMovimentado = totalEntradas + totalDespesas;

  const pctEntradas = totalMovimentado > 0 ? Math.round((totalEntradas / totalMovimentado) * 100) : 0;
  const pctDespesas = totalMovimentado > 0 ? Math.round((totalDespesas / totalMovimentado) * 100) : 0;

  return (
    <div className="card" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
      {/* Top Bar inside Card */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--muted)'
        }}>
          {periodLabel ? `Balanço • ${periodLabel}` : 'Balanço Mensal'}
        </span>

        <Badge variant={isPositivo ? 'blue' : 'red'}>
          {isPositivo ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {isPositivo ? 'Superávit' : 'Déficit'}
        </Badge>
      </div>

      {/* Saldo Líquido em Destaque (IBM Plex Mono) */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(1.8rem, 5.5vw, 2.3rem)',
          fontWeight: 700,
          color: isPositivo ? 'var(--text)' : 'var(--red-glow)',
          letterSpacing: '-0.02em',
          lineHeight: 1.15
        }}>
          {formatCurrency(saldoLiquido)}
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
          {isPositivo
            ? 'Resultado positivo após todas as saídas do período'
            : 'As despesas ultrapassaram as receitas no período'}
        </p>
      </div>

      {/* Barra de Proporção Empilhada (Receitas Azul vs Despesas Vermelho) */}
      <div style={{ marginTop: 14 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          marginBottom: 6
        }}>
          <span style={{ color: 'var(--blue-glow)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--blue-glow)' }} />
            Entradas ({pctEntradas}%)
          </span>
          <span style={{ color: 'var(--red-glow)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            Despesas ({pctDespesas}%)
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red-glow)' }} />
          </span>
        </div>

        <div style={{
          height: 8,
          width: '100%',
          background: 'var(--panel-line)',
          borderRadius: 'var(--radius-full)',
          display: 'flex',
          overflow: 'hidden'
        }}>
          <div
            style={{
              width: `${pctEntradas}%`,
              background: 'linear-gradient(90deg, var(--blue) 0%, var(--blue-glow) 100%)',
              transition: 'width var(--transition-normal)'
            }}
            title={`Entradas: ${pctEntradas}%`}
          />
          <div
            style={{
              width: `${pctDespesas}%`,
              background: 'linear-gradient(90deg, var(--red) 0%, var(--red-glow) 100%)',
              transition: 'width var(--transition-normal)'
            }}
            title={`Despesas: ${pctDespesas}%`}
          />
        </div>
      </div>
    </div>
  );
}
