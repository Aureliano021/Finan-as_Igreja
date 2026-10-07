import React from 'react';
import {
  CalendarDays,
  Sparkles,
  Music,
  Mic,
  BookOpen,
  Guitar,
  ArrowRight,
  Clock
} from 'lucide-react';
import { deserializeEscalaDescricao } from '../../services/cultos';
import { formatDateBR } from '../../services/utils';

/**
 * Determina o próximo culto (data mais próxima igual ou posterior a hoje,
 * ou o mais recente caso todos sejam no passado).
 */
function getNextCulto(escalas = []) {
  if (!Array.isArray(escalas) || escalas.length === 0) return null;

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  // Cultos futuros ou hoje
  const upcoming = escalas.filter((e) => {
    if (!e || !e.data) return false;
    const dStr = String(e.data).slice(0, 10);
    return dStr >= todayStr;
  });

  upcoming.sort((a, b) => {
    const da = String(a.data).slice(0, 10);
    const db = String(b.data).slice(0, 10);
    return da.localeCompare(db);
  });

  if (upcoming.length > 0) {
    return { ...upcoming[0], isUpcoming: true };
  }

  // Se todos forem no passado, pega o último realizado
  const past = [...escalas].sort((a, b) => {
    const da = String(a.data).slice(0, 10);
    const db = String(b.data).slice(0, 10);
    return db.localeCompare(da);
  });

  return { ...past[0], isUpcoming: false, isPast: true };
}

/**
 * Retorna o rótulo de data amigável (HOJE, AMANHÃ, ou dia da semana formatado).
 */
function getRelativeDateLabel(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const cleanDate = String(dateStr).slice(0, 10);
  if (cleanDate === todayStr) {
    return '🔥 HOJE';
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomYear = tomorrow.getFullYear();
  const tomMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const tomDay = String(tomorrow.getDate()).padStart(2, '0');
  const tomorrowStr = `${tomYear}-${tomMonth}-${tomDay}`;

  if (cleanDate === tomorrowStr) {
    return '⚡ AMANHÃ';
  }

  try {
    const [y, m, d] = cleanDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d, 12, 0, 0);
    const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${weekdays[dateObj.getDay()]}, ${d} de ${months[dateObj.getMonth()]}`;
  } catch {
    return formatDateBR(cleanDate);
  }
}

/**
 * NextCultoCard Component
 * Card de destaque que puxa o próximo culto cadastrado com equipe escalada e louvores.
 *
 * @param {Object} props
 * @param {Array} props.escalas - Lista completa de escalas
 * @param {Object} props.membrosMap - Dicionário de id -> membro
 * @param {() => void} [props.onManageCultos] - Callback para abrir a tela de gerenciamento de escalas
 * @param {boolean} [props.showManageButton=true]
 */
export default function NextCultoCard({
  escalas = [],
  membrosMap = {},
  onManageCultos,
  showManageButton = true
}) {
  const nextCulto = React.useMemo(() => getNextCulto(escalas), [escalas]);

  if (!nextCulto) {
    return (
      <div
        className="card"
        style={{
          padding: '16px 18px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--panel)',
          border: '1px solid var(--panel-line)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--panel-elevated)',
            border: '1px solid var(--panel-line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--muted)'
          }}>
            <CalendarDays size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600, color: 'var(--text)' }}>
              Nenhum culto agendado
            </h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--muted)' }}>
              A escala do próximo culto ainda não foi registrada.
            </p>
          </div>
        </div>

        {showManageButton && onManageCultos && (
          <button
            type="button"
            onClick={onManageCultos}
            className="btn btn-primary btn-sm"
            style={{ fontSize: '0.78rem', padding: '6px 12px', whiteSpace: 'nowrap' }}
          >
            Cadastrar
          </button>
        )}
      </div>
    );
  }

  const descObj = deserializeEscalaDescricao(nextCulto.descricao);
  const tituloCulto = descObj.titulo || 'Culto de Celebração';
  const louvores = Array.isArray(descObj.louvores) ? descObj.louvores : [];
  const itens = Array.isArray(nextCulto.itens) ? nextCulto.itens : [];
  const dateLabel = getRelativeDateLabel(nextCulto.data);

  return (
    <div
      className="card"
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '18px 20px',
        borderRadius: 'var(--radius-md)',
        background: 'linear-gradient(145deg, var(--panel) 0%, var(--panel-elevated) 100%)',
        border: '1px solid var(--blue-border)',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }}
    >
      {/* Faixa / Badge de Topo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.74rem',
            fontWeight: 700,
            background: nextCulto.isUpcoming ? 'var(--blue-bg)' : 'var(--panel-hover)',
            color: nextCulto.isUpcoming ? 'var(--blue-glow)' : 'var(--muted)',
            border: `1px solid ${nextCulto.isUpcoming ? 'var(--blue-border)' : 'var(--panel-line)'}`,
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}>
            {nextCulto.isUpcoming ? <Sparkles size={12} /> : <Clock size={12} />}
            {dateLabel}
          </span>

          {!nextCulto.isUpcoming && (
            <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontStyle: 'italic' }}>
              (Último culto realizado)
            </span>
          )}
        </div>

        {showManageButton && onManageCultos && (
          <button
            type="button"
            onClick={onManageCultos}
            className="btn-ghost"
            style={{
              fontSize: '0.76rem',
              color: 'var(--blue-glow)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 'var(--radius-xs)'
            }}
          >
            <span>Gerenciar Escala</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>

      {/* Título do Culto */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', fontWeight: 600 }}>
          Próximo Culto
        </span>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.2rem',
          fontWeight: 700,
          color: 'var(--text)',
          margin: 0
        }}>
          {tituloCulto}
        </h3>
      </div>

      {/* Equipe Escalada (Grid de 4 Funções) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: 8,
        padding: '12px',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--panel)',
        border: '1px solid var(--panel-line)'
      }}>
        {[
          { role: 'preletor', label: 'Preletor', badge: '🎙️', icon: Mic, color: '#38bdf8' },
          { role: 'dirigente', label: 'Dirigente', badge: '📖', icon: BookOpen, color: '#a78bfa' },
          { role: 'cantor', label: 'Cantor(a)', badge: '🎤', icon: Music, color: '#f472b6' },
          { role: 'musico', label: 'Músico', badge: '🎸', icon: Guitar, color: '#fb923c' }
        ].map((cfg) => {
          const matchedItem = itens.find((it) => {
            const f = (it.funcao || '').toLowerCase();
            return f.includes(cfg.role) || (cfg.role === 'musico' && f.includes('músico'));
          });
          const membro = matchedItem ? membrosMap[matchedItem.membro_id] : null;

          return (
            <div key={cfg.role} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: '0.68rem', color: cfg.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                {cfg.badge} {cfg.label}
              </span>
              <span style={{
                fontSize: '0.84rem',
                fontWeight: membro ? 600 : 400,
                color: membro ? 'var(--text)' : 'var(--muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {membro ? membro.nome : '—'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Hinos / Louvores Escolhidos */}
      {louvores.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Music size={13} style={{ color: 'var(--blue-glow)' }} /> Hinos & Louvores ({louvores.length}):
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {louvores.map((louvor, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.76rem',
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--panel)',
                  border: '1px solid var(--panel-line)',
                  color: 'var(--text)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span style={{
                  color: 'var(--blue-glow)',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem'
                }}>
                  {idx + 1}.
                </span>
                {louvor}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Observações (se houver) */}
      {descObj.observacoes && (
        <p style={{
          fontSize: '0.78rem',
          fontStyle: 'italic',
          color: 'var(--muted)',
          margin: 0,
          paddingTop: 6,
          borderTop: '1px dashed var(--panel-line)'
        }}>
          "{descObj.observacoes}"
        </p>
      )}
    </div>
  );
}
