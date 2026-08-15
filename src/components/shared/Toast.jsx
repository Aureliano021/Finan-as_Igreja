import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

/**
 * Toast Component
 * @param {Object} props
 * @param {'success' | 'error' | 'info'} [props.type='success']
 * @param {string} props.message
 * @param {Function} props.onClose
 * @param {number} [props.duration=4000]
 */
export default function Toast({
  type = 'success',
  message,
  onClose,
  duration = 4000
}) {
  useEffect(() => {
    if (!duration || !onClose) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!message) return null;

  const isRed = type === 'error';
  const toastClass = isRed ? 'toast-red' : 'toast-blue';

  return (
    <div className="toast-container">
      <div className={`toast ${toastClass}`} role="alert">
        <div className="toast-icon" style={{ flexShrink: 0, display: 'flex' }}>
          {isRed ? (
            <AlertCircle size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )}
        </div>
        <span style={{ flex: 1 }}>{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Fechar notificação"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--muted)',
              cursor: 'pointer',
              display: 'flex',
              padding: 2
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
