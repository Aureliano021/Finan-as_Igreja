import React, { useState, useEffect } from 'react';
import { User, Calendar, Save } from 'lucide-react';
import BottomSheet from '../shared/BottomSheet';
import { createRecord, updateRecord } from '../../services/api';

/**
 * MemberFormSheet Component
 * Modal deslizante para criação ou edição de membros.
 */
export default function MemberFormSheet({
  isOpen = false,
  onClose,
  initialData = null, // Se fornecido, é modo Edição; se null, é modo Criação
  onSuccess,
  onError
}) {
  const isEditing = Boolean(initialData && initialData.id);

  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [isMembro, setIsMembro] = useState(true);
  const [isBatizado, setIsBatizado] = useState(false);
  const [isUniaoEstavel, setIsUniaoEstavel] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setNome(initialData.nome || '');
      setDataNascimento(initialData.data_nascimento || '');
      setIsMembro(Boolean(initialData.membro !== false));
      setIsBatizado(Boolean(initialData.batizado));
      setIsUniaoEstavel(Boolean(initialData.uniao_estavel));
    } else {
      setNome('');
      setDataNascimento('');
      setIsMembro(true);
      setIsBatizado(false);
      setIsUniaoEstavel(false);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const cleanNome = nome.trim();
    if (!cleanNome) {
      onError('Por favor, informe o nome completo do membro.');
      return;
    }

    const payload = {
      nome: cleanNome,
      membro: isMembro,
      batizado: isBatizado,
      uniao_estavel: isUniaoEstavel
    };

    if (dataNascimento) {
      payload.data_nascimento = dataNascimento;
    }

    setSubmitting(true);
    try {
      let res;
      if (isEditing) {
        res = await updateRecord('membro', initialData.id, payload);
      } else {
        res = await createRecord('membro', payload);
      }

      if (res.success) {
        onSuccess(isEditing ? 'Membro atualizado com sucesso!' : 'Membro cadastrado com sucesso!');
        onClose();
      } else {
        onError(res.message || 'Erro ao salvar membro.');
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
      title={isEditing ? `Editar Membro #${initialData?.id}` : 'Cadastrar Novo Membro'}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Nome */}
        <div className="form-group">
          <label className="form-label" htmlFor="mem-nome">Nome Completo</label>
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
            <input
              id="mem-nome"
              type="text"
              placeholder="Ex: Maria dos Santos"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="input"
              style={{ paddingLeft: 38 }}
              autoFocus
              required
            />
          </div>
        </div>

        {/* Data de Nascimento */}
        <div className="form-group">
          <label className="form-label" htmlFor="mem-nasc">
            Data de Nascimento {isEditing ? '(Opcional)' : ''}
          </label>
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
              id="mem-nasc"
              type="date"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              className="input font-mono"
              style={{ paddingLeft: 38 }}
              required={!isEditing}
            />
          </div>
        </div>

        {/* Checkboxes de Status */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          background: 'var(--bg)',
          padding: '12px 14px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--panel-line)',
          marginTop: 4
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.84rem' }}>
            <input
              type="checkbox"
              checked={isMembro}
              onChange={(e) => setIsMembro(e.target.checked)}
              style={{ accentColor: 'var(--blue)', width: 16, height: 16 }}
            />
            <span>Membro Efetivo da Igreja</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.84rem' }}>
            <input
              type="checkbox"
              checked={isBatizado}
              onChange={(e) => setIsBatizado(e.target.checked)}
              style={{ accentColor: 'var(--blue)', width: 16, height: 16 }}
            />
            <span>Batizado(a) nas Águas</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.84rem' }}>
            <input
              type="checkbox"
              checked={isUniaoEstavel}
              onChange={(e) => setIsUniaoEstavel(e.target.checked)}
              style={{ accentColor: 'var(--blue)', width: 16, height: 16 }}
            />
            <span>Possui União Estável</span>
          </label>
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
                {isEditing ? 'Atualizar Membro' : 'Cadastrar Membro'}
              </span>
            )}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
