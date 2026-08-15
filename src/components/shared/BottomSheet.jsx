import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * BottomSheet Component (Composto)
 */
export default function BottomSheet({
  isOpen = false,
  onClose,
  title = '',
  children
}) {
  // Bloqueia scroll do body e trata Escape
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="bottom-sheet-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bottom-sheet">
        <div className="bottom-sheet-handle" />

        {title && (
          <div className="bottom-sheet-header">
            <h2 className="bottom-sheet-title">{title}</h2>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="btn-ghost"
                style={{
                  padding: 6,
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        <div className="bottom-sheet-body">
          {children}
        </div>
      </div>
    </div>
  );
}

BottomSheet.Body = function BottomSheetBody({ children, style = {} }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 12, ...style }}>{children}</div>;
};

BottomSheet.Footer = function BottomSheetFooter({ children, style = {} }) {
  return (
    <div style={{
      display: 'flex',
      gap: 10,
      marginTop: 20,
      paddingTop: 16,
      borderTop: '1px solid var(--panel-line)',
      ...style
    }}>
      {children}
    </div>
  );
};
