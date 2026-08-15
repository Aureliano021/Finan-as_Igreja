import React, { useState, useMemo } from 'react';
import { HeartHandshake, Calendar, DollarSign, User, Plus, Trash2, Layers } from 'lucide-react';
import { createRecord } from '../../services/api';

/**
 * TithesForm Component
 * Lançamento de dízimos (Individual ou em Lote).
 */
export default function TithesForm({
  membros = [],
  defaultDate = '',
  onSuccess,
  onCancel,
  onError
}) {
  const today = defaultDate || new Date().toISOString().split('T')[0];
  const [mode, setMode] = useState('single'); // 'single' | 'batch'

  // Estado Modo Individual
  const [singleMembroId, setSingleMembroId] = useState('');
  const [singleValor, setSingleValor] = useState('');
  const [singleData, setSingleData] = useState(today);

  // Estado Modo Lote
  const [batchDate, setBatchDate] = useState(today);
  const [batchRows, setBatchRows] = useState([
    { id: 1, membro_id: '', valor: '', data: today },
    { id: 2, membro_id: '', valor: '', data: today },
    { id: 3, membro_id: '', valor: '', data: today }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  // Lista de membros ordenada
  const sortedMembros = useMemo(() => {
    const list = Array.isArray(membros) ? [...membros] : [];
    return list.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
  }, [membros]);

  // Submit Individual
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!singleMembroId) {
      onError('Por favor, selecione o membro contribuinte.');
      return;
    }

    const numVal = parseFloat(String(singleValor).replace(',', '.'));
    if (isNaN(numVal) || numVal <= 0) {
      onError('Por favor, informe um valor válido para o dízimo.');
      return;
    }

    if (!singleData) {
      onError('Por favor, informe a data do dízimo.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createRecord('dizimos', {
        membro_id: Number(singleMembroId),
        valor: numVal,
        data: singleData
      });

      if (res.success) {
        onSuccess('Dízimo registrado com sucesso!');
      } else {
        onError(res.message || 'Erro ao registrar dízimo.');
      }
    } catch {
      onError('Falha ao comunicar com o servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  // Funções Modo Lote
  const handleAddBatchRow = () => {
    setBatchRows((prev) => [
      ...prev,
      { id: Date.now(), membro_id: '', valor: '', data: batchDate }
    ]);
  };

  const handleRemoveBatchRow = (rowId) => {
    if (batchRows.length <= 1) return;
    setBatchRows((prev) => prev.filter((r) => r.id !== rowId));
  };

  const handleUpdateBatchRow = (rowId, field, val) => {
    setBatchRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: val } : r))
    );
  };

  const handleApplyBatchDate = (newDate) => {
    setBatchDate(newDate);
    setBatchRows((prev) => prev.map((r) => ({ ...r, data: newDate })));
  };

  // Submit Lote
  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    // Filtra apenas linhas preenchidas
    const validRows = batchRows.filter((r) => {
      const val = parseFloat(String(r.valor).replace(',', '.'));
      return r.membro_id && !isNaN(val) && val > 0;
    });

    if (validRows.length === 0) {
      onError('Preencha ao menos uma linha com membro e valor válidos.');
      return;
    }

    setSubmitting(true);
    setBatchProgress({ current: 0, total: validRows.length });

    let successCount = 0;
    const errors = [];

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      setBatchProgress({ current: i + 1, total: validRows.length });

      try {
        const res = await createRecord('dizimos', {
          membro_id: Number(row.membro_id),
          valor: parseFloat(String(row.valor).replace(',', '.')),
          data: row.data || batchDate
        });

        if (res.success) {
          successCount++;
        } else {
          errors.push(`Membro #${row.membro_id}: ${res.message}`);
        }
      } catch {
        errors.push(`Membro #${row.membro_id}: falha de conexão`);
      }
    }

    setSubmitting(false);

    if (errors.length === 0) {
      onSuccess(`Todos os ${successCount} dízimos foram lançados com sucesso!`);
    } else {
      onError(`${successCount} lançados. Falhas: ${errors.join(', ')}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Alternador de Modo (Individual vs Lote) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: 'var(--bg)',
        border: '1px solid var(--panel-line)',
        borderRadius: 'var(--radius-sm)',
        padding: 3
      }}>
        <button
          type="button"
          onClick={() => setMode('single')}
          style={{
            padding: '7px 12px',
            fontSize: '0.8rem',
            fontWeight: mode === 'single' ? 600 : 500,
            borderRadius: 'var(--radius-xs)',
            border: 'none',
            background: mode === 'single' ? 'var(--panel)' : 'transparent',
            color: mode === 'single' ? 'var(--text)' : 'var(--muted)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          Individual
        </button>

        <button
          type="button"
          onClick={() => setMode('batch')}
          style={{
            padding: '7px 12px',
            fontSize: '0.8rem',
            fontWeight: mode === 'batch' ? 600 : 500,
            borderRadius: 'var(--radius-xs)',
            border: 'none',
            background: mode === 'batch' ? 'var(--panel)' : 'transparent',
            color: mode === 'batch' ? 'var(--text)' : 'var(--muted)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          Lançar em Lote
        </button>
      </div>

      {/* MODO 1: INDIVIDUAL */}
      {mode === 'single' && (
        <form onSubmit={handleSingleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Membro */}
          <div className="form-group">
            <label className="form-label" htmlFor="tithe-member">Membro Contribuinte</label>
            <div style={{ position: 'relative' }}>
              <User
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
              <select
                id="tithe-member"
                value={singleMembroId}
                onChange={(e) => setSingleMembroId(e.target.value)}
                className="select"
                style={{ paddingLeft: 38 }}
                required
              >
                <option value="">Selecione o membro…</option>
                {sortedMembros.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome} {m.id ? `(#${m.id})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Valor */}
          <div className="form-group">
            <label className="form-label" htmlFor="tithe-val">Valor do Dízimo (R$)</label>
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
                id="tithe-val"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                value={singleValor}
                onChange={(e) => setSingleValor(e.target.value)}
                className="input font-mono"
                style={{ paddingLeft: 38, fontSize: '1.05rem', fontWeight: 600 }}
                required
              />
            </div>
          </div>

          {/* Data */}
          <div className="form-group">
            <label className="form-label" htmlFor="tithe-date">Data do Dízimo</label>
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
                id="tithe-date"
                type="date"
                value={singleData}
                onChange={(e) => setSingleData(e.target.value)}
                className="input font-mono"
                style={{ paddingLeft: 38 }}
                required
              />
            </div>
          </div>

          {/* Ações */}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
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
                  <HeartHandshake size={16} />
                  Confirmar Dízimo
                </span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* MODO 2: EM LOTE */}
      {mode === 'batch' && (
        <form onSubmit={handleBatchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Data Padrão do Lote */}
          <div className="form-group">
            <label className="form-label" htmlFor="batch-date">Data Padrão do Lote (Culto)</label>
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
                id="batch-date"
                type="date"
                value={batchDate}
                onChange={(e) => handleApplyBatchDate(e.target.value)}
                className="input font-mono"
                style={{ paddingLeft: 38 }}
                required
              />
            </div>
          </div>

          {/* Lista de Linhas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
            {batchRows.map((row, index) => (
              <div
                key={row.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--bg)',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--panel-line)'
                }}
              >
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)', width: 18 }}>
                  #{index + 1}
                </span>

                {/* Select Membro */}
                <select
                  value={row.membro_id}
                  onChange={(e) => handleUpdateBatchRow(row.id, 'membro_id', e.target.value)}
                  className="select"
                  style={{ flex: 2, padding: '8px 10px', fontSize: '0.82rem' }}
                >
                  <option value="">Selecione…</option>
                  {sortedMembros.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome}
                    </option>
                  ))}
                </select>

                {/* Input Valor */}
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="R$ 0,00"
                  value={row.valor}
                  onChange={(e) => handleUpdateBatchRow(row.id, 'valor', e.target.value)}
                  className="input font-mono"
                  style={{ flex: 1, padding: '8px 10px', fontSize: '0.85rem' }}
                />

                {/* Botão Remover Linha */}
                <button
                  type="button"
                  onClick={() => handleRemoveBatchRow(row.id)}
                  disabled={batchRows.length <= 1}
                  className="btn-ghost"
                  aria-label="Remover linha"
                  style={{ padding: 6, color: 'var(--muted)', opacity: batchRows.length <= 1 ? 0.3 : 1 }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          {/* Botão Adicionar Linha */}
          <button
            type="button"
            onClick={handleAddBatchRow}
            className="btn btn-panel btn-sm"
            style={{ width: '100%', borderStyle: 'dashed' }}
          >
            <Plus size={15} />
            Adicionar Membro ao Lote
          </button>

          {/* Ações */}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
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
                  Gravando {batchProgress.current} de {batchProgress.total}…
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Layers size={16} />
                  Salvar Lote de Dízimos
                </span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
