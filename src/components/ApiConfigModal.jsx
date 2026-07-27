import React, { useState } from 'react';
import { X, Server, CheckCircle2, AlertTriangle, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';
import { getApiUrl, setApiUrl, isMockModeForced, setMockModeForced, checkApiHealth } from '../services/api';

export default function ApiConfigModal({ isOpen, onClose, onSaved }) {
  const [url, setUrlInput] = useState(getApiUrl());
  const [useMock, setUseMockState] = useState(isMockModeForced());
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setApiUrl(url);
    const result = await checkApiHealth();
    setTestResult(result);
    setTesting(false);
  };

  const handleSave = () => {
    setApiUrl(url);
    setMockModeForced(useMock);
    onSaved();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }} className="no-print animate-fade-in">
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Server size={20} color="var(--accent-primary)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              Configuração da API Backend
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              URL da API Python (FastAPI):
            </label>
            <input 
              type="text" 
              className="text-input" 
              style={{ width: '100%' }}
              value={url}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="http://localhost:8000"
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Certifique-se de habilitar o CORSMiddleware em seu <code>controller.py</code>.
            </span>
          </div>

          {/* Toggle Mock Mode */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)', display: 'block' }}>
                Forçar Modo Mock (Dados Fictícios)
              </strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Utilize para apresentações ou quando o banco não estiver ativo.
              </span>
            </div>
            <button 
              onClick={() => setUseMockState(!useMock)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: useMock ? '#fbbf24' : 'var(--text-muted)' }}
            >
              {useMock ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
            </button>
          </div>

          {/* Connection Test Box */}
          {testResult && (
            <div style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: testResult.online ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              border: `1px solid ${testResult.online ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
              color: testResult.online ? '#34d399' : '#fb7185'
            }}>
              {testResult.online ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button 
              onClick={handleTestConnection} 
              disabled={testing}
              className="btn btn-secondary" 
              style={{ flex: 1 }}
            >
              <RefreshCw size={14} className={testing ? 'animate-spin' : ''} />
              {testing ? 'Testando...' : 'Testar Conexão'}
            </button>
            <button 
              onClick={handleSave} 
              className="btn btn-primary" 
              style={{ flex: 1 }}
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
