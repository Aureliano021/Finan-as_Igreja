import React, { useState, useDeferredValue } from 'react';
import { 
  HeartHandshake, 
  Gift, 
  CreditCard, 
  Search, 
  User, 
  Tag, 
  ChevronLeft, 
  ChevronRight, 
  FileText,
  X,
  Calendar,
  Sparkles,
  ChevronRight as ArrowRight,
  Info
} from 'lucide-react';
import { formatCurrency, formatDateBR, categorizeExpense } from '../../services/utils';

const PAGE_SIZE = 8;

export default function TransactionsTableMobile({ 
  dizimosMonth = [], 
  ofertasMonth = [], 
  despesasMonth = [], 
  membrosMap = {},
  viewMode = 'month'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);
  
  const [mobileTab, setMobileTab] = useState('dizimos');
  const [selectedItem, setSelectedItem] = useState(null);

  const [pageDizimos, setPageDizimos] = useState(1);
  const [pageOfertas, setPageOfertas] = useState(1);
  const [pageDespesas, setPageDespesas] = useState(1);

  const safeDizimos = Array.isArray(dizimosMonth) ? dizimosMonth : [];
  const safeOfertas = Array.isArray(ofertasMonth) ? ofertasMonth : [];
  const safeDespesas = Array.isArray(despesasMonth) ? despesasMonth : [];
  const safeMembrosMap = (membrosMap && typeof membrosMap === 'object') ? membrosMap : {};

  const search = (deferredSearchTerm || '').toLowerCase().trim();
  const isYearMode = viewMode === 'year';

  // Search Filtering
  const filteredDizimos = React.useMemo(() => {
    return safeDizimos.filter(item => {
      if (!item) return false;
      const memberObj = safeMembrosMap[item.membro_id];
      const memberName = typeof memberObj === 'object' ? (memberObj.nome || '') : String(memberObj || `Membro ID: ${item.membro_id}`);
      const dateFormatted = formatDateBR(item.data);
      const valStr = item.valor != null ? String(item.valor) : '';
      return memberName.toLowerCase().includes(search) || dateFormatted.includes(search) || valStr.includes(search);
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
      const valStr = item.valor != null ? String(item.valor) : '';
      return desc.toLowerCase().includes(search) || category.toLowerCase().includes(search) || dateFormatted.includes(search) || valStr.includes(search);
    });
  }, [safeDespesas, search]);

  // Totals
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
    <div className="no-print" style={{ width: '100%', marginBottom: '90px' }}>
      
      {/* 🌊 LIQUID GLASS CONTAINER FOR MOBILE TRANSACTIONS */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        borderRadius: '24px',
        padding: '16px',
        boxShadow: '0 8px 30px -4px rgba(15, 23, 42, 0.08), inset 0 1px 1px rgba(255, 255, 255, 1)',
        boxSizing: 'border-box'
      }}>

        {/* Card Header & Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              padding: '6px 10px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(21, 101, 192, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
              color: '#1565c0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={16} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                Lançamentos do Período
              </h3>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Toque no card para ver detalhes
              </span>
            </div>
          </div>
        </div>

        {/* 🔍 LIQUID SEARCH BAR WITH CLEAR BUTTON */}
        <div style={{ position: 'relative', width: '100%', marginBottom: '14px' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            className="text-input"
            style={{
              width: '100%',
              paddingLeft: '36px',
              paddingRight: searchTerm ? '34px' : '14px',
              fontSize: '0.825rem',
              height: '40px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
              boxSizing: 'border-box'
            }}
            placeholder="Buscar por membro, despesa ou valor…"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => handleSearchChange('')}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'rgba(226, 232, 240, 0.8)',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={12} color="var(--text-secondary)" />
            </button>
          )}
        </div>

        {/* 🎛️ SEGMENTED LIQUID GLASS TAB BAR */}
        <div style={{
          position: 'relative',
          background: 'rgba(241, 245, 249, 0.85)',
          padding: '3px',
          borderRadius: '9999px',
          display: 'flex',
          gap: '2px',
          marginBottom: '16px',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}>
          {/* Dízimos Tab */}
          <button
            onClick={() => setMobileTab('dizimos')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 10px',
              borderRadius: '9999px',
              border: 'none',
              background: mobileTab === 'dizimos' ? '#ffffff' : 'transparent',
              color: mobileTab === 'dizimos' ? '#059669' : 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: mobileTab === 'dizimos' ? 800 : 600,
              boxShadow: mobileTab === 'dizimos' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              whiteSpace: 'nowrap'
            }}
          >
            <HeartHandshake size={14} color={mobileTab === 'dizimos' ? '#059669' : 'var(--text-muted)'} />
            <span>Dízimos ({filteredDizimos.length})</span>
          </button>

          {/* Ofertas Tab (If isYearMode) */}
          {isYearMode && (
            <button
              onClick={() => setMobileTab('ofertas')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 10px',
                borderRadius: '9999px',
                border: 'none',
                background: mobileTab === 'ofertas' ? '#ffffff' : 'transparent',
                color: mobileTab === 'ofertas' ? '#4f46e5' : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: mobileTab === 'ofertas' ? 800 : 600,
                boxShadow: mobileTab === 'ofertas' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                whiteSpace: 'nowrap'
              }}
            >
              <Gift size={14} color={mobileTab === 'ofertas' ? '#4f46e5' : 'var(--text-muted)'} />
              <span>Ofertas ({filteredOfertas.length})</span>
            </button>
          )}

          {/* Despesas Tab */}
          <button
            onClick={() => setMobileTab('despesas')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 10px',
              borderRadius: '9999px',
              border: 'none',
              background: mobileTab === 'despesas' ? '#ffffff' : 'transparent',
              color: mobileTab === 'despesas' ? '#e11d48' : 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: mobileTab === 'despesas' ? 800 : 600,
              boxShadow: mobileTab === 'despesas' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              whiteSpace: 'nowrap'
            }}
          >
            <CreditCard size={14} color={mobileTab === 'despesas' ? '#e11d48' : 'var(--text-muted)'} />
            <span>Despesas ({filteredDespesas.length})</span>
          </button>
        </div>

        {/* 📊 TOTAL SUMMARY STRIP */}
        <div style={{
          padding: '10px 14px',
          borderRadius: '14px',
          background: mobileTab === 'dizimos' ? 'rgba(5, 150, 105, 0.08)' : mobileTab === 'ofertas' ? 'rgba(79, 70, 229, 0.08)' : 'rgba(225, 29, 72, 0.08)',
          border: `1px solid ${mobileTab === 'dizimos' ? 'rgba(5, 150, 105, 0.2)' : mobileTab === 'ofertas' ? 'rgba(79, 70, 229, 0.2)' : 'rgba(225, 29, 72, 0.2)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Total em {mobileTab === 'dizimos' ? 'Dízimos' : mobileTab === 'ofertas' ? 'Ofertas' : 'Despesas'}
          </span>
          <span style={{
            fontSize: '1rem',
            fontWeight: 900,
            color: mobileTab === 'dizimos' ? '#059669' : mobileTab === 'ofertas' ? '#4f46e5' : '#e11d48',
            fontVariantNumeric: 'tabular-nums'
          }}>
            {formatCurrency(mobileTab === 'dizimos' ? totalDizimosVal : mobileTab === 'ofertas' ? totalOfertasVal : totalDespesasVal)}
          </span>
        </div>

        {/* 📱 TAB 1: DÍZIMOS FEED */}
        {mobileTab === 'dizimos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredDizimos.length > 0 ? (
              getPagedList(filteredDizimos, pageDizimos).map((item, idx) => {
                const memberObj = safeMembrosMap[item.membro_id];
                const memberName = typeof memberObj === 'object' ? (memberObj.nome || 'Membro sem nome') : String(memberObj || `Membro ID ${item.membro_id}`);
                const initial = memberName.charAt(0).toUpperCase() || 'M';

                return (
                  <div
                    key={`mob-dizimo-${item.id || idx}`}
                    onClick={() => setSelectedItem({ type: 'Dízimo', name: memberName, value: item.valor, date: item.data, extra: `Membro ID: ${item.membro_id}` })}
                    style={{
                      background: '#ffffff',
                      border: '1px solid rgba(226, 232, 240, 0.9)',
                      borderRadius: '16px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease, background 0.15s ease',
                      WebkitTapHighlightColor: 'transparent'
                    }}
                    className="mobile-card-item"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        flexShrink: 0,
                        border: '1px solid rgba(5, 150, 105, 0.2)'
                      }}>
                        {initial}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {memberName}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Calendar size={11} />
                          {formatDateBR(item.data)}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.925rem', color: '#059669', fontVariantNumeric: 'tabular-nums' }}>
                        {formatCurrency(item.valor)}
                      </div>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '1px 6px', borderRadius: '9999px', display: 'inline-block', marginTop: '2px' }}>
                        Dízimo
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Nenhum dízimo encontrado para este período.
              </div>
            )}

            {!showAll && filteredDizimos.length > PAGE_SIZE && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', padding: '4px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Pág. {pageDizimos} de {Math.ceil(filteredDizimos.length / PAGE_SIZE)}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button disabled={pageDizimos === 1} onClick={() => setPageDizimos(p => Math.max(1, p - 1))} className="btn btn-secondary btn-sm" style={{ borderRadius: '9999px', padding: '4px 10px' }}>
                    <ChevronLeft size={14} /> Anterior
                  </button>
                  <button disabled={pageDizimos >= Math.ceil(filteredDizimos.length / PAGE_SIZE)} onClick={() => setPageDizimos(p => p + 1)} className="btn btn-secondary btn-sm" style={{ borderRadius: '9999px', padding: '4px 10px' }}>
                    Próxima <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 📱 TAB 2: OFERTAS FEED */}
        {mobileTab === 'ofertas' && isYearMode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredOfertas.length > 0 ? (
              getPagedList(filteredOfertas, pageOfertas).map((item, idx) => (
                <div
                  key={`mob-oferta-${item.id || idx}`}
                  onClick={() => setSelectedItem({ type: 'Oferta', name: 'Oferta Geral de Culto', value: item.valor, date: item.data })}
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(226, 232, 240, 0.9)',
                    borderRadius: '16px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                  className="mobile-card-item"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
                      color: '#4f46e5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      border: '1px solid rgba(79, 70, 229, 0.2)'
                    }}>
                      <Gift size={18} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        Oferta Geral de Culto
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Calendar size={11} />
                        {formatDateBR(item.data)}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.925rem', color: '#4f46e5', fontVariantNumeric: 'tabular-nums' }}>
                      {formatCurrency(item.valor)}
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#4f46e5', background: '#eef2ff', padding: '1px 6px', borderRadius: '9999px', display: 'inline-block', marginTop: '2px' }}>
                      Oferta
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Nenhuma oferta registrada neste período.
              </div>
            )}

            {!showAll && filteredOfertas.length > PAGE_SIZE && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', padding: '4px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Pág. {pageOfertas} de {Math.ceil(filteredOfertas.length / PAGE_SIZE)}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button disabled={pageOfertas === 1} onClick={() => setPageOfertas(p => Math.max(1, p - 1))} className="btn btn-secondary btn-sm" style={{ borderRadius: '9999px', padding: '4px 10px' }}>
                    <ChevronLeft size={14} /> Anterior
                  </button>
                  <button disabled={pageOfertas >= Math.ceil(filteredOfertas.length / PAGE_SIZE)} onClick={() => setPageOfertas(p => p + 1)} className="btn btn-secondary btn-sm" style={{ borderRadius: '9999px', padding: '4px 10px' }}>
                    Próxima <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 📱 TAB 3: DESPESAS FEED */}
        {mobileTab === 'despesas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredDespesas.length > 0 ? (
              getPagedList(filteredDespesas, pageDespesas).map((item, idx) => {
                const category = categorizeExpense(item.nome);
                return (
                  <div
                    key={`mob-despesa-${item.id || idx}`}
                    onClick={() => setSelectedItem({ type: 'Despesa', name: item.nome || 'Despesa sem descrição', value: item.valor, date: item.data, category })}
                    style={{
                      background: '#ffffff',
                      border: '1px solid rgba(226, 232, 240, 0.9)',
                      borderRadius: '16px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease',
                      WebkitTapHighlightColor: 'transparent'
                    }}
                    className="mobile-card-item"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
                        color: '#e11d48',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: '1px solid rgba(225, 29, 72, 0.2)'
                      }}>
                        <CreditCard size={18} />
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.nome || 'Despesa'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#f8fafc', padding: '1px 5px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                            <Tag size={9} /> {category}
                          </span>
                          <span>•</span>
                          <span>{formatDateBR(item.data)}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.925rem', color: '#e11d48', fontVariantNumeric: 'tabular-nums' }}>
                        {formatCurrency(item.valor)}
                      </div>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#e11d48', background: '#fff1f2', padding: '1px 6px', borderRadius: '9999px', display: 'inline-block', marginTop: '2px' }}>
                        Saída
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Nenhuma despesa lançada neste período.
              </div>
            )}

            {!showAll && filteredDespesas.length > PAGE_SIZE && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', padding: '4px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Pág. {pageDespesas} de {Math.ceil(filteredDespesas.length / PAGE_SIZE)}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button disabled={pageDespesas === 1} onClick={() => setPageDespesas(p => Math.max(1, p - 1))} className="btn btn-secondary btn-sm" style={{ borderRadius: '9999px', padding: '4px 10px' }}>
                    <ChevronLeft size={14} /> Anterior
                  </button>
                  <button disabled={pageDespesas >= Math.ceil(filteredDespesas.length / PAGE_SIZE)} onClick={() => setPageDespesas(p => p + 1)} className="btn btn-secondary btn-sm" style={{ borderRadius: '9999px', padding: '4px 10px' }}>
                    Próxima <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* 🌊 LIQUID GLASS TRANSACTION DETAIL DRAWER MODAL */}
      {selectedItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }} onClick={() => setSelectedItem(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '480px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(24px) saturate(200%)',
              WebkitBackdropFilter: 'blur(24px) saturate(200%)',
              borderTopLeftRadius: '28px',
              borderTopRightRadius: '28px',
              padding: '24px 20px 36px 20px',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 -20px 50px rgba(0, 0, 0, 0.2)',
              animation: 'slideUp 0.25 cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Sheet Handle Indicator */}
            <div style={{ width: '40px', height: '4px', background: '#cbd5e1', borderRadius: '9999px', margin: '0 auto 16px auto' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={18} color="var(--accent-primary)" />
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Detalhes do Lançamento
                </h4>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  border: 'none',
                  background: '#f1f5f9',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{
              background: selectedItem.type === 'Dízimo' ? '#ecfdf5' : selectedItem.type === 'Oferta' ? '#eef2ff' : '#fff1f2',
              padding: '16px',
              borderRadius: '16px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                {selectedItem.type}
              </span>
              <div style={{
                fontSize: '1.6rem',
                fontWeight: 900,
                color: selectedItem.type === 'Dízimo' ? '#059669' : selectedItem.type === 'Oferta' ? '#4f46e5' : '#e11d48',
                margin: '4px 0',
                fontVariantNumeric: 'tabular-nums'
              }}>
                {formatCurrency(selectedItem.value)}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {selectedItem.name}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Data do Lançamento</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatDateBR(selectedItem.date)}</span>
              </div>
              {selectedItem.category && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Categoria</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedItem.category}</span>
                </div>
              )}
              {selectedItem.extra && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Info Adicional</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedItem.extra}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedItem(null)}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '24px', justifyContent: 'center', borderRadius: '14px', height: '46px', fontSize: '0.9rem' }}
            >
              Fechar Detalhes
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
