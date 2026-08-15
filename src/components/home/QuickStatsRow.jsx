import React from 'react';
import { HeartHandshake, Gift, CreditCard } from 'lucide-react';
import { formatCurrency } from '../../services/utils';

/**
 * QuickStatsRow Component
 * Grid compacto com os 3 pilares financeiros: Dízimos, Ofertas e Despesas.
 */
export default function QuickStatsRow({
  totalDizimos = 0,
  countDizimos = 0,
  totalOfertas = 0,
  countOfertas = 0,
  totalDespesas = 0,
  countDespesas = 0
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: 12
    }}>
      {/* 1. Dízimos */}
      <div className="card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Dízimos
          </span>
          <div style={{
            background: 'var(--blue-bg)',
            color: 'var(--blue-glow)',
            padding: 5,
            borderRadius: 'var(--radius-xs)',
            display: 'flex'
          }}>
            <HeartHandshake size={14} />
          </div>
        </div>

        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '1.15rem',
          fontWeight: 700,
          color: 'var(--text)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {formatCurrency(totalDizimos)}
        </div>

        <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: 2, display: 'block' }}>
          {countDizimos} lançamento{countDizimos !== 1 ? 's' : ''}
        </span>
      </div>

      {/* 2. Ofertas */}
      <div className="card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Ofertas
          </span>
          <div style={{
            background: 'var(--blue-bg)',
            color: 'var(--blue-glow)',
            padding: 5,
            borderRadius: 'var(--radius-xs)',
            display: 'flex'
          }}>
            <Gift size={14} />
          </div>
        </div>

        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '1.15rem',
          fontWeight: 700,
          color: 'var(--text)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {formatCurrency(totalOfertas)}
        </div>

        <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: 2, display: 'block' }}>
          {countOfertas} oferta{countOfertas !== 1 ? 's' : ''}
        </span>
      </div>

      {/* 3. Despesas */}
      <div className="card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Despesas
          </span>
          <div style={{
            background: 'var(--red-bg)',
            color: 'var(--red-glow)',
            padding: 5,
            borderRadius: 'var(--radius-xs)',
            display: 'flex'
          }}>
            <CreditCard size={14} />
          </div>
        </div>

        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '1.15rem',
          fontWeight: 700,
          color: 'var(--red-glow)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {formatCurrency(totalDespesas)}
        </div>

        <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: 2, display: 'block' }}>
          {countDespesas} despesa{countDespesas !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
