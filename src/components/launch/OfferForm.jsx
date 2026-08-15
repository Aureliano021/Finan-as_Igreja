import React, { useState } from 'react';
import { Gift, Calendar, DollarSign } from 'lucide-react';
import { createRecord } from '../../services/api';

/**
 * OfferForm Component
 * Formulário simplificado para registro de ofertas de culto.
 */
export default function OfferForm({
  defaultDate = '',
  onSuccess,
  onCancel,
  onError
}) {
  const today = defaultDate || new Date().toISOString().split('T')[0];
  const [valor, setValor] = useState('');
  const [data, setData] = useState(today);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const numVal = parseFloat(String(valor).replace(',', '.'));
    if (isNaN(numVal) || numVal <= 0) {
      onError('Por favor, informe um valor válido para a oferta.');
      return;
    }

    if (!data) {
      onError('Por favor, informe a data do culto.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createRecord('ofertas', {
        valor: numVal,
        data: data
      });

      if (res.success) {
        onSuccess('Oferta lançada com sucesso!');
      } else {
        onError(res.message || 'Erro ao registrar a oferta.');
      }
    } catch {
      onError('Falha ao comunicar com o servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Campo Valor */}
      <div className="form-group">
        <label className="form-label" htmlFor="offer-val">Valor Arrecadado (R$)</label>
        <div style={{ position: 'relative' }}>
          <DollarSign
            size={16}
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--blue-glow)',
              pointerEvents: 'none'
            }}
          />
          <input
            id="offer-val"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0,00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="input font-mono"
            style={{ paddingLeft: 38, fontSize: '1.05rem', fontWeight: 600 }}
            autoFocus
            required
          />
        </div>
      </div>

      {/* Campo Data */}
      <div className="form-group">
        <label className="form-label" htmlFor="offer-date">Data do Culto</label>
        <div style={{ position: 'relative' }}>
          <Calendar
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
            id="offer-date"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="input font-mono"
            style={{ paddingLeft: 38 }}
            required
          />
        </div>
      </div>

      {/* Ações */}
      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="btn btn-panel"
            style={{ flex: 1 }}
          >
            Voltar
          </button>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary"
          style={{ flex: 2 }}
        >
          {submitting ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="animate-spin" style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
              Salvando…
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Gift size={16} />
              Confirmar Oferta
            </span>
          )}
        </button>
      </div>
    </form>
  );
}
