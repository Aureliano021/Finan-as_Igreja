import React, { useState, useEffect } from 'react';
import { Server, Activity, RotateCcw, Check, AlertCircle, Save } from 'lucide-react';
import BottomSheet from '../shared/BottomSheet';
import { getApiUrl, setApiUrl, checkApiHealth } from '../../services/api';

/**
 * ApiConfigSheet Component
 * Configuração e teste da URL da API backend.
 */
export default function ApiConfigSheet({
  isOpen = false,
  onClose,
  onSuccess
}) {
  const [apiUrl, setApiUrlState] = useState('');
  const [testing, setTesting] = useState(false);
  const [healthResult, setHealthResult] = useState(null); // { online: bool, message: string }

  useEffect(() => {
    if (isOpen) {
      setApiUrlState(getApiUrl());
      setHealthResult(null);
    }
  }, [isOpen]);

  const handleTestConnection = async () => {
    setTesting(true);
    setHealthResult(null);
    try {
      const res = await checkApiHealth(apiUrl.trim());
      setHealthResult(res);
    } catch {
      setHealthResult({ online: false, message: 'Falha ao conectar com o servidor.' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const cleanUrl = apiUrl.trim();
    const savedUrl = setApiUrl(cleanUrl);
    setApiUrlState(savedUrl);
    if (onSuccess) onSuccess(`URL da API salva: ${savedUrl}`);
    onClose();
  };

  const handleResetDefault = () => {
    setApiUrl('/api');
    setApiUrlState('/api');
    setHealthResult(null);
    if (onSuccess) onSuccess('Restaurada a URL padrão (/api).');
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Configuração do Servidor API"
    >
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: 0 }}>
          Defina o endereço base para onde o frontend envia as requisições (padrão: <code>/api</code> com proxy para a porta 8000).
        </p>

        {/* Input URL */}
        <div className="form-group">
          <label className="form-label" htmlFor="api-url">Endereço Base da API</label>
          <div style={{ position: 'relative' }}>
            <Server
              size={16}
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--blue-glow)',
                pointerEvents: 'none'
              }}
            />
            <input
              id="api-url"
              type="text"
              placeholder="/api ou http://localhost:8000"
              value={apiUrl}
              onChange={(e) => setApiUrlState(e.target.value)}
              className="input font-mono"
              style={{ paddingLeft: 38, fontSize: '0.88rem' }}
              required
            />
          </div>
        </div>

        {/* Resultado do Teste de Conexão */}
        {healthResult ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            background: healthResult.online ? 'var(--blue-bg)' : 'var(--red-bg)',
            border: `1px solid ${healthResult.online ? 'var(--blue-border)' : 'var(--red-border)'}`,
            fontSize: '0.8rem',
            color: healthResult.online ? 'var(--blue-glow)' : 'var(--red-glow)'
          }}>
            {healthResult.online ? <Check size={16} /> : <AlertCircle size={16} />}
            <span>{healthResult.message}</span>
          </div>
        ) : null}

        {/* Ações Secundárias */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="btn btn-panel btn-sm"
            style={{ flex: 1 }}
          >
            <Activity size={14} className={testing ? 'animate-spin text-blue' : ''} />
            {testing ? 'Testando…' : 'Testar Conexão'}
          </button>

          <button
            type="button"
            onClick={handleResetDefault}
            className="btn btn-panel btn-sm"
            style={{ flex: 1 }}
          >
            <RotateCcw size={14} />
            Padrão (/api)
          </button>
        </div>

        {/* Ações Principais */}
        <div style={{ display: 'flex', gap: 10, marginTop: 10, paddingTop: 12, borderTop: '1px solid var(--panel-line)' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-panel"
            style={{ flex: 1 }}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            <Save size={16} />
            Salvar URL
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
