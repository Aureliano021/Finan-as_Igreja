import React, { useState } from 'react';
import { User, Mail, Lock, UserPlus, Info } from 'lucide-react';
import { registerApi } from '../../services/auth';

/**
 * RegisterForm Component
 * @param {Object} props
 * @param {Function} props.onSuccess - Callback quando o cadastro é aceito imediatamente
 * @param {Function} props.onAccessRestricted - Callback quando o cadastro entra em aprovação pendente
 * @param {Function} props.onError - Callback de erro
 */
export default function RegisterForm({
  onSuccess,
  onAccessRestricted,
  onError
}) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const cleanNome = nome.trim();
    const cleanEmail = email.trim();

    if (!cleanNome) {
      onError('Por favor, informe seu nome completo.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      onError('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    if (!senha || senha.length < 8) {
      onError('A senha deve conter no mínimo 8 caracteres.');
      return;
    }

    if (senha !== confirmSenha) {
      onError('As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);
    onError('');

    try {
      const res = await registerApi(cleanNome, cleanEmail, senha);

      if (res.isOffline) {
        onAccessRestricted({
          status: 'offline',
          message: res.error || 'O servidor da aplicação está offline no momento. Entre em contato com o administrador para ligar o sistema.',
          user: { nome: cleanNome, email: cleanEmail }
        });
        return;
      }

      if (res.isAccessRestriction || res.status === 'pendente') {
        onAccessRestricted({
          status: 'pending',
          message: res.error || 'Cadastro realizado com sucesso! Aguarde a aprovação do administrador para ter acesso total.',
          user: res.user || { nome: cleanNome, email: cleanEmail }
        });
        return;
      }

      if (res.success) {
        onSuccess(res.user);
      } else {
        onError(res.error || 'Erro ao realizar cadastro.');
      }
    } catch {
      onAccessRestricted({
        status: 'offline',
        message: 'O servidor da aplicação está offline no momento. Entre em contato com o administrador para ligar o sistema.',
        user: { nome: cleanNome, email: cleanEmail }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Campo Nome */}
      <div className="form-group">
        <label className="form-label" htmlFor="reg-name">Nome Completo</label>
        <div style={{ position: 'relative' }}>
          <User
            size={16}
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--muted)',
              pointerEvents: 'none'
            }}
          />
          <input
            id="reg-name"
            type="text"
            placeholder="Ex: João da Silva"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="input"
            style={{ paddingLeft: 40 }}
            required
          />
        </div>
      </div>

      {/* Campo E-mail */}
      <div className="form-group">
        <label className="form-label" htmlFor="reg-email">E-mail</label>
        <div style={{ position: 'relative' }}>
          <Mail
            size={16}
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--muted)',
              pointerEvents: 'none'
            }}
          />
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            placeholder="exemplo@igreja.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            style={{ paddingLeft: 40 }}
            required
          />
        </div>
      </div>

      {/* Campo Senha */}
      <div className="form-group">
        <label className="form-label" htmlFor="reg-pass">Senha</label>
        <div style={{ position: 'relative' }}>
          <Lock
            size={16}
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--muted)',
              pointerEvents: 'none'
            }}
          />
          <input
            id="reg-pass"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="input font-mono"
            style={{ paddingLeft: 40 }}
            required
          />
        </div>
      </div>

      {/* Campo Confirmar Senha */}
      <div className="form-group">
        <label className="form-label" htmlFor="reg-confirm-pass">Confirmar Senha</label>
        <div style={{ position: 'relative' }}>
          <Lock
            size={16}
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--muted)',
              pointerEvents: 'none'
            }}
          />
          <input
            id="reg-confirm-pass"
            type="password"
            autoComplete="new-password"
            placeholder="Repita a senha"
            value={confirmSenha}
            onChange={(e) => setConfirmSenha(e.target.value)}
            className="input font-mono"
            style={{ paddingLeft: 40 }}
            required
          />
        </div>
      </div>

      {/* Info Notice */}
      <div style={{
        background: 'var(--bg)',
        border: '1px solid var(--panel-line)',
        borderRadius: 'var(--radius-sm)',
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        fontSize: '0.78rem',
        color: 'var(--muted)'
      }}>
        <Info size={15} style={{ flexShrink: 0, marginTop: 2, color: 'var(--blue-glow)' }} />
        <span>Novas contas passam por validação do administrador antes da liberação dos dados financeiros.</span>
      </div>

      {/* Botão Criar Conta */}
      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary btn-block"
        style={{ marginTop: 6, padding: '12px 18px' }}
      >
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="animate-spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
            Cadastrando…
          </span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserPlus size={17} />
            Solicitar Cadastro
          </span>
        )}
      </button>
    </form>
  );
}
