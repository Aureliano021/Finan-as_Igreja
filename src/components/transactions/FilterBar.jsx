import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * FilterBar Component
 * Barra de busca e filtros rápidos por tipo de movimentação.
 */
export default function FilterBar({
  searchTerm = '',
  onSearchChange,
  activeFilter = 'all', // 'all' | 'dizimos' | 'ofertas' | 'despesas'
  onFilterChange,
  counts = { all: 0, dizimos: 0, ofertas: 0, despesas: 0 }
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
      {/* Campo de Busca */}
      <div style={{ position: 'relative' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--muted)',
            pointerEvents: 'none'
          }}
        />
        <input
          type="text"
          placeholder="Buscar por nome, descrição ou valor…"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input"
          style={{ paddingLeft: 40, paddingRight: searchTerm ? 38 : 14 }}
        />
        {searchTerm ? (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Limpar busca"
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--muted)',
              cursor: 'pointer',
              display: 'flex',
              padding: 4
            }}
          >
            <X size={15} />
          </button>
        ) : null}
      </div>

      {/* Tabs de Filtro de Tipo */}
      <div style={{
        display: 'flex',
        gap: 6,
        overflowX: 'auto',
        paddingBottom: 2,
        scrollbarWidth: 'none'
      }}>
        {[
          { id: 'all', label: 'Todas', count: counts.all },
          { id: 'dizimos', label: 'Dízimos', count: counts.dizimos, color: 'var(--blue-glow)' },
          { id: 'ofertas', label: 'Ofertas', count: counts.ofertas, color: 'var(--blue-glow)' },
          { id: 'despesas', label: 'Despesas', count: counts.despesas, color: 'var(--red-glow)' }
        ].map((f) => {
          const isActive = activeFilter === f.id;

          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilterChange(f.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${isActive ? 'var(--blue)' : 'var(--panel-line)'}`,
                background: isActive ? 'var(--blue-bg)' : 'var(--panel)',
                color: isActive ? 'var(--blue-glow)' : 'var(--muted)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.78rem',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)'
              }}
            >
              <span>{f.label}</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  opacity: 0.85
                }}
              >
                ({f.count})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
