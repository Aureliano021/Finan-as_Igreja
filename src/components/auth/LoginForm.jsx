import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react';
import { loginApi } from '../../services/auth';

/**
 * LoginForm Component
 * @param {Object} props
 * @param {Function} props.onSuccess - Callback quando o login é aprovado
 * @param {Function} props.onAccessRestricted - Callback quando o acesso é pendente/negado
 * @param {Function} props.onError - Callback de erro de rede ou credenciais
 */
export default function LoginForm({
  onSuccess,
  onAccessRestricted,
  onError
}) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      onError('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    if (!senha || senha.length < 4) {
      onError('A senha deve conter no mínimo 4 caracteres.');
      return;
    }

    setLoading(true);
    onError('');

    try {
      const res = await loginApi(cleanEmail, senha);

      if (res.isAccessRestriction) {
        onAccessRestricted({
          status: res.status || 'pending',
          message: res.error,
          user: res.user
        });
        return;
      }

      if (res.success) {
        onSuccess(res.user);
      } else {
        onError(res.error || 'Credenciais inválidas ou erro no login.');
      }
    } catch {
      onError('Falha ao conectar com o servidor. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Campo E-mail */}
      <div className="form-group">
        <label className="form-label" htmlFor="login-email">E-mail</label>
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
            id="login-email"
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
        <label className="form-label" htmlFor="login-password">Senha</label>
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
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="input font-mono"
            style={{ paddingLeft: 40, paddingRight: 40 }}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--muted)',
              cursor: 'pointer',
              display: 'flex',
              padding: 4
            }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Botão Entrar */}
      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary btn-block"
        style={{ marginTop: 8, padding: '12px 18px' }}
      >
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="animate-spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
            Entrando…
          </span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LogIn size={17} />
            Acessar Sistema
            <ArrowRight size={15} />
          </span>
        )}
      </button>
    </form>
  );
}
