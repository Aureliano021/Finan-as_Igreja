import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import TransactionCard from './TransactionCard';
import FilterBar from './FilterBar';
import { getRecordDate, getRecordValue, categorizeExpense, formatCurrency } from '../../services/utils';

const ITEMS_PER_PAGE = 10;

/**
 * TransactionsList Component
 * Lista paginada e filtrável de todos os dízimos, ofertas e despesas do período.
 */
export default function TransactionsList({
  dizimos = [],
  ofertas = [],
  despesas = [],
  membrosMap = {}
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'dizimos' | 'ofertas' | 'despesas'
  const [currentPage, setCurrentPage] = useState(1);

  // Normalização de todos os itens com memoização
  const allNormalized = useMemo(() => {
    const safeDizimos = Array.isArray(dizimos) ? dizimos : [];
    const safeOfertas = Array.isArray(ofertas) ? ofertas : [];
    const safeDespesas = Array.isArray(despesas) ? despesas : [];

    const list = [
      ...safeDizimos.map((d) => {
        const member = membrosMap[d.membro_id];
        const memberName = typeof member === 'object' ? (member.nome || '') : String(member || `Membro #${d.membro_id}`);
        return {
          id: d.id,
          type: 'dizimos',
          title: `Dízimo • ${memberName}`,
          date: getRecordDate(d),
          value: getRecordValue(d),
          category: 'Entrada',
          isIncome: true
        };
      }),
      ...safeOfertas.map((o) => ({
        id: o.id,
        type: 'ofertas',
        title: 'Oferta de Culto',
        date: getRecordDate(o),
        value: getRecordValue(o),
        category: 'Oferta',
        isIncome: true
      })),
      ...safeDespesas.map((desp) => {
        const desc = desp.nome || desp.descricao || 'Despesa';
        return {
          id: desp.id,
          type: 'despesas',
          title: desc,
          date: getRecordDate(desp),
          value: getRecordValue(desp),
          category: categorizeExpense(desc),
          isIncome: false
        };
      })
    ];

    // Ordenação do mais recente para o mais antigo
    return list.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  }, [dizimos, ofertas, despesas, membrosMap]);

  // Contagens para os filtros
  const counts = useMemo(() => ({
    all: allNormalized.length,
    dizimos: allNormalized.filter((i) => i.type === 'dizimos').length,
    ofertas: allNormalized.filter((i) => i.type === 'ofertas').length,
    despesas: allNormalized.filter((i) => i.type === 'despesas').length
  }), [allNormalized]);

  // Filtragem por busca e por tipo
  const filteredList = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return allNormalized.filter((item) => {
      // Filtro de tipo
      if (activeFilter !== 'all' && item.type !== activeFilter) {
        return false;
      }

      // Filtro de texto
      if (term) {
        const matchTitle = item.title.toLowerCase().includes(term);
        const matchCat = (item.category || '').toLowerCase().includes(term);
        const matchVal = String(item.value).includes(term);
        const matchDate = (item.date || '').includes(term);
        return matchTitle || matchCat || matchVal || matchDate;
      }

      return true;
    });
  }, [allNormalized, activeFilter, searchTerm]);

  // Totais da seleção filtrada
  const { totalEntradasFiltradas, totalDespesasFiltradas } = useMemo(() => {
    let entradas = 0;
    let saidas = 0;
    filteredList.forEach((item) => {
      if (item.isIncome) entradas += item.value;
      else saidas += item.value;
    });
    return {
      totalEntradasFiltradas: entradas,
      totalDespesasFiltradas: saidas
    };
  }, [filteredList]);

  // Paginação
  const totalPages = Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredList.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredList, currentPage]);

  const handleSearch = (val) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleFilter = (fil) => {
    setActiveFilter(fil);
    setCurrentPage(1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Barra de Filtro e Busca */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        activeFilter={activeFilter}
        onFilterChange={handleFilter}
        counts={counts}
      />

      {/* Resumo da Seleção Filtrada */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--panel)',
        border: '1px solid var(--panel-line)',
        fontSize: '0.78rem',
        fontFamily: 'var(--font-mono)'
      }}>
        <span style={{ color: 'var(--muted)' }}>
          {filteredList.length} registro{filteredList.length !== 1 ? 's' : ''}
        </span>

        <div style={{ display: 'flex', gap: 12 }}>
          {activeFilter === 'all' || activeFilter === 'dizimos' || activeFilter === 'ofertas' ? (
            <span style={{ color: 'var(--blue-glow)', fontWeight: 600 }}>
              + {formatCurrency(totalEntradasFiltradas)}
            </span>
          ) : null}

          {activeFilter === 'all' || activeFilter === 'despesas' ? (
            <span style={{ color: 'var(--red-glow)', fontWeight: 600 }}>
              - {formatCurrency(totalDespesasFiltradas)}
            </span>
          ) : null}
        </div>
      </div>

      {/* Lista de Transações */}
      {paginatedList.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {paginatedList.map((item) => (
            <TransactionCard
              key={`${item.type}-${item.id}`}
              id={item.id}
              type={item.type}
              title={item.title}
              date={item.date}
              value={item.value}
              category={item.category}
            />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Inbox size={32} style={{ color: 'var(--muted)', margin: '0 auto 12px auto' }} />
          <h4 style={{ fontSize: '1rem', marginBottom: 4 }}>Nenhum lançamento encontrado</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
            {searchTerm
              ? 'Tente buscar com outros termos ou limpe o filtro.'
              : 'Não há registros para o período ou categoria selecionada.'}
          </p>
        </div>
      )}

      {/* Controles de Paginação */}
      {totalPages > 1 ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 10,
          paddingTop: 12,
          borderTop: '1px solid var(--panel-line)'
        }}>
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="btn btn-panel btn-sm"
          >
            <ChevronLeft size={15} /> Anterior
          </button>

          <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
            {currentPage} de {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="btn btn-panel btn-sm"
          >
            Próxima <ChevronRight size={15} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
