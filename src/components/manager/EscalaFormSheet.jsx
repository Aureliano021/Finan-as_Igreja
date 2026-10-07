import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Sparkles,
  Music,
  Shuffle,
  RotateCw,
  Save,
  Loader2,
  Mic,
  BookOpen,
  Guitar,
  FileText,
  Tag,
  CheckCircle2,
  X
} from 'lucide-react';
import BottomSheet from '../shared/BottomSheet';
import { sortearLouvores, PLAYBACKS_LIST } from '../../data/playbacks';
import {
  createEscala,
  updateEscala,
  fetchEscalaSuggestion,
  serializeEscalaDescricao,
  deserializeEscalaDescricao
} from '../../services/cultos';

const TITULOS_SUGESTOES = [
  'Culto de Domingo - Noite',
  'Culto da Família',
  'Culto de Doutrina',
  'Culto de Jovens'
];

/**
 * Remove acentuação e converte para minúsculas para comparação flexível de nomes.
 */
function normalizeString(str) {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Localiza membro por correspondência sem acento e case-insensitive.
 */
function matchMembro(nome, membros) {
  if (!nome || !Array.isArray(membros)) return null;
  const target = normalizeString(nome);
  if (!target) return null;

  // 1. Match exato normalizado
  let found = membros.find((m) => normalizeString(m.nome) === target);
  if (found) return found;

  // 2. Match parcial (contém ou contido)
  found = membros.find((m) => {
    const mNome = normalizeString(m.nome);
    return mNome.includes(target) || target.includes(mNome);
  });
  return found || null;
}

/**
 * EscalaFormSheet Component
 * Modal deslizante moderno para criação e edição de escalas litúrgicas de culto.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {Object} [props.initialData] - Escala existente em modo edição
 * @param {Array} props.membros - Lista completa de membros
 * @param {Array} [props.cargos] - Lista de cargos/aptidões cadastradas
 * @param {(msg: string) => void} props.onSuccess
 * @param {(msg: string) => void} props.onError
 */
export default function EscalaFormSheet({
  isOpen = false,
  onClose,
  initialData = null,
  membros = [],
  cargos = [],
  onSuccess,
  onError
}) {
  const isEditing = Boolean(initialData && initialData.id);

  const [data, setData] = useState('');
  const [titulo, setTitulo] = useState('');
  const [louvores, setLouvores] = useState(['', '', '']);
  const [observacoes, setObservacoes] = useState('');

  // Equipe
  const [preletorId, setPreletorId] = useState('');
  const [dirigenteId, setDirigenteId] = useState('');
  const [cantorId, setCantorId] = useState('');
  const [musicoId, setMusicoId] = useState('');

  // Feedbacks
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sugestaoAplicada, setSugestaoAplicada] = useState(false);

  // Inicializa estado ao abrir ou alterar registro
  useEffect(() => {
    if (initialData) {
      const rawDate = initialData.data || '';
      setData(rawDate ? String(rawDate).slice(0, 10) : '');

      const parsedDesc = deserializeEscalaDescricao(initialData.descricao);
      setTitulo(parsedDesc.titulo || '');
      setObservacoes(parsedDesc.observacoes || '');

      const arrLouvores = Array.isArray(parsedDesc.louvores) ? parsedDesc.louvores : [];
      setLouvores([
        arrLouvores[0] || '',
        arrLouvores[1] || '',
        arrLouvores[2] || ''
      ]);

      // Extrai funções a partir do array itens ou propriedades diretas
      let prel = '';
      let dirig = '';
      let cant = '';
      let mus = '';

      if (Array.isArray(initialData.itens)) {
        initialData.itens.forEach((item) => {
          const funcao = (item.funcao || '').toLowerCase();
          const mId = String(item.membro_id || item.membro?.id || '');
          if (funcao === 'preletor' && !prel) prel = mId;
          else if (funcao === 'dirigente' && !dirig) dirig = mId;
          else if (funcao === 'cantor' && !cant) cant = mId;
          else if (funcao === 'musico' && !mus) mus = mId;
        });
      }

      setPreletorId(prel || (initialData.preletor_id ? String(initialData.preletor_id) : ''));
      setDirigenteId(dirig || (initialData.dirigente_id ? String(initialData.dirigente_id) : ''));
      setCantorId(cant || (initialData.cantor_id ? String(initialData.cantor_id) : ''));
      setMusicoId(mus || (initialData.musico_id ? String(initialData.musico_id) : ''));
      setSugestaoAplicada(false);
    } else {
      // Criação: data padrão hoje
      const hoje = new Date().toISOString().slice(0, 10);
      setData(hoje);
      setTitulo('');
      setLouvores(['', '', '']);
      setObservacoes('');
      setPreletorId('');
      setDirigenteId('');
      setCantorId('');
      setMusicoId('');
      setSugestaoAplicada(false);
    }
  }, [initialData, isOpen]);

  // Mapeamento de aptidão dos membros por função a partir de `cargos`
  const aptidaoPorFuncao = useMemo(() => {
    const mapa = {
      preletor: new Set(),
      dirigente: new Set(),
      cantor: new Set(),
      musico: new Set()
    };

    if (Array.isArray(cargos)) {
      cargos.forEach((c) => {
        const mId = String(c.membro_id || c.membro?.id || '');
        if (!mId) return;
        if (c.preletor) mapa.preletor.add(mId);
        if (c.dirigente) mapa.dirigente.add(mId);
        if (c.cantor) mapa.cantor.add(mId);
        if (c.musico) mapa.musico.add(mId);
      });
    }

    return mapa;
  }, [cargos]);

  // Lista ordenada de membros para cada seletor: membros aptos no topo
  const getMembrosParaFuncao = (funcaoKey) => {
    const aptosSet = aptidaoPorFuncao[funcaoKey] || new Set();
    const aptos = [];
    const outros = [];

    membros.forEach((m) => {
      if (aptosSet.has(String(m.id))) {
        aptos.push(m);
      } else {
        outros.push(m);
      }
    });

    return { aptos, outros };
  };

  // Botão Mágico: Sugerir Escala via API
  const handleSugerirEscala = async () => {
    if (loadingSuggestion) return;
    setLoadingSuggestion(true);
    setSugestaoAplicada(false);

    try {
      const res = await fetchEscalaSuggestion();

      if (res?.unauthenticated) {
        if (onError) {
          onError(res.error || 'Acesso não autorizado (401). Seu token de login expirou ou não foi reconhecido. Faça login novamente.');
        }
        return;
      }

      if (res?.success === false) {
        if (onError) {
          onError(res.error || 'Falha ao buscar sugestão de escala.');
        }
        return;
      }

      const payload = res?.data || res || {};

      let preenchidos = 0;

      if (payload.preletor) {
        const m = matchMembro(payload.preletor, membros);
        if (m) {
          setPreletorId(String(m.id));
          preenchidos++;
        }
      }

      if (payload.dirigente) {
        const m = matchMembro(payload.dirigente, membros);
        if (m) {
          setDirigenteId(String(m.id));
          preenchidos++;
        }
      }

      if (payload.cantor) {
        const m = matchMembro(payload.cantor, membros);
        if (m) {
          setCantorId(String(m.id));
          preenchidos++;
        }
      }

      if (payload.musico) {
        const m = matchMembro(payload.musico, membros);
        if (m) {
          setMusicoId(String(m.id));
          preenchidos++;
        }
      }

      if (preenchidos > 0) {
        setSugestaoAplicada(true);
      } else {
        if (onError) {
          const nomesRecebidos = [payload.preletor, payload.dirigente, payload.cantor, payload.musico].filter(Boolean).join(', ');
          onError(nomesRecebidos
            ? `A API sugeriu (${nomesRecebidos}), mas os nomes não coincidiram com a lista de membros cadastrados.`
            : 'A API não retornou nomes de sugestão.');
        }
      }
    } catch (err) {
      const msg = err?.message || 'Falha ao buscar sugestão de escala.';
      if (onError) onError(msg);
    } finally {
      setLoadingSuggestion(false);
    }
  };

  // Sorteio de 3 Louvores
  const handleSortearTodosLouvores = () => {
    const sorteados = sortearLouvores(3);
    setLouvores([
      sorteados[0] || '',
      sorteados[1] || '',
      sorteados[2] || ''
    ]);
  };

  // Sorteio individual de um louvor evitando repetições
  const handleSortearUmLouvor = (index) => {
    const outrosLouvores = louvores.filter((_, i) => i !== index).filter(Boolean);
    const novo = sortearLouvores(1, outrosLouvores);
    if (novo && novo[0]) {
      setLouvores((prev) => {
        const copy = [...prev];
        copy[index] = novo[0];
        return copy;
      });
    }
  };

  const handleUpdateLouvor = (index, value) => {
    setLouvores((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleClearLouvor = (index) => {
    setLouvores((prev) => {
      const copy = [...prev];
      copy[index] = '';
      return copy;
    });
  };

  // Submissão do Formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!data) {
      if (onError) onError('Por favor, informe a data do culto.');
      return;
    }

    const cleanTitulo = titulo.trim() || 'Culto';
    const louvoresValidos = louvores.map((l) => (l || '').trim()).filter(Boolean);

    const descricao = serializeEscalaDescricao({
      titulo: cleanTitulo,
      louvores: louvoresValidos,
      observacoes: observacoes.trim()
    });

    const itens = [];
    if (preletorId) itens.push({ membro_id: Number(preletorId), funcao: 'preletor' });
    if (dirigenteId) itens.push({ membro_id: Number(dirigenteId), funcao: 'dirigente' });
    if (cantorId) itens.push({ membro_id: Number(cantorId), funcao: 'cantor' });
    if (musicoId) itens.push({ membro_id: Number(musicoId), funcao: 'musico' });

    const payload = {
      data,
      descricao,
      itens
    };

    setSubmitting(true);
    try {
      let res;
      if (isEditing) {
        res = await updateEscala(initialData.id, payload);
      } else {
        res = await createEscala(payload);
      }

      if (res && res.success === false) {
        if (onError) onError(res.message || 'Erro ao salvar escala.');
      } else {
        if (onSuccess) {
          onSuccess(
            isEditing
              ? 'Escala atualizada com sucesso!'
              : 'Escala litúrgica criada com sucesso!'
          );
        }
        if (onClose) onClose();
      }
    } catch (err) {
      const msg = err?.message || 'Falha ao salvar escala litúrgica.';
      if (onError) onError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Editar Escala #${initialData?.id}` : 'Nova Escala Litúrgica'}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Banner do Botão Mágico (Sugestão da API) */}
        <div
          style={{
            padding: '12px 14px',
            background: 'var(--panel-elevated)',
            border: '1px solid var(--blue-border)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-full)',
                background: 'var(--blue-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--blue)',
                flexShrink: 0
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text)' }}>
                Sugestão Inteligente
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>
                Preencha a equipe com base no algoritmo do backend
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSugerirEscala}
            disabled={loadingSuggestion}
            className="btn btn-panel"
            style={{
              padding: '7px 12px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              borderColor: 'var(--blue-border)',
              color: 'var(--blue-glow)',
              flexShrink: 0
            }}
          >
            {loadingSuggestion ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Analisando...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Sugerir Escala</span>
              </>
            )}
          </button>
        </div>

        {sugestaoAplicada && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              borderRadius: 'var(--radius-xs)',
              background: 'rgba(52, 211, 153, 0.12)',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              color: '#34d399',
              fontSize: '0.8rem'
            }}
          >
            <CheckCircle2 size={15} />
            <span>Sugestão da API aplicada à equipe da escala!</span>
          </div>
        )}

        {/* Data do Culto */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="escala-data" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={15} style={{ color: 'var(--blue)' }} />
            <span>Data do Culto</span>
          </label>
          <input
            id="escala-data"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="input font-mono"
            required
          />
        </div>

        {/* Título do Culto com Chips de Sugestão */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="escala-titulo" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Tag size={15} style={{ color: 'var(--blue)' }} />
            <span>Título / Ocasião do Culto</span>
          </label>
          <input
            id="escala-titulo"
            type="text"
            placeholder="Ex: Culto de Domingo - Noite"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="input"
          />

          {/* Chips Rápidos */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {TITULOS_SUGESTOES.map((sugestao) => (
              <button
                key={sugestao}
                type="button"
                onClick={() => setTitulo(sugestao)}
                style={{
                  fontSize: '0.74rem',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: titulo === sugestao ? 'var(--blue-bg)' : 'var(--panel-elevated)',
                  border: titulo === sugestao ? '1px solid var(--blue)' : '1px solid var(--panel-line)',
                  color: titulo === sugestao ? 'var(--blue-glow)' : 'var(--muted)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
              >
                {sugestao}
              </button>
            ))}
          </div>
        </div>

        {/* Seção: Equipe do Culto */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
            Equipe Escalada
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              background: 'var(--bg)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--panel-line)'
            }}
          >
            {/* 1. Preletor */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label
                className="form-label"
                htmlFor="escala-preletor"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mic size={14} style={{ color: '#38bdf8' }} />
                  <span>🎙️ Preletor (Palavra)</span>
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                  {aptidaoPorFuncao.preletor.size} apto{aptidaoPorFuncao.preletor.size === 1 ? '' : 's'}
                </span>
              </label>
              <select
                id="escala-preletor"
                value={preletorId}
                onChange={(e) => setPreletorId(e.target.value)}
                className="select"
              >
                <option value="">-- Nenhum Selecionado --</option>
                {(() => {
                  const { aptos, outros } = getMembrosParaFuncao('preletor');
                  return (
                    <>
                      {aptos.length > 0 && (
                        <optgroup label="⭐ Membros Aptos (Cargos)">
                          {aptos.map((m) => (
                            <option key={m.id} value={m.id}>
                              ⭐ {m.nome}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="Demais Membros">
                        {outros.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nome}
                          </option>
                        ))}
                      </optgroup>
                    </>
                  );
                })()}
              </select>
            </div>

            {/* 2. Dirigente */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label
                className="form-label"
                htmlFor="escala-dirigente"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BookOpen size={14} style={{ color: '#a78bfa' }} />
                  <span>📖 Dirigente do Culto</span>
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                  {aptidaoPorFuncao.dirigente.size} apto{aptidaoPorFuncao.dirigente.size === 1 ? '' : 's'}
                </span>
              </label>
              <select
                id="escala-dirigente"
                value={dirigenteId}
                onChange={(e) => setDirigenteId(e.target.value)}
                className="select"
              >
                <option value="">-- Nenhum Selecionado --</option>
                {(() => {
                  const { aptos, outros } = getMembrosParaFuncao('dirigente');
                  return (
                    <>
                      {aptos.length > 0 && (
                        <optgroup label="⭐ Membros Aptos (Cargos)">
                          {aptos.map((m) => (
                            <option key={m.id} value={m.id}>
                              ⭐ {m.nome}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="Demais Membros">
                        {outros.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nome}
                          </option>
                        ))}
                      </optgroup>
                    </>
                  );
                })()}
              </select>
            </div>

            {/* 3. Cantor */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label
                className="form-label"
                htmlFor="escala-cantor"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Music size={14} style={{ color: '#f472b6' }} />
                  <span>🎤 Cantor (Louvor)</span>
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                  {aptidaoPorFuncao.cantor.size} apto{aptidaoPorFuncao.cantor.size === 1 ? '' : 's'}
                </span>
              </label>
              <select
                id="escala-cantor"
                value={cantorId}
                onChange={(e) => setCantorId(e.target.value)}
                className="select"
              >
                <option value="">-- Nenhum Selecionado --</option>
                {(() => {
                  const { aptos, outros } = getMembrosParaFuncao('cantor');
                  return (
                    <>
                      {aptos.length > 0 && (
                        <optgroup label="⭐ Membros Aptos (Cargos)">
                          {aptos.map((m) => (
                            <option key={m.id} value={m.id}>
                              ⭐ {m.nome}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="Demais Membros">
                        {outros.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nome}
                          </option>
                        ))}
                      </optgroup>
                    </>
                  );
                })()}
              </select>
            </div>

            {/* 4. Músico */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label
                className="form-label"
                htmlFor="escala-musico"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Guitar size={14} style={{ color: '#fb923c' }} />
                  <span>🎸 Músico (Instrumental)</span>
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                  {aptidaoPorFuncao.musico.size} apto{aptidaoPorFuncao.musico.size === 1 ? '' : 's'}
                </span>
              </label>
              <select
                id="escala-musico"
                value={musicoId}
                onChange={(e) => setMusicoId(e.target.value)}
                className="select"
              >
                <option value="">-- Nenhum Selecionado --</option>
                {(() => {
                  const { aptos, outros } = getMembrosParaFuncao('musico');
                  return (
                    <>
                      {aptos.length > 0 && (
                        <optgroup label="⭐ Membros Aptos (Cargos)">
                          {aptos.map((m) => (
                            <option key={m.id} value={m.id}>
                              ⭐ {m.nome}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="Demais Membros">
                        {outros.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nome}
                          </option>
                        ))}
                      </optgroup>
                    </>
                  );
                })()}
              </select>
            </div>
          </div>
        </div>

        {/* Datalist Compartilhado com o Acervo Completo de Playbacks */}
        <datalist id="playbacks-datalist">
          {PLAYBACKS_LIST.map((pb) => (
            <option key={pb} value={pb} />
          ))}
        </datalist>

        {/* Seção: Louvores do Culto */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
              Louvores do Culto (Playbacks)
            </span>
            <button
              type="button"
              onClick={handleSortearTodosLouvores}
              className="btn btn-panel"
              style={{
                padding: '6px 10px',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                borderColor: 'var(--panel-line)'
              }}
            >
              <Shuffle size={13} style={{ color: 'var(--blue)' }} />
              <span>Sortear 3 Louvores</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[0, 1, 2].map((idx) => {
              const valorLouvor = louvores[idx] || '';
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--panel-elevated)',
                    border: '1px solid var(--panel-line)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        color: 'var(--muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Louvor #{idx + 1}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {valorLouvor && (
                        <button
                          type="button"
                          onClick={() => handleClearLouvor(idx)}
                          className="btn-ghost"
                          style={{
                            padding: 4,
                            borderRadius: 'var(--radius-full)',
                            border: 'none',
                            color: 'var(--muted)',
                            cursor: 'pointer',
                            display: 'flex'
                          }}
                          title="Limpar louvor"
                        >
                          <X size={14} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSortearUmLouvor(idx)}
                        className="btn btn-panel"
                        style={{
                          padding: '3px 8px',
                          fontSize: '0.7rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                        title="Sortear outro louvor para este card"
                      >
                        <RotateCw size={11} />
                        <span>Sortear outro</span>
                      </button>
                    </div>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      list="playbacks-datalist"
                      value={valorLouvor}
                      onChange={(e) => handleUpdateLouvor(idx, e.target.value)}
                      placeholder="Digite ou escolha do acervo de playbacks..."
                      className="input"
                      style={{ fontSize: '0.84rem' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Observações */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="escala-obs" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileText size={15} style={{ color: 'var(--muted)' }} />
            <span>Observações e Avisos (Opcional)</span>
          </label>
          <textarea
            id="escala-obs"
            rows={3}
            placeholder="Ex: Culto em comemoração ao dia das mães, ceia do Senhor..."
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            className="textarea"
          />
        </div>

        {/* Rodapé / Ações */}
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
            style={{
              flex: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: submitting ? 0.6 : 1
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
                <span>{isEditing ? 'Salvar Alterações' : 'Criar Escala'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
