import React from 'react';
import { TrendingUp, HeartHandshake, Gift, CreditCard, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../services/utils';

export default function KpiCards({ totalDizimos, countDizimos, totalOfertas, countOfertas, totalDespesas, countDespesas }) {
  const totalEntradas = totalDizimos + totalOfertas;
  const saldoLiquido = totalEntradas - totalDespesas;
  const isPositivo = saldoLiquido >= 0;

  return (
    <div className="kpi-cards-grid" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '28px'
    }}>
      {/* 1. Total Entradas */}
      <div className="glass-card kpi-card" style={{
        padding: '16px',
        borderLeft: '4px solid #1565c0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span className="kpi-card-title" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
            Total Entradas
          </span>
          <div className="kpi-card-icon" style={{
            background: 'rgba(21, 101, 192, 0.12)',
            color: '#1565c0',
            padding: '7px',
            borderRadius: '10px'
          }}>
            <TrendingUp size={17} />
          </div>
        </div>
        <div className="kpi-card-value" style={{ fontSize: 'clamp(1.15rem, 3.5vw, 1.5rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {formatCurrency(totalEntradas)}
        </div>
        <span className="kpi-card-subtext" style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
          Dízimos + Ofertas
        </span>
      </div>

      {/* 2. Dízimos */}
      <div className="glass-card kpi-card" style={{
        padding: '16px',
        borderLeft: '4px solid #059669'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span className="kpi-card-title" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
            Total Dízimos
          </span>
          <div className="kpi-card-icon" style={{
            background: 'rgba(5, 150, 105, 0.12)',
            color: '#059669',
            padding: '7px',
            borderRadius: '10px'
          }}>
            <HeartHandshake size={17} />
          </div>
        </div>
        <div className="kpi-card-value" style={{ fontSize: 'clamp(1.15rem, 3.5vw, 1.5rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {formatCurrency(totalDizimos)}
        </div>
        <span className="kpi-card-subtext" style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
          {countDizimos} dízimo(s)
        </span>
      </div>

      {/* 3. Ofertas */}
      <div className="glass-card kpi-card" style={{
        padding: '16px',
        borderLeft: '4px solid #4f46e5'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span className="kpi-card-title" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
            Total Ofertas
          </span>
          <div className="kpi-card-icon" style={{
            background: 'rgba(79, 70, 229, 0.12)',
            color: '#4f46e5',
            padding: '7px',
            borderRadius: '10px'
          }}>
            <Gift size={17} />
          </div>
        </div>
        <div className="kpi-card-value" style={{ fontSize: 'clamp(1.15rem, 3.5vw, 1.5rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {formatCurrency(totalOfertas)}
        </div>
        <span className="kpi-card-subtext" style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
          {countOfertas} oferta(s)
        </span>
      </div>

      {/* 4. Despesas */}
      <div className="glass-card kpi-card" style={{
        padding: '16px',
        borderLeft: '4px solid #e11d48'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span className="kpi-card-title" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
            Total Despesas
          </span>
          <div className="kpi-card-icon" style={{
            background: 'rgba(225, 29, 72, 0.12)',
            color: '#e11d48',
            padding: '7px',
            borderRadius: '10px'
          }}>
            <CreditCard size={17} />
          </div>
        </div>
        <div className="kpi-card-value" style={{ fontSize: 'clamp(1.15rem, 3.5vw, 1.5rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {formatCurrency(totalDespesas)}
        </div>
        <span className="kpi-card-subtext" style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
          {countDespesas} despesa(s)
        </span>
      </div>

      {/* 5. Saldo Líquido */}
      <div className="glass-card kpi-card kpi-card-saldo" style={{
        padding: '16px',
        borderLeft: `4px solid ${isPositivo ? '#059669' : '#e11d48'}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span className="kpi-card-title" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
            Saldo Líquido
          </span>
          <div className="kpi-card-icon" style={{
            background: isPositivo ? 'rgba(5, 150, 105, 0.15)' : 'rgba(225, 29, 72, 0.15)',
            color: isPositivo ? '#059669' : '#e11d48',
            padding: '7px',
            borderRadius: '10px'
          }}>
            <Wallet size={17} />
          </div>
        </div>
        <div className="kpi-card-value" style={{
          fontSize: 'clamp(1.15rem, 3.5vw, 1.5rem)',
          fontWeight: 800,
          color: isPositivo ? '#059669' : '#e11d48',
          letterSpacing: '-0.02em',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {isPositivo ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
          {formatCurrency(saldoLiquido)}
        </div>
        <span className="kpi-card-subtext" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginTop: '4px', display: 'block' }}>
          {isPositivo ? 'Superávit Financeiro' : 'Déficit no Período'}
        </span>
      </div>
    </div>
  );
}
