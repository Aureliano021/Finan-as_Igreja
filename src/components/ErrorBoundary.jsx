import React from 'react';
import { AlertOctagon, RefreshCw, Database } from 'lucide-react';
import { setMockModeForced } from '../services/api';

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

  handleForceMock = () => {
    setMockModeForced(true);
    window.location.reload();
  };

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
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '0 0 24px 0' }}>
              Isso pode ocorrer por um dado inconsistente retornado do servidor ou falha pontual de renderização.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={this.handleForceMock}
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 18px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Database size={16} />
                Ativar Modo Mock (Dados Fictícios Seguros)
              </button>

              <button 
                onClick={this.handleReload}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#f8fafc',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <RefreshCw size={14} />
                Recarregar Página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
