import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, Tag, User, Save } from 'lucide-react';
import BottomSheet from '../shared/BottomSheet';
import { updateRecord } from '../../services/api';
import { getRecordDate, getRecordValue } from '../../services/utils';

/**
 * EditRecordSheet Component
 * Sheet para edição de registros de Dízimo, Oferta ou Despesa.
 */
export default function EditRecordSheet({
  isOpen = false,
  onClose,
  recordType = 'dizimos', // 'dizimos' | 'ofertas' | 'despesas'
  record = null,
  membros = [],
  onSuccess,
  onError
}) {
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [nome, setNome] = useState('');
  const [membroId, setMembroId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (record) {
      setValor(String(getRecordValue(record) || ''));
      setData(getRecordDate(record) || '');
      setNome(record.nome || record.descricao || '');
      setMembroId(record.membro_id || '');
    } else {
      setValor('');
      setData('');
      setNome('');
      setMembroId('');
    }
  }, [record, isOpen]);

  const getTitle = () => {
    if (!record) return 'Editar Registro';
    if (recordType === 'dizimos') return `Editar Dízimo #${record.id}`;
    if (recordType === 'ofertas') return `Editar Oferta #${record.id}`;
    return `Editar Despesa #${record.id}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || !record) return;

    const numVal = parseFloat(String(valor).replace(',', '.'));
    if (isNaN(numVal) || numVal <= 0) {
      onError('Por favor, informe um valor válido.');
      return;
    }

    if (!data) {
      onError('Por favor, informe a data.');
      return;
    }

    let payload = {};
    if (recordType === 'dizimos') {
      if (!membroId) {
        onError('Por favor, selecione o membro.');
        return;
      }
      payload = { membro_id: Number(membroId), valor: numVal, data };
    } else if (recordType === 'ofertas') {
      payload = { valor: numVal, data };
    } else {
      if (!nome.trim()) {
        onError('Por favor, informe a descrição da despesa.');
        return;
      }
      payload = { nome: nome.trim(), valor: numVal, data };
    }

    setSubmitting(true);
    try {
      const endpoint = recordType === 'dizimos' ? 'dizimos' : recordType === 'ofertas' ? 'ofertas' : 'despesas';
      const res = await updateRecord(endpoint, record.id, payload);

      if (res.success) {
        onSuccess('Registro atualizado com sucesso!');
        onClose();
      } else {
        onError(res.message || 'Erro ao atualizar registro.');
      }
    } catch {
      onError('Falha ao comunicar com o servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Campo Membro (apenas para dízimos) */}
        {recordType === 'dizimos' && (
          <div className="form-group">
            <label className="form-label" htmlFor="edit-mem">Membro</label>
            <div style={{ position: 'relative' }}>
              <User
                size={16}
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--blue-glow)', pointerEvents: 'none' }}
              />
              <select
                id="edit-mem"
                value={membroId}
                onChange={(e) => setMembroId(e.target.value)}
                className="select"
                style={{ paddingLeft: 38 }}
                required
              >
                <option value="">Selecione o membro…</option>
                {membros.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome} (#{m.id})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Campo Nome (apenas para despesas) */}
        {recordType === 'despesas' && (
          <div className="form-group">
            <label className="form-label" htmlFor="edit-nome">Descrição</label>
            <div style={{ position: 'relative' }}>
              <Tag
                size={16}
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--red-glow)', pointerEvents: 'none' }}
              />
              <input
                id="edit-nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="input"
                style={{ paddingLeft: 38 }}
                required
              />
            </div>
          </div>
        )}

        {/* Campo Valor */}
        <div className="form-group">
          <label className="form-label" htmlFor="edit-val">Valor (R$)</label>
          <div style={{ position: 'relative' }}>
            <DollarSign
              size={16}
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: recordType === 'despesas' ? 'var(--red-glow)' : 'var(--blue-glow)',
                pointerEvents: 'none'
              }}
            />
            <input
              id="edit-val"
              type="number"
              step="0.01"
              min="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="input font-mono"
              style={{ paddingLeft: 38, fontSize: '1.05rem', fontWeight: 600 }}
              required
            />
          </div>
        </div>

        {/* Campo Data */}
        <div className="form-group">
          <label className="form-label" htmlFor="edit-date">Data</label>
          <div style={{ position: 'relative' }}>
            <Calendar
              size={16}
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }}
            />
            <input
              id="edit-date"
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
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="btn btn-panel"
            style={{ flex: 1 }}
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ flex: 2 }}
          >
            {submitting ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                Salvando…
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Save size={16} />
                Salvar Alterações
              </span>
            )}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
