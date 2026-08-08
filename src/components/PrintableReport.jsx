import React from 'react';
import { formatCurrency, formatDateBR, MONTHS, getRecordValue, getRecordDate } from '../services/utils';

export default function PrintableReport({ 
  selectedYear = 2026, 
  selectedMonth = 7, 
  dizimosMonth = [], 
  ofertasMonth = [], 
  despesasMonth = [], 
  membrosMap = {} 
}) {
  const safeDizimos = Array.isArray(dizimosMonth) ? dizimosMonth : [];
  const safeOfertas = Array.isArray(ofertasMonth) ? ofertasMonth : [];
  const safeDespesas = Array.isArray(despesasMonth) ? despesasMonth : [];
  const safeMembrosMap = (membrosMap && typeof membrosMap === 'object') ? membrosMap : {};

  const monthName = MONTHS.find(m => m.value === selectedMonth)?.label || '';
  
  const totalDizimos = safeDizimos.reduce((acc, i) => acc + getRecordValue(i), 0);
  const totalOfertas = safeOfertas.reduce((acc, i) => acc + getRecordValue(i), 0);
  const totalEntradas = totalDizimos + totalOfertas;
  const totalDespesas = safeDespesas.reduce((acc, i) => acc + getRecordValue(i), 0);
  const saldoFinal = totalEntradas - totalDespesas;

  return (
    <div className="print-only print-container" style={{ fontFamily: 'sans-serif' }}>
      {/* Printable Header */}
      <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '18pt', margin: 0, textTransform: 'uppercase', color: '#0f172a' }}>
          IGREJA EVANGÉLICA
        </h1>
        <h2 style={{ fontSize: '14pt', margin: '4px 0 0 0', fontWeight: 'normal', color: '#475569' }}>
          Relatório de Prestação de Contas Mensal
        </h2>
        <h3 style={{ fontSize: '12pt', margin: '6px 0 0 0', fontWeight: 'bold', color: '#2563eb' }}>
          Mês de Referência: {monthName} de {selectedYear}
        </h3>
      </div>

      {/* Summary Box */}
      <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '16px', marginBottom: '24px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '11pt', textTransform: 'uppercase', color: '#334155' }}>
          Demonstrativo Sintético do Mês
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '11pt' }}>
          <div>
            <strong>Total de Dízimos:</strong> {formatCurrency(totalDizimos)} ({safeDizimos.length} lançamentos)
          </div>
          <div>
            <strong>Total de Ofertas:</strong> {formatCurrency(totalOfertas)} ({safeOfertas.length} cultos)
          </div>
          <div>
            <strong>Total Entradas (Receitas):</strong> <span style={{ color: '#16a34a' }}>{formatCurrency(totalEntradas)}</span>
          </div>
          <div>
            <strong>Total de Despesas (Saídas):</strong> <span style={{ color: '#dc2626' }}>{formatCurrency(totalDespesas)}</span>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <strong>Saldo Líquido no Período:</strong>{' '}
            <span style={{ fontWeight: 'bold', color: saldoFinal >= 0 ? '#16a34a' : '#dc2626' }}>
              {formatCurrency(saldoFinal)} {saldoFinal >= 0 ? '(Superávit)' : '(Déficit)'}
            </span>
          </div>
        </div>
      </div>

      {/* Section 1: Dízimos */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '12pt', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
          1. Dízimos Recebidos ({monthName}/{selectedYear})
        </h4>
        <table className="print-table">
          <thead>
            <tr>
              <th style={{ width: '15%' }}>Data</th>
              <th>Nome do Membro Dizimista</th>
              <th style={{ width: '25%', textAlign: 'right' }}>Valor (R$)</th>
            </tr>
          </thead>
          <tbody>
            {safeDizimos.length > 0 ? (
              safeDizimos.map((item, idx) => {
                const memberObj = safeMembrosMap[item.membro_id];
                const memberName = typeof memberObj === 'object' ? (memberObj.nome || 'Membro') : String(memberObj || `Membro ID ${item.membro_id}`);
                return (
                  <tr key={`print-dizimo-${item.id || idx}`}>
                    <td>{formatDateBR(item.data)}</td>
                    <td>{memberName}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(item.valor)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center' }}>Sem registros de dízimos neste mês.</td>
              </tr>
            )}
            <tr style={{ fontWeight: 'bold', backgroundColor: '#f1f5f9' }}>
              <td colSpan="2">TOTAL DÍZIMOS</td>
              <td style={{ textAlign: 'right' }}>{formatCurrency(totalDizimos)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 2: Ofertas */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '12pt', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
          2. Ofertas de Culto ({monthName}/{selectedYear})
        </h4>
        <table className="print-table">
          <thead>
            <tr>
              <th style={{ width: '15%' }}>Data</th>
              <th>Descrição do Culto / Reunião</th>
              <th style={{ width: '25%', textAlign: 'right' }}>Valor (R$)</th>
            </tr>
          </thead>
          <tbody>
            {safeOfertas.length > 0 ? (
              safeOfertas.map((item, idx) => (
                <tr key={`print-oferta-${item.id || idx}`}>
                  <td>{formatDateBR(item.data)}</td>
                  <td>Oferta Geral Arrecadada no Culto</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(item.valor)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center' }}>Sem registros de ofertas neste mês.</td>
              </tr>
            )}
            <tr style={{ fontWeight: 'bold', backgroundColor: '#f1f5f9' }}>
              <td colSpan="2">TOTAL OFERTAS</td>
              <td style={{ textAlign: 'right' }}>{formatCurrency(totalOfertas)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 3: Despesas */}
      <div style={{ marginBottom: '32px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '12pt', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
          3. Despesas Efetuadas ({monthName}/{selectedYear})
        </h4>
        <table className="print-table">
          <thead>
            <tr>
              <th style={{ width: '15%' }}>Data</th>
              <th>Descrição da Despesa</th>
              <th style={{ width: '25%', textAlign: 'right' }}>Valor (R$)</th>
            </tr>
          </thead>
          <tbody>
            {safeDespesas.length > 0 ? (
              safeDespesas.map((item, idx) => (
                <tr key={`print-despesa-${item.id || idx}`}>
                  <td>{formatDateBR(item.data)}</td>
                  <td>{item.nome || 'Despesa'}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(item.valor)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center' }}>Sem despesas efetuadas neste mês.</td>
              </tr>
            )}
            <tr style={{ fontWeight: 'bold', backgroundColor: '#f1f5f9' }}>
              <td colSpan="2">TOTAL DESPESAS</td>
              <td style={{ textAlign: 'right' }}>{formatCurrency(totalDespesas)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Signatures */}
      <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-around', textAlign: 'center', fontSize: '10pt' }}>
        <div style={{ width: '40%' }}>
          <div style={{ borderTop: '1px solid #0f172a', paddingTop: '6px' }}>
            <strong>Tesouraria / Ministério de Finanças</strong><br />
            Responsável pela Prestação de Contas
          </div>
        </div>
        <div style={{ width: '40%' }}>
          <div style={{ borderTop: '1px solid #0f172a', paddingTop: '6px' }}>
            <strong>Pastor Presidente / Conselho Fiscal</strong><br />
            Visto de Aprovação
          </div>
        </div>
      </div>
    </div>
  );
}
