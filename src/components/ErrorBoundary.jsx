import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary capturou um erro de renderização:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0b0f19',
          color: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'sans-serif'
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            background: '#151c2c',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.15)',
              color: '#fb7185',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <AlertOctagon size={28} />
            </div>

            <h2 style={{ fontSize: '1.25rem', margin: '0 0 8px 0', color: '#f8fafc' }}>
              Ops! Ocorreu um imprevisto na exibição.
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '0 0 16px 0' }}>
              Isso pode ocorrer por um dado inconsistente retornado do servidor ou falha pontual de renderização.
            </p>

            {this.state.error && (
              <details style={{
                textAlign: 'left',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                borderRadius: '8px',
                padding: '10px 12px',
                marginBottom: '20px',
                fontSize: '0.78rem',
                color: '#fca5a5',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#fb7185', marginBottom: '6px' }}>
                  Detalhes Técnicos do Erro ({this.state.error.name || 'Error'})
                </summary>
                <div style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  <strong>{String(this.state.error.message || this.state.error)}</strong>
                  {this.state.error.stack && (
                    <div style={{ marginTop: '6px', color: '#94a3b8', fontSize: '0.72rem' }}>
                      {this.state.error.stack}
                    </div>
                  )}
                </div>
              </details>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={this.handleReload}
                style={{
                  background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <RefreshCw size={15} />
                Recarregar Aplicação
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
