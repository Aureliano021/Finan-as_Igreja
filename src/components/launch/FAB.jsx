import React from 'react';
import { Plus } from 'lucide-react';

/**
 * FAB Component
 * Botão flutuante de ação rápida posicionado sobre a barra inferior mobile.
 */
export default function FAB({
  onClick,
  ariaLabel = 'Lançar movimentação financeira'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fab-button"
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <Plus size={26} strokeWidth={2.4} />
    </button>
  );
}
