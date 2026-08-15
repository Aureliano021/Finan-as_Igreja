import React from 'react';
import { formatCurrency, formatDateBR, getRecordValue, getRecordDate } from '../../services/utils';

/**
 * PrintableReport Component
 * Relatório formatado para impressão em papel A4 e exportação em imagem PNG.
 */
export default function PrintableReport({
  periodLabel = '',
  totalEntradas = 0,
  totalDespesas = 0,
  saldoLiquido = 0,
  dizimos = [],
  ofertas = [],
  despesas = [],
  membrosMap = {}
}) {
  return (
    <div
      id="printable-report"
      className="printable-report-content"
      style={{
        display: 'none',
        backgroundColor: '#ffffff',
        color: '#111827',
        padding: '32px 36px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        boxSizing: 'border-box',
        width: '800px'
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '2px solid #2f6fed', paddingBottom: 16, marginBottom: 20 }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>
          IGREJA METODISTA WESLEYANA ITUPEVA
        </h1>
        <h2 style={{ fontSize: '13px', fontWeight: 600, margin: '6px 0 0 0', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Prestação de Contas & Relatório Financeiro • {periodLabel}
        </h2>
      </div>

      {/* Quadro Resumo */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '24px',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '14px'
      }}>
        <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: '10px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Entradas Totais</span>
          <p style={{ fontSize: '16px', fontWeight: 700, margin: '4px 0 0 0', color: '#2563eb' }}>
            {formatCurrency(totalEntradas)}
          </p>
        </div>

        <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: '10px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Despesas Pagas</span>
          <p style={{ fontSize: '16px', fontWeight: 700, margin: '4px 0 0 0', color: '#dc2626' }}>
            {formatCurrency(totalDespesas)}
          </p>
        </div>

        <div>
          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Resultado Líquido</span>
          <p style={{ fontSize: '16px', fontWeight: 700, margin: '4px 0 0 0', color: saldoLiquido >= 0 ? '#16a34a' : '#dc2626' }}>
            {formatCurrency(saldoLiquido)}
          </p>
        </div>
      </div>

      {/* Dízimos */}
      <div style={{ marginBottom: '22px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 700, borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '10px', color: '#1e293b' }}>
          1. Dízimos dos Membros ({dizimos.length} lançamentos)
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'left', color: '#334155' }}>Data</th>
              <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'left', color: '#334155' }}>Membro Contribuinte</th>
              <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'right', color: '#334155' }}>Valor</th>
            </tr>
          </thead>
          <tbody>
            {dizimos.map((d) => {
              const member = membrosMap[d.membro_id];
              const memberName = typeof member === 'object' ? (member.nome || '') : String(member || `Membro #${d.membro_id}`);
              return (
                <tr key={d.id}>
                  <td style={{ border: '1px solid #e2e8f0', padding: '6px 10px', color: '#475569' }}>{formatDateBR(getRecordDate(d))}</td>
                  <td style={{ border: '1px solid #e2e8f0', padding: '6px 10px', fontWeight: 600, color: '#1e293b' }}>{memberName}</td>
                  <td style={{ border: '1px solid #e2e8f0', padding: '6px 10px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>{formatCurrency(getRecordValue(d))}</td>
                </tr>
              );
            })}
            {dizimos.length === 0 && (
              <tr>
                <td colSpan={3} style={{ border: '1px solid #e2e8f0', padding: '10px', textAlign: 'center', color: '#94a3b8' }}>
                  Nenhum dízimo no período.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Ofertas */}
      <div style={{ marginBottom: '22px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 700, borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '10px', color: '#1e293b' }}>
          2. Ofertas de Culto ({ofertas.length} registros)
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'left', color: '#334155' }}>Data</th>
              <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'left', color: '#334155' }}>Descrição</th>
              <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'right', color: '#334155' }}>Valor</th>
            </tr>
          </thead>
          <tbody>
            {ofertas.map((o) => (
              <tr key={o.id}>
                <td style={{ border: '1px solid #e2e8f0', padding: '6px 10px', color: '#475569' }}>{formatDateBR(getRecordDate(o))}</td>
                <td style={{ border: '1px solid #e2e8f0', padding: '6px 10px', fontWeight: 600, color: '#1e293b' }}>Oferta de Culto / Campanha</td>
                <td style={{ border: '1px solid #e2e8f0', padding: '6px 10px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>{formatCurrency(getRecordValue(o))}</td>
              </tr>
            ))}
            {ofertas.length === 0 && (
              <tr>
                <td colSpan={3} style={{ border: '1px solid #e2e8f0', padding: '10px', textAlign: 'center', color: '#94a3b8' }}>
                  Nenhuma oferta no período.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Despesas */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 700, borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '10px', color: '#1e293b' }}>
          3. Despesas e Pagamentos ({despesas.length} itens)
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'left', color: '#334155' }}>Data</th>
              <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'left', color: '#334155' }}>Descrição da Despesa</th>
              <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'right', color: '#334155' }}>Valor</th>
            </tr>
          </thead>
          <tbody>
            {despesas.map((desp) => (
              <tr key={desp.id}>
                <td style={{ border: '1px solid #e2e8f0', padding: '6px 10px', color: '#475569' }}>{formatDateBR(getRecordDate(desp))}</td>
                <td style={{ border: '1px solid #e2e8f0', padding: '6px 10px', fontWeight: 600, color: '#1e293b' }}>{desp.nome || desp.descricao || 'Despesa'}</td>
                <td style={{ border: '1px solid #e2e8f0', padding: '6px 10px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>{formatCurrency(getRecordValue(desp))}</td>
              </tr>
            ))}
            {despesas.length === 0 && (
              <tr>
                <td colSpan={3} style={{ border: '1px solid #e2e8f0', padding: '10px', textAlign: 'center', color: '#94a3b8' }}>
                  Nenhuma despesa no período.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
