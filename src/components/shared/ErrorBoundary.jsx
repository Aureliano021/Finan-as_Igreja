import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * ErrorBoundary Component
 * Captura exceções em componentes filhos evitando que a árvore React quebre.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught an error]:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: 'var(--bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div className="card" style={{ maxWidth: 440, width: '100%', textAlign: 'center', padding: '32px 20px' }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: 'var(--radius-full)',
              background: 'var(--red-bg)',
              border: '1px solid var(--red-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <AlertTriangle size={24} className="text-red-glow" />
            </div>

            <h2 style={{ fontSize: '1.2rem', marginBottom: 8 }}>Ocorreu um erro na interface</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 20 }}>
              {this.state.error?.message || 'Houve uma falha inesperada ao renderizar este componente.'}
            </p>

            <button
              type="button"
              onClick={this.handleReload}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              <RefreshCw size={16} />
              Recarregar Aplicação
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
