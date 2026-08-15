import React, { useState } from 'react';
import { HeartHandshake, Gift, CreditCard, ArrowLeft } from 'lucide-react';
import BottomSheet from '../shared/BottomSheet';
import TithesForm from './TithesForm';
import OfferForm from './OfferForm';
import ExpenseForm from './ExpenseForm';

/**
 * LaunchBottomSheet Component
 * Modal deslizante que unifica o lançamento de Dízimos, Ofertas e Despesas.
 */
export default function LaunchBottomSheet({
  isOpen = false,
  onClose,
  membros = [],
  defaultDate = '',
  onSuccess,
  onError
}) {
  const [selectedType, setSelectedType] = useState(null); // null | 'dizimo' | 'oferta' | 'despesa'

  const handleClose = () => {
    setSelectedType(null);
    if (onClose) onClose();
  };

  const handleSuccess = (msg) => {
    handleClose();
    if (onSuccess) onSuccess(msg);
  };

  const getTitle = () => {
    if (selectedType === 'dizimo') return 'Lançar Dízimo';
    if (selectedType === 'oferta') return 'Lançar Oferta';
    if (selectedType === 'despesa') return 'Registrar Despesa';
    return 'Novo Lançamento';
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      title={getTitle()}
    >
      {/* Botão de voltar ao menu quando um formulário estiver aberto */}
      {selectedType ? (
        <button
          type="button"
          onClick={() => setSelectedType(null)}
          className="btn-ghost"
          style={{
            alignSelf: 'flex-start',
            fontSize: '0.78rem',
            color: 'var(--muted)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 0',
            marginBottom: 10,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={14} /> Trocar tipo de lançamento
        </button>
      ) : null}

      {/* 1. MENU DE SELEÇÃO INICIAL */}
      {!selectedType && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 4 }}>
            Selecione o tipo de movimentação financeira que deseja registrar:
          </p>

          {/* Opção 1: Dízimo */}
          <div
            onClick={() => setSelectedType('dizimo')}
            className="card card-interactive"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 16px',
              border: '1px solid var(--panel-line)'
            }}
          >
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-full)',
              background: 'var(--blue-bg)',
              border: '1px solid var(--blue-border)',
              color: 'var(--blue-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <HeartHandshake size={20} />
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', margin: 0, color: 'var(--text)' }}>Dízimo</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: '2px 0 0 0' }}>
                Contribuição individual de membro (ou em lote pós-culto)
              </p>
            </div>
          </div>

          {/* Opção 2: Oferta */}
          <div
            onClick={() => setSelectedType('oferta')}
            className="card card-interactive"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 16px',
              border: '1px solid var(--panel-line)'
            }}
          >
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-full)',
              background: 'var(--blue-bg)',
              border: '1px solid var(--blue-border)',
              color: 'var(--blue-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Gift size={20} />
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', margin: 0, color: 'var(--text)' }}>Oferta</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: '2px 0 0 0' }}>
                Arrecadação geral de culto ou campanha especial
              </p>
            </div>
          </div>

          {/* Opção 3: Despesa */}
          <div
            onClick={() => setSelectedType('despesa')}
            className="card card-interactive"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 16px',
              border: '1px solid var(--panel-line)'
            }}
          >
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-full)',
              background: 'var(--red-bg)',
              border: '1px solid var(--red-border)',
              color: 'var(--red-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <CreditCard size={20} />
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', margin: 0, color: 'var(--text)' }}>Despesa</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: '2px 0 0 0' }}>
                Contas fixas, compras, manutenções e pagamentos
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. FORMULÁRIOS ESPECÍFICOS */}
      {selectedType === 'dizimo' && (
        <TithesForm
          membros={membros}
          defaultDate={defaultDate}
          onSuccess={handleSuccess}
          onCancel={() => setSelectedType(null)}
          onError={onError}
        />
      )}

      {selectedType === 'oferta' && (
        <OfferForm
          defaultDate={defaultDate}
          onSuccess={handleSuccess}
          onCancel={() => setSelectedType(null)}
          onError={onError}
        />
      )}

      {selectedType === 'despesa' && (
        <ExpenseForm
          defaultDate={defaultDate}
          onSuccess={handleSuccess}
          onCancel={() => setSelectedType(null)}
          onError={onError}
        />
      )}
    </BottomSheet>
  );
}
