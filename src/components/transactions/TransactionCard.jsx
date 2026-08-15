import React from 'react';
import { ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';
import { formatCurrency, formatDateBR } from '../../services/utils';
import Badge from '../shared/Badge';

/**
 * TransactionCard Component
 * @param {Object} props
 * @param {'dizimo' | 'oferta' | 'despesa'} props.type
 * @param {string} props.title
 * @param {string} props.date
 * @param {number} props.value
 * @param {string} [props.category]
 * @param {string|number} [props.id]
 */
export default function TransactionCard({
  type = 'dizimos',
  title = '',
  date = '',
  value = 0,
  category = '',
  id = ''
}) {
  const isIncome = type === 'dizimo' || type === 'dizimos' || type === 'oferta' || type === 'ofertas';
  const typeLabel = (type === 'dizimo' || type === 'dizimos')
    ? 'Dízimo'
    : (type === 'oferta' || type === 'ofertas')
    ? 'Oferta'
    : 'Despesa';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 14px',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--panel)',
        border: '1px solid var(--panel-line)',
        gap: 12,
        transition: 'border-color var(--transition-fast)'
      }}
    >
      {/* Esquerda: Ícone de fluxo + Título + Categoria + Data */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-full)',
            background: isIncome ? 'var(--blue-bg)' : 'var(--red-bg)',
            border: `1px solid ${isIncome ? 'var(--blue-border)' : 'var(--red-border)'}`,
            color: isIncome ? 'var(--blue-glow)' : 'var(--red-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {isIncome ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <Badge variant={isIncome ? 'blue' : 'red'}>
              {typeLabel}
            </Badge>
            {id ? (
              <span style={{ fontSize: '0.68rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                #{id}
              </span>
            ) : null}
          </div>

          <p style={{
            fontSize: '0.88rem',
            fontWeight: 600,
            color: 'var(--text)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            margin: 0
          }}>
            {title}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
            <span style={{
              fontSize: '0.72rem',
              color: 'var(--muted)',
              fontFamily: 'var(--font-mono)'
            }}>
              {formatDateBR(date)}
            </span>

            {category ? (
              <span style={{
                fontSize: '0.7rem',
                color: 'var(--muted)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                background: 'var(--bg)',
                padding: '1px 6px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--panel-line)'
              }}>
                <Tag size={10} />
                {category}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Direita: Valor em IBM Plex Mono */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '1rem',
        fontWeight: 700,
        color: isIncome ? 'var(--blue-glow)' : 'var(--red-glow)',
        flexShrink: 0,
        textAlign: 'right'
      }}>
        {isIncome ? '+' : '-'}{formatCurrency(value)}
      </div>
    </div>
  );
}
