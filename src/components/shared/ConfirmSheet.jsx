import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import BottomSheet from './BottomSheet';

/**
 * ConfirmSheet Component
 * Sheet de confirmação para exclusão de registros.
 */
export default function ConfirmSheet({
  isOpen = false,
  onClose,
  onConfirm,
  title = 'Confirmar Exclusão',
  description = 'Esta ação é irreversível e removerá o registro permanentemente.',
  confirmText = 'Excluir Registro',
  isDeleting = false
}) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={isDeleting ? undefined : onClose}
      title={title}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'center', padding: '10px 4px' }}>
        <div style={{
          width: 50,
          height: 50,
          borderRadius: 'var(--radius-full)',
          background: 'var(--red-bg)',
          border: '1px solid var(--red-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto'
        }}>
          <AlertTriangle size={24} className="text-red-glow" />
        </div>

        <div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 600, marginBottom: 4 }}>
            Tem certeza que deseja continuar?
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.4 }}>
            {description}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="btn btn-panel"
            style={{ flex: 1 }}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="btn btn-danger"
            style={{ flex: 1 }}
          >
            {isDeleting ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                Excluindo…
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Trash2 size={16} />
                {confirmText}
              </span>
            )}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
