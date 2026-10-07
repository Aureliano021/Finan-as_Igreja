import React, { useState, useEffect, useMemo } from 'react';
import {
  Mic,
  BookOpen,
  Music,
  Guitar,
  DollarSign,
  User,
  Search,
  Check,
  Save,
  Loader2,
  Lock,
  X
} from 'lucide-react';
import BottomSheet from '../shared/BottomSheet';
import { createCargo, updateCargo } from '../../services/cultos';

const CARGOS_CONFIG = [
  {
    key: 'preletor',
    label: 'Preletor',
    badge: '🎙️',
    description: 'Apto a ministrar a Palavra e pregações no púlpito',
    icon: Mic,
    color: '#38bdf8'
  },
  {
    key: 'dirigente',
    label: 'Dirigente',
    badge: '📖',
    description: 'Apto a dirigir a liturgia e conduzir o culto',
    icon: BookOpen,
    color: '#a78bfa'
  },
  {
    key: 'cantor',
    label: 'Cantor',
    badge: '🎤',
    description: 'Apto para equipe de louvor e cânticos solo',
    icon: Music,
    color: '#f472b6'
  },
  {
    key: 'musico',
    label: 'Músico',
    badge: '🎸',
    description: 'Apto a tocar instrumentos musicais no ministério',
    icon: Guitar,
    color: '#fb923c'
  },
  {
    key: 'tesoureiro',
    label: 'Tesoureiro',
    badge: '💰',
    description: 'Apto à conferência e lançamento financeiro',
    icon: DollarSign,
    color: '#34d399'
  }
];

/**
 * CargoFormSheet Component
 * Modal deslizante moderno para criação e edição de aptidões/cargos de membros.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {Object} [props.initialData] - Registro existente quando em edição
 * @param {Array} props.membros - Lista de membros cadastrados
 * @param {Array} [props.cargosExistentes] - Lista opcional para verificação de duplicidade
 * @param {(msg: string) => void} props.onSuccess
 * @param {(msg: string) => void} props.onError
 */
export default function CargoFormSheet({
  isOpen = false,
  onClose,
  initialData = null,
  membros = [],
  cargosExistentes = [],
  onSuccess,
  onError
}) {
  const isEditing = Boolean(initialData && initialData.id);

  const [membroId, setMembroId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [toggles, setToggles] = useState({
    preletor: false,
    dirigente: false,
    cantor: false,
    musico: false,
    tesoureiro: false
  });
  const [submitting, setSubmitting] = useState(false);

  // Inicializa ou reseta os estados do formulário
  useEffect(() => {
    if (initialData) {
      const targetMembroId = initialData.membro_id || initialData.membro?.id || '';
      setMembroId(targetMembroId ? String(targetMembroId) : '');
      setToggles({
        preletor: Boolean(initialData.preletor),
        dirigente: Boolean(initialData.dirigente),
        cantor: Boolean(initialData.cantor),
        musico: Boolean(initialData.musico),
        tesoureiro: Boolean(initialData.tesoureiro)
      });
      setSearchTerm('');
    } else {
      setMembroId('');
      setToggles({
        preletor: false,
        dirigente: false,
        cantor: false,
        musico: false,
        tesoureiro: false
      });
      setSearchTerm('');
    }
  }, [initialData, isOpen]);

  // Encontra o membro selecionado
  const selectedMembro = useMemo(() => {
    if (!membroId) return null;
    return membros.find((m) => String(m.id) === String(membroId)) || null;
  }, [membros, membroId]);

  // Lista filtrada de membros para modo de criação
  const filteredMembros = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return membros.slice(0, 50);

    return membros
      .filter((m) => (m.nome || '').toLowerCase().includes(term))
      .slice(0, 50);
  }, [membros, searchTerm]);

  // Membros que já possuem cadastro de cargo (para aviso em criação)
  const membrosComCargoSet = useMemo(() => {
    if (!Array.isArray(cargosExistentes)) return new Set();
    return new Set(cargosExistentes.map((c) => String(c.membro_id || c.membro?.id)));
  }, [cargosExistentes]);

  const handleToggle = (key) => {
    setToggles((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!membroId) {
      if (onError) onError('Selecione um membro para atribuir os cargos.');
      return;
    }

    const payload = {
      preletor: Boolean(toggles.preletor),
      dirigente: Boolean(toggles.dirigente),
      cantor: Boolean(toggles.cantor),
      musico: Boolean(toggles.musico),
      tesoureiro: Boolean(toggles.tesoureiro)
    };

    setSubmitting(true);
    try {
      let res;
      if (isEditing) {
        res = await updateCargo(initialData.id, payload);
      } else {
        res = await createCargo({
          membro_id: Number(membroId),
          ...payload
        });
      }

      if (res && res.success === false) {
        if (onError) onError(res.message || 'Erro ao salvar os cargos.');
      } else {
        if (onSuccess) {
          onSuccess(
            isEditing
              ? 'Cargos e aptidões atualizados com sucesso!'
              : 'Cargos e aptidões atribuídos com sucesso!'
          );
        }
        if (onClose) onClose();
      }
    } catch (err) {
      const msg = err?.message || 'Falha na comunicação com o servidor.';
      if (onError) onError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const countSelected = Object.values(toggles).filter(Boolean).length;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Editar Aptidões #${initialData?.id}` : 'Atribuir Aptidões e Cargos'}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Seção: Membro */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <User size={15} style={{ color: 'var(--blue)' }} />
            <span>Membro</span>
          </label>

          {isEditing ? (
            /* Modo Edição: Membro fixo / bloqueado */
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'var(--panel-elevated)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--panel-line)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--blue-bg)',
                    border: '1px solid var(--blue-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--blue)',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}
                >
                  {(selectedMembro?.nome || initialData.membro?.nome || 'M')[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text)' }}>
                    {selectedMembro?.nome || initialData.membro?.nome || `Membro #${membroId}`}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    ID #{membroId}
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.75rem',
                  color: 'var(--muted)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-xs)'
                }}
              >
                <Lock size={12} />
                <span>Fixado</span>
              </div>
            </div>
          ) : selectedMembro ? (
            /* Membro Selecionado (Modo Criação) */
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'var(--blue-bg)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--blue-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--blue)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}
                >
                  {selectedMembro.nome[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>
                    {selectedMembro.nome}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    ID #{selectedMembro.id}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMembroId('');
                  setSearchTerm('');
                }}
                className="btn-ghost"
                style={{
                  padding: 6,
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--muted)',
                  display: 'flex'
                }}
                title="Trocar membro"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            /* Busca e Seleção de Membro (Modo Criação) */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                  placeholder="Buscar membro por nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input"
                  style={{ paddingLeft: 38 }}
                />
              </div>

              {/* Lista Rápida de Membros com Scroll */}
              <div
                style={{
                  maxHeight: 160,
                  overflowY: 'auto',
                  border: '1px solid var(--panel-line)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {filteredMembros.length === 0 ? (
                  <div style={{ padding: '12px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.82rem' }}>
                    Nenhum membro encontrado.
                  </div>
                ) : (
                  filteredMembros.map((m) => {
                    const jaTemCargo = membrosComCargoSet.has(String(m.id));
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMembroId(String(m.id))}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: 'transparent',
                          border: 'none',
                          borderBottom: '1px solid var(--panel-line)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          color: 'var(--text)',
                          transition: 'background-color 150ms ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--panel-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                          {m.nome}
                        </span>
                        {jaTemCargo && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              padding: '2px 6px',
                              borderRadius: 'var(--radius-xs)',
                              background: 'rgba(251, 146, 60, 0.15)',
                              color: '#fb923c',
                              fontWeight: 500
                            }}
                          >
                            Já cadastrado
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Título da Seção de Cargos */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
            Funções e Aptidões Ativas
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: countSelected > 0 ? 'var(--blue)' : 'var(--muted)',
              fontFamily: 'var(--font-mono)'
            }}
          >
            {countSelected} selecionada{countSelected === 1 ? '' : 's'}
          </span>
        </div>

        {/* Toggles Visuais Modernos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {CARGOS_CONFIG.map((cargo) => {
            const Icon = cargo.icon;
            const isChecked = Boolean(toggles[cargo.key]);

            return (
              <div
                key={cargo.key}
                role="switch"
                aria-checked={isChecked}
                tabIndex={0}
                onClick={() => handleToggle(cargo.key)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    handleToggle(cargo.key);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: isChecked ? 'var(--panel-hover)' : 'var(--panel-elevated)',
                  border: isChecked ? '1px solid var(--blue)' : '1px solid var(--panel-line)',
                  cursor: 'pointer',
                  transition: 'all 180ms ease',
                  userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 'var(--radius-sm)',
                      background: isChecked ? 'var(--blue-bg)' : 'rgba(255, 255, 255, 0.04)',
                      border: isChecked ? '1px solid var(--blue-border)' : '1px solid transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isChecked ? cargo.color : 'var(--muted)',
                      transition: 'all 180ms ease'
                    }}
                  >
                    <Icon size={19} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>
                        {cargo.label}
                      </span>
                      <span style={{ fontSize: '0.8rem' }}>{cargo.badge}</span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--muted)', marginTop: 2 }}>
                      {cargo.description}
                    </div>
                  </div>
                </div>

                {/* Switch / Checkbox visual */}
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    background: isChecked ? 'var(--blue)' : 'rgba(255, 255, 255, 0.08)',
                    border: isChecked ? '1px solid var(--blue-glow)' : '1px solid var(--panel-line)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    transition: 'all 180ms ease',
                    flexShrink: 0
                  }}
                >
                  {isChecked && <Check size={14} strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé / Ações */}
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
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
            disabled={submitting || (!isEditing && !membroId)}
            className="btn btn-primary"
            style={{
              flex: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: submitting || (!isEditing && !membroId) ? 0.6 : 1
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>{isEditing ? 'Salvar Alterações' : 'Cadastrar Aptidões'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
