import React from 'react';

/**
 * Badge Component
 * @param {Object} props
 * @param {'blue' | 'red' | 'neutral'} [props.variant='neutral'] - Semântica de cor
 * @param {React.ReactNode} props.children - Conteúdo do badge
 * @param {string} [props.className=''] - Classes adicionais
 */
export default function Badge({
  variant = 'neutral',
  children,
  className = '',
  ...props
}) {
  const variantClass = variant === 'blue'
    ? 'badge-blue'
    : variant === 'red'
    ? 'badge-red'
    : 'badge-neutral';

  return (
    <span className={`badge ${variantClass} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}
