import React, { useState } from 'react';
import { CreditCard, Calendar, DollarSign, Tag, Plus, Trash2, Layers } from 'lucide-react';
import { createRecord } from '../../services/api';

/**
 * ExpenseForm Component
 * Lançamento de despesas (Individual ou em Lote).
 */
export default function ExpenseForm({
  defaultDate = '',
  onSuccess,
  onCancel,
  onError
}) {
  const today = defaultDate || new Date().toISOString().split('T')[0];
  const [mode, setMode] = useState('single'); // 'single' | 'batch'

  // Estado Modo Individual
  const [singleNome, setSingleNome] = useState('');
  const [singleValor, setSingleValor] = useState('');
  const [singleData, setSingleData] = useState(today);

  // Estado Modo Lote
  const [batchDate, setBatchDate] = useState(today);
  const [batchRows, setBatchRows] = useState([
    { id: 1, nome: '', valor: '', data: today },
    { id: 2, nome: '', valor: '', data: today },
    { id: 3, nome: '', valor: '', data: today }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  // Submit Individual
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const cleanNome = singleNome.trim();
    if (!cleanNome) {
      onError('Por favor, informe a descrição ou nome da despesa.');
      return;
    }

    const numVal = parseFloat(String(singleValor).replace(',', '.'));
    if (isNaN(numVal) || numVal <= 0) {
      onError('Por favor, informe um valor válido para a despesa.');
      return;
    }

    if (!singleData) {
      onError('Por favor, informe a data do pagamento.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createRecord('despesas', {
        nome: cleanNome,
        valor: numVal,
        data: singleData
      });

      if (res.success) {
        onSuccess('Despesa registrada com sucesso!');
      } else {
        onError(res.message || 'Erro ao registrar despesa.');
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
      { id: Date.now(), nome: '', valor: '', data: batchDate }
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

    // Filtra apenas linhas com nome e valor preenchidos
    const validRows = batchRows.filter((r) => {
      const val = parseFloat(String(r.valor).replace(',', '.'));
      return r.nome && r.nome.trim() && !isNaN(val) && val > 0;
    });

    if (validRows.length === 0) {
      onError('Preencha ao menos uma linha com descrição e valor válidos.');
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
        const res = await createRecord('despesas', {
          nome: row.nome.trim(),
          valor: parseFloat(String(row.valor).replace(',', '.')),
          data: row.data || batchDate
        });

        if (res.success) {
          successCount++;
        } else {
          errors.push(`"${row.nome}": ${res.message}`);
        }
      } catch {
        errors.push(`"${row.nome}": falha de conexão`);
      }
    }

    setSubmitting(false);

    if (errors.length === 0) {
      onSuccess(`Todas as ${successCount} despesas foram lançadas com sucesso!`);
    } else {
      onError(`${successCount} lançadas. Falhas: ${errors.join(', ')}`);
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
          {/* Descrição */}
          <div className="form-group">
            <label className="form-label" htmlFor="exp-name">Descrição da Despesa</label>
            <div style={{ position: 'relative' }}>
              <Tag
                size={16}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--red-glow)',
                  pointerEvents: 'none'
                }}
              />
              <input
                id="exp-name"
                type="text"
                placeholder="Ex: Conta de Energia, Material, etc."
                value={singleNome}
                onChange={(e) => setSingleNome(e.target.value)}
                className="input"
                style={{ paddingLeft: 38 }}
                autoFocus
                required
              />
            </div>
          </div>

          {/* Valor */}
          <div className="form-group">
            <label className="form-label" htmlFor="exp-val">Valor Pago (R$)</label>
            <div style={{ position: 'relative' }}>
              <DollarSign
                size={16}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--red-glow)',
                  pointerEvents: 'none'
                }}
              />
              <input
                id="exp-val"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                value={singleValor}
                onChange={(e) => setSingleValor(e.target.value)}
                className="input font-mono"
                style={{ paddingLeft: 38, fontSize: '1.05rem', fontWeight: 600, color: 'var(--red-glow)' }}
                required
              />
            </div>
          </div>

          {/* Data */}
          <div className="form-group">
            <label className="form-label" htmlFor="exp-date">Data do Pagamento</label>
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
                id="exp-date"
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
              className="btn btn-danger"
              style={{ flex: 2 }}
            >
              {submitting ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="animate-spin" style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                  Salvando…
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CreditCard size={16} />
                  Confirmar Despesa
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
            <label className="form-label" htmlFor="exp-batch-date">Data Padrão do Lote</label>
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
                id="exp-batch-date"
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

                {/* Input Descrição */}
                <input
                  type="text"
                  placeholder="Descrição da conta…"
                  value={row.nome}
                  onChange={(e) => handleUpdateBatchRow(row.id, 'nome', e.target.value)}
                  className="input"
                  style={{ flex: 2, padding: '8px 10px', fontSize: '0.82rem' }}
                />

                {/* Input Valor */}
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="R$ 0,00"
                  value={row.valor}
                  onChange={(e) => handleUpdateBatchRow(row.id, 'valor', e.target.value)}
                  className="input font-mono"
                  style={{ flex: 1, padding: '8px 10px', fontSize: '0.85rem', color: 'var(--red-glow)' }}
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
            Adicionar Conta ao Lote
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
              className="btn btn-danger"
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
                  Salvar Lote de Despesas
                </span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
