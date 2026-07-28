import React, { useState, startTransition } from 'react';
import ViewTransition from './SafeViewTransition';
import useMediaQuery from '../hooks/useMediaQuery';
import { Users, HeartHandshake, Gift, CreditCard, Search, Calendar, Check, X, Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDateBR, maskCpf } from '../services/utils';

const DEFAULT_PAGE_SIZE = 15;

// Reusable pagination controls component extracted outside to prevent re-creation on render
function PaginationControls({ list, page, setPage, pageSize = DEFAULT_PAGE_SIZE }) {
  const pages = Math.max(1, Math.ceil(list.length / pageSize));
  if (pages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Página {page} de {pages} &bull; {list.length} registro(s)
      </span>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          disabled={page === 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
          aria-label="Página anterior"
        >
          <ChevronLeft size={14} /> Anterior
        </button>
        <button
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          disabled={page >= pages}
          onClick={() => setPage(p => Math.min(pages, p + 1))}
          aria-label="Próxima página"
        >
          Próxima <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

export default function DataExplorer({ membros = [], dizimos = [], ofertas = [], despesas = [] }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const pageSize = isMobile ? 8 : DEFAULT_PAGE_SIZE;

  const [subTab, setSubTab] = useState('membros'); // 'membros' | 'dizimos' | 'ofertas' | 'despesas'
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const safeMembros = Array.isArray(membros) ? membros : [];
  const safeDizimos = Array.isArray(dizimos) ? dizimos : [];
  const safeOfertas = Array.isArray(ofertas) ? ofertas : [];
  const safeDespesas = Array.isArray(despesas) ? despesas : [];

  const search = (searchTerm || '').toLowerCase();

  // Create member lookup map
  const membrosMap = React.useMemo(() => {
    const map = {};
    safeMembros.forEach(m => {
      if (m && m.id != null) map[m.id] = m;
    });
    return map;
  }, [safeMembros]);

  // Filtered Sub-datasets (Memoized for performance)
  const filteredMembros = React.useMemo(() => {
    return safeMembros.filter(m => {
      if (!m) return false;
      const nome = (m.nome || '').toLowerCase();
      const cpf = (m.cpf || '').toLowerCase();
      const email = (m.email || '').toLowerCase();
      const celular = (m.celular || '').toLowerCase();
      return nome.includes(search) || cpf.includes(search) || email.includes(search) || celular.includes(search);
    });
  }, [safeMembros, search]);

  const filteredDizimos = React.useMemo(() => {
    return safeDizimos.filter(d => {
      if (!d) return false;
      const memberObj = membrosMap[d.membro_id];
      const memberName = typeof memberObj === 'object' ? (memberObj.nome || '') : String(memberObj || `ID: ${d.membro_id}`);
      const dateFormatted = formatDateBR(d.data);
      return memberName.toLowerCase().includes(search) || dateFormatted.includes(search) || String(d.id).includes(search);
    });
  }, [safeDizimos, membrosMap, search]);

  const filteredOfertas = React.useMemo(() => {
    return safeOfertas.filter(o => {
      if (!o) return false;
      const dateFormatted = formatDateBR(o.data);
      const valStr = o.valor != null ? String(o.valor) : '';
      return dateFormatted.includes(search) || valStr.includes(search) || String(o.id).includes(search);
    });
  }, [safeOfertas, search]);

  const filteredDespesas = React.useMemo(() => {
    return safeDespesas.filter(d => {
      if (!d) return false;
      const nome = (d.nome || '').toLowerCase();
      const dateFormatted = formatDateBR(d.data);
      return nome.includes(search) || dateFormatted.includes(search) || String(d.id).includes(search);
    });
  }, [safeDespesas, search]);

  // Pagination helpers
  const getPage = (list) => list.slice((page - 1) * pageSize, page * pageSize);

  const handleTabChange = (tab) => {
    startTransition(() => {
      setSubTab(tab);
      setPage(1);
    });
  };
  const handleSearchChange = (val) => { setSearchTerm(val); setPage(1); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header Bar with Sub-tabs and Search */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Entity Sub-tabs */}
          <div className="tab-list" style={{ flex: '1 1 300px', minWidth: 0 }}>
            <button
              className={`tab-button ${subTab === 'membros' ? 'active' : ''}`}
              onClick={() => handleTabChange('membros')}
            >
              <Users size={16} color="currentColor" />
              Membros ({safeMembros.length})
            </button>

            <button
              className={`tab-button ${subTab === 'dizimos' ? 'active' : ''}`}
              onClick={() => handleTabChange('dizimos')}
            >
              <HeartHandshake size={16} color="currentColor" />
              Dízimos ({safeDizimos.length})
            </button>

            <button
              className={`tab-button ${subTab === 'ofertas' ? 'active' : ''}`}
              onClick={() => handleTabChange('ofertas')}
            >
              <Gift size={16} color="currentColor" />
              Ofertas ({safeOfertas.length})
            </button>

            <button
              className={`tab-button ${subTab === 'despesas' ? 'active' : ''}`}
              onClick={() => handleTabChange('despesas')}
            >
              <CreditCard size={16} color="currentColor" />
              Despesas ({safeDespesas.length})
            </button>
          </div>

          {/* Search Field */}
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 0 }}>
            <Search size={15} color="var(--text-muted)" aria-hidden="true" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              name="search"
              aria-label="Buscar registros"
              autoComplete="off"
              className="text-input"
              style={{ width: '100%', paddingLeft: '36px' }}
              placeholder="Buscar registros…"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </div>
      </div>
      {/* SUB-TAB 1: MEMBROS */}
      {subTab === 'membros' && (
        <ViewTransition enter="fade-in" exit="fade-out" default="none">
          <div className="glass-card" style={{ padding: '20px', minHeight: '480px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="var(--accent-primary)" />
              Membros Cadastrados ({filteredMembros.length})
            </h3>
          </div>

          {/* MOBILE SIMPLIFIED VIEW */}
          <div className="mobile-data-view">
            {filteredMembros.length > 0 ? (
              getPage(filteredMembros).map((m) => (
                <div key={`m-mob-${m.id}`} style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      {m.nome}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>#{m.id}</span>
                  </div>

                  {/* 3 Boolean Badges (Forced on 1 Single Line) */}
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'nowrap', width: '100%', alignItems: 'center' }}>
                    {/* Boolean 1: Membro */}
                    <span className="badge" style={{
                      flex: 1,
                      justifyContent: 'center',
                      background: m.membro ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)',
                      color: m.membro ? '#34d399' : 'var(--text-muted)',
                      border: `1px solid ${m.membro ? 'rgba(52,211,153,0.3)' : 'var(--border-color)'}`,
                      fontSize: '0.62rem',
                      padding: '3px 4px',
                      whiteSpace: 'nowrap'
                    }}>
                      {m.membro ? <Check size={10} /> : <X size={10} />} Membro
                    </span>

                    {/* Boolean 2: Batizado */}
                    <span className="badge" style={{
                      flex: 1,
                      justifyContent: 'center',
                      background: m.batizado ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.05)',
                      color: m.batizado ? '#60a5fa' : 'var(--text-muted)',
                      border: `1px solid ${m.batizado ? 'rgba(96,165,250,0.3)' : 'var(--border-color)'}`,
                      fontSize: '0.62rem',
                      padding: '3px 4px',
                      whiteSpace: 'nowrap'
                    }}>
                      {m.batizado ? <Check size={10} /> : <X size={10} />} Batizado
                    </span>

                    {/* Boolean 3: União Estável */}
                    <span className="badge" style={{
                      flex: 1,
                      justifyContent: 'center',
                      background: m.uniao_estavel ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.05)',
                      color: m.uniao_estavel ? '#c084fc' : 'var(--text-muted)',
                      border: `1px solid ${m.uniao_estavel ? 'rgba(192,132,252,0.3)' : 'var(--border-color)'}`,
                      fontSize: '0.62rem',
                      padding: '3px 4px',
                      whiteSpace: 'nowrap'
                    }}>
                      {m.uniao_estavel ? <Check size={10} /> : <X size={10} />} União Est.
                    </span>
                  </div>

                  {(m.celular || m.email || m.cpf) && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {m.celular && <span><Phone size={10} /> {m.celular}</span>}
                      {m.cpf && <span>CPF: {maskCpf(m.cpf)}</span>}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                Nenhum membro encontrado.
              </div>
            )}
          </div>

          {/* DESKTOP TABLE VIEW */}
          <div className="desktop-data-view data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Nome Completo</th>
                  <th scope="col">CPF</th>
                  <th scope="col">Contato (Email / Celular)</th>
                  <th scope="col">Endereço / CEP</th>
                  <th scope="col">Situação do Membro</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembros.length > 0 ? (
                  getPage(filteredMembros).map((m) => (
                    <tr key={`membro-${m.id}`}>
                      <td style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        #{m.id}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {m.nome}
                        {m.data_nascimento && (
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                            Nascimento: {formatDateBR(m.data_nascimento)}
                          </span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {maskCpf(m.cpf)}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {m.email && <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> {m.email}</div>}
                        {m.celular && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}><Phone size={12} /> {m.celular}</div>}
                        {!m.email && !m.celular && '-'}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {m.endereco || '-'}
                        {m.cep && <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>CEP: {m.cep}</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', gap: '4px', alignItems: 'center' }}>
                          <span className="badge" style={{
                            background: m.membro ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)',
                            color: m.membro ? '#34d399' : 'var(--text-muted)',
                            border: `1px solid ${m.membro ? 'rgba(52,211,153,0.3)' : 'var(--border-color)'}`,
                            fontSize: '0.68rem',
                            whiteSpace: 'nowrap'
                          }}>
                            {m.membro ? <Check size={10} /> : <X size={10} />} Membro
                          </span>

                          <span className="badge" style={{
                            background: m.batizado ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.05)',
                            color: m.batizado ? '#60a5fa' : 'var(--text-muted)',
                            border: `1px solid ${m.batizado ? 'rgba(96,165,250,0.3)' : 'var(--border-color)'}`,
                            fontSize: '0.68rem',
                            whiteSpace: 'nowrap'
                          }}>
                            {m.batizado ? <Check size={10} /> : <X size={10} />} Batizado
                          </span>

                          <span className="badge" style={{
                            background: m.uniao_estavel ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.05)',
                            color: m.uniao_estavel ? '#c084fc' : 'var(--text-muted)',
                            border: `1px solid ${m.uniao_estavel ? 'rgba(192,132,252,0.3)' : 'var(--border-color)'}`,
                            fontSize: '0.68rem',
                            whiteSpace: 'nowrap'
                          }}>
                            {m.uniao_estavel ? <Check size={10} /> : <X size={10} />} União Est.
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      Nenhum membro encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <PaginationControls list={filteredMembros} page={page} setPage={setPage} pageSize={pageSize} />
        </div>
      </ViewTransition>
      )}

      {/* SUB-TAB 2: DÍZIMOS */}
      {subTab === 'dizimos' && (
        <ViewTransition enter="fade-in" exit="fade-out" default="none">
          <div className="glass-card" style={{ padding: '20px', minHeight: '480px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HeartHandshake size={18} color="var(--accent-dizimos)" />
              Todos os Dízimos ({filteredDizimos.length})
            </h3>
          </div>

          {/* MOBILE SIMPLIFIED VIEW */}
          <div className="mobile-data-view">
            {filteredDizimos.length > 0 ? (
              getPage(filteredDizimos).map((d) => {
                const memberObj = membrosMap[d.membro_id];
                const memberName = typeof memberObj === 'object' ? (memberObj.nome || '') : String(memberObj || `ID ${d.membro_id}`);
                return (
                  <div key={`diz-mob-${d.id}`} style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    gap: '12px'
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {memberName}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Calendar size={11} /> {formatDateBR(d.data)}
                      </span>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      <span style={{ fontWeight: 800, color: 'var(--accent-dizimos)', fontSize: '0.95rem', whiteSpace: 'nowrap', display: 'block' }}>
                        {formatCurrency(d.valor)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                Nenhum dízimo registrado.
              </div>
            )}
          </div>

          {/* DESKTOP TABLE VIEW */}
          <div className="desktop-data-view data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Data do Lançamento</th>
                  <th>Membro Dizimista</th>
                  <th style={{ textAlign: 'right' }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {filteredDizimos.length > 0 ? (
                  getPage(filteredDizimos).map((d) => {
                    const memberObj = membrosMap[d.membro_id];
                    const memberName = typeof memberObj === 'object' ? (memberObj.nome || '') : String(memberObj || `ID ${d.membro_id}`);
                    return (
                      <tr key={`dizimo-all-${d.id}`}>
                        <td style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          #{d.id}
                        </td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                            <Calendar size={14} />
                            {formatDateBR(d.data)}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {memberName} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(ID: {d.membro_id})</span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-dizimos)', fontSize: '1rem' }}>
                          {formatCurrency(d.valor)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      Nenhum dízimo registrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <PaginationControls list={filteredDizimos} page={page} setPage={setPage} pageSize={pageSize} />
        </div>
      </ViewTransition>
      )}

      {/* SUB-TAB 3: OFERTAS */}
      {subTab === 'ofertas' && (
        <ViewTransition enter="fade-in" exit="fade-out" default="none">
          <div className="glass-card" style={{ padding: '20px', minHeight: '480px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Gift size={18} color="var(--accent-ofertas)" />
              Todas as Ofertas ({filteredOfertas.length})
            </h3>
          </div>

          {/* MOBILE SIMPLIFIED VIEW */}
          <div className="mobile-data-view">
            {filteredOfertas.length > 0 ? (
              getPage(filteredOfertas).map((o) => (
                <div key={`oferta-mob-${o.id}`} style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  gap: '12px'
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem', display: 'block' }}>
                      Oferta Geral de Culto
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Calendar size={11} /> {formatDateBR(o.data)}
                    </span>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <span style={{ fontWeight: 800, color: 'var(--accent-ofertas)', fontSize: '0.95rem', whiteSpace: 'nowrap', display: 'block' }}>
                      {formatCurrency(o.valor)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                Nenhuma oferta registrada.
              </div>
            )}
          </div>

          {/* DESKTOP TABLE VIEW */}
          <div className="desktop-data-view data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Data da Oferta</th>
                  <th style={{ textAlign: 'right' }}>Valor Arrecadado</th>
                </tr>
              </thead>
              <tbody>
                {filteredOfertas.length > 0 ? (
                  getPage(filteredOfertas).map((o) => (
                    <tr key={`oferta-all-${o.id}`}>
                      <td style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        #{o.id}
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                          <Calendar size={14} />
                          {formatDateBR(o.data)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-ofertas)', fontSize: '1rem' }}>
                        {formatCurrency(o.valor)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      Nenhuma oferta registrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <PaginationControls list={filteredOfertas} page={page} setPage={setPage} pageSize={pageSize} />
        </div>
      </ViewTransition>
      )}

      {/* SUB-TAB 4: DESPESAS */}
      {subTab === 'despesas' && (
        <ViewTransition enter="fade-in" exit="fade-out" default="none">
          <div className="glass-card" style={{ padding: '20px', minHeight: '480px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} color="var(--accent-expense)" />
              Todas as Despesas Pagas ({filteredDespesas.length})
            </h3>
          </div>

          {/* MOBILE SIMPLIFIED VIEW */}
          <div className="mobile-data-view">
            {filteredDespesas.length > 0 ? (
              getPage(filteredDespesas).map((d) => (
                <div key={`desp-mob-${d.id}`} style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  gap: '12px'
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.nome}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Calendar size={11} /> {formatDateBR(d.data)}
                    </span>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <span style={{ fontWeight: 800, color: 'var(--accent-expense)', fontSize: '0.95rem', whiteSpace: 'nowrap', display: 'block' }}>
                      {formatCurrency(d.valor)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                Nenhuma despesa registrada.
              </div>
            )}
          </div>

          {/* DESKTOP TABLE VIEW */}
          <div className="desktop-data-view data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Data do Pagamento</th>
                  <th>Descrição da Despesa</th>
                  <th style={{ textAlign: 'right' }}>Valor Pago</th>
                </tr>
              </thead>
              <tbody>
                {filteredDespesas.length > 0 ? (
                  getPage(filteredDespesas).map((d) => (
                    <tr key={`despesa-all-${d.id}`}>
                      <td style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        #{d.id}
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                          <Calendar size={14} />
                          {formatDateBR(d.data)}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {d.nome}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-expense)', fontSize: '1rem' }}>
                        {formatCurrency(d.valor)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      Nenhuma despesa registrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <PaginationControls list={filteredDespesas} page={page} setPage={setPage} pageSize={pageSize} />
        </div>
      </ViewTransition>
      )}

    </div>
  );
}
