import React from 'react';
import { formatCurrency } from '../../services/utils';
import Badge from '../shared/Badge';

/**
 * IncomeVsExpense Component
 * Visão analítica de balanço com métricas de médias e taxa de superávit.
 */
export default function IncomeVsExpense({
  totalDizimos = 0,
  countDizimos = 0,
  totalOfertas = 0,
  countOfertas = 0,
  totalDespesas = 0,
  countDespesas = 0
}) {
  const totalEntradas = totalDizimos + totalOfertas;
  const saldoLiquido = totalEntradas - totalDespesas;
  const isPositivo = saldoLiquido >= 0;

  // Ticket Médio
  const mediaDizimo = countDizimos > 0 ? totalDizimos / countDizimos : 0;
  const mediaOferta = countOfertas > 0 ? totalOfertas / countOfertas : 0;
  const mediaDespesa = countDespesas > 0 ? totalDespesas / countDespesas : 0;

  // Taxa de Retenção / Margem Operacional
  const taxaRetencao = totalEntradas > 0 ? Math.round((saldoLiquido / totalEntradas) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Card 1: Demonstrativo de Resultado */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase' }}>
            Demonstrativo de Resultado
          </span>
          <Badge variant={isPositivo ? 'blue' : 'red'}>
            {isPositivo ? 'Superávit' : 'Déficit'}
          </Badge>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Linha 1: Total Receitas */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg)',
            border: '1px solid var(--panel-line)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue-glow)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>Receitas Totais</span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--blue-glow)' }}>
              + {formatCurrency(totalEntradas)}
            </span>
          </div>

          {/* Linha 2: Total Despesas */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg)',
            border: '1px solid var(--panel-line)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red-glow)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>Despesas Pagas</span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--red-glow)' }}>
              - {formatCurrency(totalDespesas)}
            </span>
          </div>

          {/* Linha 3: Saldo Final */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            background: isPositivo ? 'var(--blue-bg)' : 'var(--red-bg)',
            border: `1px solid ${isPositivo ? 'var(--blue-border)' : 'var(--red-border)'}`,
            marginTop: 4
          }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>
              Resultado Líquido
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              fontSize: '1.1rem',
              color: isPositivo ? 'var(--blue-glow)' : 'var(--red-glow)'
            }}>
              {formatCurrency(saldoLiquido)}
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Indicadores & Médias */}
      <div className="card" style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '0.95rem', marginBottom: 14 }}>Indicadores do Período</h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* Média Dízimo */}
          <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-line)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: 4 }}>
              MÉDIA POR DÍZIMO
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>
              {formatCurrency(mediaDizimo)}
            </span>
          </div>

          {/* Média Oferta */}
          <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-line)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: 4 }}>
              MÉDIA POR OFERTA
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>
              {formatCurrency(mediaOferta)}
            </span>
          </div>

          {/* Média Despesa */}
          <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-line)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: 4 }}>
              MÉDIA POR DESPESA
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--red-glow)' }}>
              {formatCurrency(mediaDespesa)}
            </span>
          </div>

          {/* Taxa de Retenção */}
          <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-line)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: 4 }}>
              TAXA DE RETENÇÃO
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: isPositivo ? 'var(--blue-glow)' : 'var(--red-glow)'
            }}>
              {taxaRetencao}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
