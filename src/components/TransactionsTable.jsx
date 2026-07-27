import React, { useState } from 'react';
import { HeartHandshake, Gift, CreditCard, Search, User, Calendar, Tag } from 'lucide-react';
import { formatCurrency, formatDateBR, categorizeExpense } from '../services/utils';

export default function TransactionsTable({ dizimosMonth = [], ofertasMonth = [], despesasMonth = [], membrosMap = {} }) {
  const [activeTab, setActiveTab] = useState('dizimos');
  const [searchTerm, setSearchTerm] = useState('');

  const safeDizimos = Array.isArray(dizimosMonth) ? dizimosMonth : [];
  const safeOfertas = Array.isArray(ofertasMonth) ? ofertasMonth : [];
  const safeDespesas = Array.isArray(despesasMonth) ? despesasMonth : [];
  const safeMembrosMap = (membrosMap && typeof membrosMap === 'object') ? membrosMap : {};

  const search = (searchTerm || '').toLowerCase();

  // Search Filtering
  const filteredDizimos = safeDizimos.filter(item => {
    if (!item) return false;
    const memberObj = safeMembrosMap[item.membro_id];
    const memberName = typeof memberObj === 'object' ? (memberObj.nome || '') : String(memberObj || `Membro ID: ${item.membro_id}`);
    const dateFormatted = formatDateBR(item.data);
    return memberName.toLowerCase().includes(search) || dateFormatted.includes(search);
  });

  const filteredOfertas = safeOfertas.filter(item => {
    if (!item) return false;
    const dateFormatted = formatDateBR(item.data);
    const valStr = item.valor != null ? String(item.valor) : '';
    return dateFormatted.includes(search) || valStr.includes(search);
  });

  const filteredDespesas = safeDespesas.filter(item => {
    if (!item) return false;
    const desc = item.nome || '';
    const dateFormatted = formatDateBR(item.data);
    const category = categorizeExpense(desc);
    return desc.toLowerCase().includes(search) || category.toLowerCase().includes(search) || dateFormatted.includes(search);
  });

  return (
    <div className="glass-card no-print" style={{ padding: '20px', marginBottom: '32px' }}>
      {/* Header & Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {/* Tab Buttons */}
        <div className="tab-list" style={{ flex: '1 1 280px', minWidth: 0 }}>
          <button
            className={`tab-button ${activeTab === 'dizimos' ? 'active' : ''}`}
            onClick={() => setActiveTab('dizimos')}
          >
            <HeartHandshake size={16} color="var(--accent-dizimos)" />
            Dízimos ({safeDizimos.length})
          </button>

          <button
            className={`tab-button ${activeTab === 'ofertas' ? 'active' : ''}`}
            onClick={() => setActiveTab('ofertas')}
          >
            <Gift size={16} color="var(--accent-ofertas)" />
            Ofertas ({safeOfertas.length})
          </button>

          <button
            className={`tab-button ${activeTab === 'despesas' ? 'active' : ''}`}
            onClick={() => setActiveTab('despesas')}
          >
            <CreditCard size={16} color="var(--accent-expense)" />
            Despesas ({safeDespesas.length})
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 0 }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="text-input"
            style={{ width: '100%', paddingLeft: '36px' }}
            placeholder="Buscar por nome, data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="data-table-container">

        {/* TAB 1: DÍZIMOS */}
        {activeTab === 'dizimos' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Membro Dizimista</th>
                <th>CPF / ID</th>
                <th style={{ textAlign: 'right' }}>Valor</th>
              </tr>
            </thead>
            <tbody>
              {filteredDizimos.length > 0 ? (
                filteredDizimos.map((item, idx) => {
                  const memberObj = safeMembrosMap[item.membro_id];
                  const memberName = typeof memberObj === 'object' ? (memberObj.nome || 'Membro sem nome') : String(memberObj || `Membro ID ${item.membro_id}`);
                  const memberCpf = typeof memberObj === 'object' && memberObj.cpf ? memberObj.cpf : `-`;

                  return (
                    <tr key={`dizimo-${item.id || idx}`}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                          <Calendar size={14} />
                          {formatDateBR(item.data)}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <User size={14} color="var(--accent-dizimos)" />
                          {memberName}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                        {memberCpf}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-dizimos)' }}>
                        {formatCurrency(item.valor)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    Nenhum dízimo encontrado para o período ou busca selecionada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* TAB 2: OFERTAS */}
        {activeTab === 'ofertas' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Data do Culto</th>
                <th>Descrição / Tipo</th>
                <th style={{ textAlign: 'right' }}>Valor Arrecadado</th>
              </tr>
            </thead>
            <tbody>
              {filteredOfertas.length > 0 ? (
                filteredOfertas.map((item, idx) => (
                  <tr key={`oferta-${item.id || idx}`}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                        <Calendar size={14} />
                        {formatDateBR(item.data)}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <Gift size={14} color="var(--accent-ofertas)" />
                        Oferta Geral de Culto
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-ofertas)' }}>
                      {formatCurrency(item.valor)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    Nenhuma oferta registrada neste período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* TAB 3: DESPESAS */}
        {activeTab === 'despesas' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Data do Pagamento</th>
                <th>Descrição da Despesa</th>
                <th>Categoria</th>
                <th style={{ textAlign: 'right' }}>Valor Pago</th>
              </tr>
            </thead>
            <tbody>
              {filteredDespesas.length > 0 ? (
                filteredDespesas.map((item, idx) => {
                  const category = categorizeExpense(item.nome);
                  return (
                    <tr key={`despesa-${item.id || idx}`}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                          <Calendar size={14} />
                          {formatDateBR(item.data)}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {item.nome || 'Despesa sem nome'}
                      </td>
                      <td>
                        <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                          <Tag size={10} />
                          {category}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-expense)' }}>
                        {formatCurrency(item.valor)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    Nenhuma despesa lançada para este período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
}
