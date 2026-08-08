import React, { useState } from 'react';
import { HeartHandshake, Gift, CreditCard, Search, User, Calendar, Tag, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { formatCurrency, formatDateBR, categorizeExpense, getRecordValue, getRecordDate } from '../../services/utils';

const PAGE_SIZE = 12;

export default function TransactionsTableDesktop({ 
  dizimosMonth = [], 
  ofertasMonth = [], 
  despesasMonth = [], 
  membrosMap = {},
  viewMode = 'month',
  isExporting = false
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [pageDizimos, setPageDizimos] = useState(1);
  const [pageOfertas, setPageOfertas] = useState(1);
  const [pageDespesas, setPageDespesas] = useState(1);

  const safeDizimos = Array.isArray(dizimosMonth) ? dizimosMonth : [];
  const safeOfertas = Array.isArray(ofertasMonth) ? ofertasMonth : [];
  const safeDespesas = Array.isArray(despesasMonth) ? despesasMonth : [];
  const safeMembrosMap = (membrosMap && typeof membrosMap === 'object') ? membrosMap : {};

  const search = (searchTerm || '').toLowerCase();

  // Search Filtering
  const filteredDizimos = React.useMemo(() => {
    return safeDizimos.filter(item => {
      if (!item) return false;
      const memberObj = safeMembrosMap[item.membro_id];
      const memberName = typeof memberObj === 'object' ? (memberObj.nome || '') : String(memberObj || `Membro ID: ${item.membro_id}`);
      const dateFormatted = formatDateBR(getRecordDate(item));
      return memberName.toLowerCase().includes(search) || dateFormatted.includes(search);
    });
  }, [safeDizimos, safeMembrosMap, search]);

  const filteredOfertas = React.useMemo(() => {
    return safeOfertas.filter(item => {
      if (!item) return false;
      const dateFormatted = formatDateBR(getRecordDate(item));
      const valStr = String(getRecordValue(item));
      const desc = item.culto || item.tipo || item.descricao || 'Oferta';
      return dateFormatted.includes(search) || valStr.includes(search) || desc.toLowerCase().includes(search);
    });
  }, [safeOfertas, search]);

  const filteredDespesas = React.useMemo(() => {
    return safeDespesas.filter(item => {
      if (!item) return false;
      const desc = item.nome || item.descricao || '';
      const dateFormatted = formatDateBR(getRecordDate(item));
      const category = categorizeExpense(desc);
      return desc.toLowerCase().includes(search) || category.toLowerCase().includes(search) || dateFormatted.includes(search);
    });
  }, [safeDespesas, search]);

  // Totals calculations
  const totalDizimosVal = React.useMemo(() => filteredDizimos.reduce((acc, i) => acc + getRecordValue(i), 0), [filteredDizimos]);
  const totalOfertasVal = React.useMemo(() => filteredOfertas.reduce((acc, i) => acc + getRecordValue(i), 0), [filteredOfertas]);
  const totalDespesasVal = React.useMemo(() => filteredDespesas.reduce((acc, i) => acc + getRecordValue(i), 0), [filteredDespesas]);

  const showAll = viewMode === 'month' || isExporting;
  const isYearMode = viewMode === 'year';

  const getPagedList = (list, currentPage) => {
    if (showAll) return list;
    return list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  };

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setPageDizimos(1);
    setPageOfertas(1);
    setPageDespesas(1);
  };

  return (
    <div className="glass-card no-print" style={{ padding: '20px', marginBottom: '28px', width: '100%' }}>
      
      {/* Desktop Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
        gap: '16px',
        marginBottom: '20px',
        paddingBottom: '14px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: '#dbe6f6',
            color: '#0f172a',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileText size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 800 }}>
              Detalhamento de Lançamentos
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {isYearMode ? 'Visão Anual — Dízimos, Ofertas e Despesas' : 'Visão Mensal — Dízimos e Despesas Simultâneos Lado a Lado'}
            </span>
          </div>
        </div>

        {/* Global Search Input */}
        <div style={{ position: 'relative', width: '280px', flexShrink: 0 }}>
          <Search size={15} color="var(--text-muted)" aria-hidden="true" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            name="search-desktop"
            aria-label="Buscar lançamentos"
            autoComplete="off"
            className="text-input"
            style={{ width: '100%', paddingLeft: '36px', fontSize: '0.85rem' }}
            placeholder="Buscar por nome, data ou valor…"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Side-by-Side Multi-Column Desktop Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isYearMode ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
        gap: '20px',
        alignItems: 'start',
        width: '100%'
      }}>

        {/* COLUMN 1: DÍZIMOS */}
        <div style={{
          background: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{
            padding: '12px 16px',
            background: '#f8fafc',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HeartHandshake size={18} color="var(--accent-dizimos)" />
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                Dízimos
              </h4>
              <span className="badge" style={{ background: '#f1f5f9', color: 'var(--text-secondary)' }}>
                {filteredDizimos.length}
              </span>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-dizimos)' }}>
              {formatCurrency(totalDizimosVal)}
            </span>
          </div>

          <div className="data-table-container">
            <table className="data-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Membro Dizimista</th>
                  <th style={{ textAlign: 'right' }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {filteredDizimos.length > 0 ? (
                  getPagedList(filteredDizimos, pageDizimos).map((item, idx) => {
                    const memberObj = safeMembrosMap[item.membro_id];
                    const memberName = typeof memberObj === 'object' ? (memberObj.nome || 'Membro sem nome') : String(memberObj || `ID ${item.membro_id}`);
                    return (
                      <tr key={`dizimo-${item.id || idx}`}>
                        <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} />
                            {formatDateBR(item.data)}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <User size={13} color="var(--accent-dizimos)" />
                            {memberName}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-dizimos)', fontVariantNumeric: 'tabular-nums' }}>
                          {formatCurrency(item.valor)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      Nenhum dízimo registrado no período.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!showAll && filteredDizimos.length > PAGE_SIZE && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Pág. {pageDizimos} de {Math.ceil(filteredDizimos.length / PAGE_SIZE)}</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button disabled={pageDizimos === 1} onClick={() => setPageDizimos(p => Math.max(1, p - 1))} className="btn btn-secondary btn-sm" style={{ padding: '2px 8px' }}><ChevronLeft size={12} /></button>
                <button disabled={pageDizimos >= Math.ceil(filteredDizimos.length / PAGE_SIZE)} onClick={() => setPageDizimos(p => p + 1)} className="btn btn-secondary btn-sm" style={{ padding: '2px 8px' }}><ChevronRight size={12} /></button>
              </div>
            </div>
          )}
        </div>

        {/* COLUMN 2: OFERTAS (Visible only when viewMode === 'year') */}
        {isYearMode && (
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              padding: '12px 16px',
              background: '#f8fafc',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Gift size={18} color="var(--accent-ofertas)" />
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                  Ofertas
                </h4>
                <span className="badge" style={{ background: '#f1f5f9', color: 'var(--text-secondary)' }}>
                  {filteredOfertas.length}
                </span>
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-ofertas)' }}>
                {formatCurrency(totalOfertasVal)}
              </span>
            </div>

            <div className="data-table-container">
              <table className="data-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th style={{ textAlign: 'right' }}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOfertas.length > 0 ? (
                    getPagedList(filteredOfertas, pageOfertas).map((item, idx) => (
                      <tr key={`oferta-${item.id || idx}`}>
                        <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} />
                            {formatDateBR(item.data)}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                          Oferta Geral de Culto
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-ofertas)', fontVariantNumeric: 'tabular-nums' }}>
                          {formatCurrency(item.valor)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        Nenhuma oferta registrada no período.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {!showAll && filteredOfertas.length > PAGE_SIZE && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Pág. {pageOfertas} de {Math.ceil(filteredOfertas.length / PAGE_SIZE)}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button disabled={pageOfertas === 1} onClick={() => setPageOfertas(p => Math.max(1, p - 1))} className="btn btn-secondary btn-sm" style={{ padding: '2px 8px' }}><ChevronLeft size={12} /></button>
                  <button disabled={pageOfertas >= Math.ceil(filteredOfertas.length / PAGE_SIZE)} onClick={() => setPageOfertas(p => p + 1)} className="btn btn-secondary btn-sm" style={{ padding: '2px 8px' }}><ChevronRight size={12} /></button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* COLUMN 3: DESPESAS */}
        <div style={{
          background: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{
            padding: '12px 16px',
            background: '#f8fafc',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} color="var(--accent-expense)" />
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                Despesas
              </h4>
              <span className="badge" style={{ background: '#f1f5f9', color: 'var(--text-secondary)' }}>
                {filteredDespesas.length}
              </span>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-expense)' }}>
              {formatCurrency(totalDespesasVal)}
            </span>
          </div>

          <div className="data-table-container">
            <table className="data-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição / Categoria</th>
                  <th style={{ textAlign: 'right' }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {filteredDespesas.length > 0 ? (
                  getPagedList(filteredDespesas, pageDespesas).map((item, idx) => {
                    const category = categorizeExpense(item.nome);
                    return (
                      <tr key={`despesa-${item.id || idx}`}>
                        <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} />
                            {formatDateBR(item.data)}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {item.nome || 'Despesa sem nome'}
                          </div>
                          <span className="badge" style={{ background: '#f8fafc', color: 'var(--text-muted)', fontSize: '0.7rem', padding: '2px 6px', marginTop: '2px' }}>
                            <Tag size={9} />
                            {category}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-expense)', fontVariantNumeric: 'tabular-nums' }}>
                          {formatCurrency(item.valor)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      Nenhuma despesa registrada no período.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!showAll && filteredDespesas.length > PAGE_SIZE && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Pág. {pageDespesas} de {Math.ceil(filteredDespesas.length / PAGE_SIZE)}</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button disabled={pageDespesas === 1} onClick={() => setPageDespesas(p => Math.max(1, p - 1))} className="btn btn-secondary btn-sm" style={{ padding: '2px 8px' }}><ChevronLeft size={12} /></button>
                <button disabled={pageDespesas >= Math.ceil(filteredDespesas.length / PAGE_SIZE)} onClick={() => setPageDespesas(p => p + 1)} className="btn btn-secondary btn-sm" style={{ padding: '2px 8px' }}><ChevronRight size={12} /></button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
