import React, { useState } from 'react';
import { HeartHandshake, Gift, CreditCard, Search, User, Tag, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { formatCurrency, formatDateBR, categorizeExpense } from '../../services/utils';

const PAGE_SIZE = 10;

export default function TransactionsTableMobile({ 
  dizimosMonth = [], 
  ofertasMonth = [], 
  despesasMonth = [], 
  membrosMap = {},
  viewMode = 'month'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileTab, setMobileTab] = useState('dizimos');
  const [pageDizimos, setPageDizimos] = useState(1);
  const [pageOfertas, setPageOfertas] = useState(1);
  const [pageDespesas, setPageDespesas] = useState(1);

  const safeDizimos = Array.isArray(dizimosMonth) ? dizimosMonth : [];
  const safeOfertas = Array.isArray(ofertasMonth) ? ofertasMonth : [];
  const safeDespesas = Array.isArray(despesasMonth) ? despesasMonth : [];
  const safeMembrosMap = (membrosMap && typeof membrosMap === 'object') ? membrosMap : {};

  const search = (searchTerm || '').toLowerCase();
  const isYearMode = viewMode === 'year';

  // Search Filtering
  const filteredDizimos = React.useMemo(() => {
    return safeDizimos.filter(item => {
      if (!item) return false;
      const memberObj = safeMembrosMap[item.membro_id];
      const memberName = typeof memberObj === 'object' ? (memberObj.nome || '') : String(memberObj || `Membro ID: ${item.membro_id}`);
      const dateFormatted = formatDateBR(item.data);
      return memberName.toLowerCase().includes(search) || dateFormatted.includes(search);
    });
  }, [safeDizimos, safeMembrosMap, search]);

  const filteredOfertas = React.useMemo(() => {
    return safeOfertas.filter(item => {
      if (!item) return false;
      const dateFormatted = formatDateBR(item.data);
      const valStr = item.valor != null ? String(item.valor) : '';
      return dateFormatted.includes(search) || valStr.includes(search);
    });
  }, [safeOfertas, search]);

  const filteredDespesas = React.useMemo(() => {
    return safeDespesas.filter(item => {
      if (!item) return false;
      const desc = item.nome || '';
      const dateFormatted = formatDateBR(item.data);
      const category = categorizeExpense(desc);
      return desc.toLowerCase().includes(search) || category.toLowerCase().includes(search) || dateFormatted.includes(search);
    });
  }, [safeDespesas, search]);

  // Totals calculations
  const totalDizimosVal = React.useMemo(() => filteredDizimos.reduce((acc, i) => acc + (Number(i?.valor) || 0), 0), [filteredDizimos]);
  const totalOfertasVal = React.useMemo(() => filteredOfertas.reduce((acc, i) => acc + (Number(i?.valor) || 0), 0), [filteredOfertas]);
  const totalDespesasVal = React.useMemo(() => filteredDespesas.reduce((acc, i) => acc + (Number(i?.valor) || 0), 0), [filteredDespesas]);

  const showAll = viewMode === 'month';

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
    <div className="glass-card no-print" style={{ padding: '14px', marginBottom: '20px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Mobile Card Header */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <FileText size={18} color="var(--accent-primary)" />
          <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 700 }}>
            Lançamentos Financeiros
          </h3>
        </div>

        {/* Mobile Search Bar */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={14} color="var(--text-muted)" aria-hidden="true" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            name="search-mobile"
            aria-label="Buscar lançamentos"
            autoComplete="off"
            className="text-input"
            style={{ width: '100%', paddingLeft: '32px', fontSize: '0.8rem', height: '36px', boxSizing: 'border-box' }}
            placeholder="Buscar por nome ou valor…"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Mobile Segmented Control Tab Switcher */}
      <div style={{ marginBottom: '12px' }}>
        <div className="tab-list" style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '9999px', width: '100%', boxSizing: 'border-box' }}>
          <button
            onClick={() => setMobileTab('dizimos')}
            className={`tab-button ${mobileTab === 'dizimos' ? 'active' : ''}`}
            style={{ padding: '6px 8px', fontSize: '0.78rem', minHeight: '36px', flex: 1, whiteSpace: 'nowrap' }}
          >
            <HeartHandshake size={13} color="var(--accent-dizimos)" />
            Dízimos ({filteredDizimos.length})
          </button>

          {isYearMode && (
            <button
              onClick={() => setMobileTab('ofertas')}
              className={`tab-button ${mobileTab === 'ofertas' ? 'active' : ''}`}
              style={{ padding: '6px 8px', fontSize: '0.78rem', minHeight: '36px', flex: 1, whiteSpace: 'nowrap' }}
            >
              <Gift size={13} color="var(--accent-ofertas)" />
              Ofertas ({filteredOfertas.length})
            </button>
          )}

          <button
            onClick={() => setMobileTab('despesas')}
            className={`tab-button ${mobileTab === 'despesas' ? 'active' : ''}`}
            style={{ padding: '6px 8px', fontSize: '0.78rem', minHeight: '36px', flex: 1, whiteSpace: 'nowrap' }}
          >
            <CreditCard size={13} color="var(--accent-expense)" />
            Despesas ({filteredDespesas.length})
          </button>
        </div>
      </div>

      {/* Active Tab Content (Strictly fits 100% width without sideways scrolling) */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        width: '100%'
      }}>

        {/* TAB 1: DÍZIMOS */}
        {mobileTab === 'dizimos' && (
          <>
            <div style={{ padding: '10px 12px', background: '#f8fafc', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Total Dízimos</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-dizimos)' }}>{formatCurrency(totalDizimosVal)}</span>
            </div>
            <div style={{ width: '100%', overflowX: 'hidden' }}>
              <table style={{ width: '100%', minWidth: 0, tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left', width: '65%', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 700 }}>Membro Dizimista</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', width: '35%', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 700 }}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDizimos.length > 0 ? (
                    getPagedList(filteredDizimos, pageDizimos).map((item, idx) => {
                      const memberObj = safeMembrosMap[item.membro_id];
                      const memberName = typeof memberObj === 'object' ? (memberObj.nome || 'Membro sem nome') : String(memberObj || `ID ${item.membro_id}`);
                      return (
                        <tr key={`mob-dizimo-${item.id || idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '9px 10px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                              <User size={13} color="var(--accent-dizimos)" style={{ flexShrink: 0 }} />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{memberName}</span>
                            </span>
                          </td>
                          <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 700, color: 'var(--accent-dizimos)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                            {formatCurrency(item.valor)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="2" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                        Nenhum dízimo encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {!showAll && filteredDizimos.length > PAGE_SIZE && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderTop: '1px solid var(--border-color)', fontSize: '0.72rem' }}>
                <span>Pág. {pageDizimos} de {Math.ceil(filteredDizimos.length / PAGE_SIZE)}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button disabled={pageDizimos === 1} onClick={() => setPageDizimos(p => Math.max(1, p - 1))} className="btn btn-secondary btn-sm" style={{ padding: '2px 6px' }}><ChevronLeft size={12} /></button>
                  <button disabled={pageDizimos >= Math.ceil(filteredDizimos.length / PAGE_SIZE)} onClick={() => setPageDizimos(p => p + 1)} className="btn btn-secondary btn-sm" style={{ padding: '2px 6px' }}><ChevronRight size={12} /></button>
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB 2: OFERTAS (Visible when isYearMode) */}
        {mobileTab === 'ofertas' && isYearMode && (
          <>
            <div style={{ padding: '10px 12px', background: '#f8fafc', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Total Ofertas</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-ofertas)' }}>{formatCurrency(totalOfertasVal)}</span>
            </div>
            <div style={{ width: '100%', overflowX: 'hidden' }}>
              <table style={{ width: '100%', minWidth: 0, tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left', width: '65%', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 700 }}>Descrição</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', width: '35%', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 700 }}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOfertas.length > 0 ? (
                    getPagedList(filteredOfertas, pageOfertas).map((item, idx) => (
                      <tr key={`mob-oferta-${item.id || idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '9px 10px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          Oferta Geral de Culto
                        </td>
                        <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 700, color: 'var(--accent-ofertas)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                          {formatCurrency(item.valor)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                        Nenhuma oferta registrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {!showAll && filteredOfertas.length > PAGE_SIZE && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderTop: '1px solid var(--border-color)', fontSize: '0.72rem' }}>
                <span>Pág. {pageOfertas} de {Math.ceil(filteredOfertas.length / PAGE_SIZE)}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button disabled={pageOfertas === 1} onClick={() => setPageOfertas(p => Math.max(1, p - 1))} className="btn btn-secondary btn-sm" style={{ padding: '2px 6px' }}><ChevronLeft size={12} /></button>
                  <button disabled={pageOfertas >= Math.ceil(filteredOfertas.length / PAGE_SIZE)} onClick={() => setPageOfertas(p => p + 1)} className="btn btn-secondary btn-sm" style={{ padding: '2px 6px' }}><ChevronRight size={12} /></button>
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB 3: DESPESAS */}
        {mobileTab === 'despesas' && (
          <>
            <div style={{ padding: '10px 12px', background: '#f8fafc', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Total Despesas</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-expense)' }}>{formatCurrency(totalDespesasVal)}</span>
            </div>
            <div style={{ width: '100%', overflowX: 'hidden' }}>
              <table style={{ width: '100%', minWidth: 0, tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left', width: '65%', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 700 }}>Descrição / Categoria</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', width: '35%', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 700 }}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDespesas.length > 0 ? (
                    getPagedList(filteredDespesas, pageDespesas).map((item, idx) => {
                      const category = categorizeExpense(item.nome);
                      return (
                        <tr key={`mob-despesa-${item.id || idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '9px 10px', overflow: 'hidden' }}>
                            <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.nome || 'Despesa'}</div>
                            <span className="badge" style={{ background: '#f8fafc', color: 'var(--text-muted)', fontSize: '0.68rem', padding: '1px 5px', marginTop: '2px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Tag size={8} />
                              {category}
                            </span>
                          </td>
                          <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 700, color: 'var(--accent-expense)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                            {formatCurrency(item.valor)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="2" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                        Nenhuma despesa lançada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {!showAll && filteredDespesas.length > PAGE_SIZE && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderTop: '1px solid var(--border-color)', fontSize: '0.72rem' }}>
                <span>Pág. {pageDespesas} de {Math.ceil(filteredDespesas.length / PAGE_SIZE)}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button disabled={pageDespesas === 1} onClick={() => setPageDespesas(p => Math.max(1, p - 1))} className="btn btn-secondary btn-sm" style={{ padding: '2px 6px' }}><ChevronLeft size={12} /></button>
                  <button disabled={pageDespesas >= Math.ceil(filteredDespesas.length / PAGE_SIZE)} onClick={() => setPageDespesas(p => p + 1)} className="btn btn-secondary btn-sm" style={{ padding: '2px 6px' }}><ChevronRight size={12} /></button>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
