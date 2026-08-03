import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus, ArrowLeft, ShieldCheck, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { loginApi, registerApi, getStoredUser } from '../services/auth';
import AccessNoticeCard from './AccessNoticeCard';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  
  // Form fields
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [noticeMsg, setNoticeMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [accessRestriction, setAccessRestriction] = useState(null); // { status, message, user }

  // Check if already logged in
  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setNoticeMsg(`Você já está autenticado como ${user.nome || user.email}.`);
    }
  }, []);

  const handleTabSwitch = (newMode) => {
    setMode(newMode);
    setErrorMsg('');
    setNoticeMsg('');
    setSuccessMsg('');
    setAccessRestriction(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setNoticeMsg('');
    setSuccessMsg('');
    setAccessRestriction(null);

    if (!email || !email.includes('@')) {
      setErrorMsg('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    if (!senha || senha.length < 4) {
      setErrorMsg('A senha deve conter no mínimo 4 caracteres.');
      return;
    }

    if (mode === 'register') {
      if (!nome.trim()) {
        setErrorMsg('Por favor, informe o seu nome completo.');
        return;
      }
      if (senha !== confirmSenha) {
        setErrorMsg('As senhas digitadas não coincidem.');
        return;
      }
    }

    setLoading(true);

    try {
      let res;
      if (mode === 'login') {
        res = await loginApi(email, senha);
      } else {
        res = await registerApi(nome, email, senha);
      }

      if (res.isAccessRestriction) {
        setAccessRestriction({
          status: res.status || 'pendente',
          message: res.error,
          user: res.user || { email, nome: nome || email.split('@')[0] }
        });
        return;
      }

      if (res.success) {
        if (mode === 'register') {
          setSuccessMsg('Cadastro concluído com sucesso! Seu acesso está pendente de liberação pelo administrador.');
        } else {
          setSuccessMsg('Login realizado com sucesso! Redirecionando...');
        }
        if (res.notice) {
          setNoticeMsg(res.notice);
        }
        // Short delay before redirecting to dashboard
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        setErrorMsg(res.error || 'Ocorreu um erro durante a autenticação.');
      }
    } catch (err) {
      setErrorMsg('Erro inesperado de comunicação com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 🌊 Ambient Glass Background Orbs & Church Logo Watermark */}
      <div className="ambient-bg-orbs" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'clamp(280px, 60vw, 480px)',
          height: 'clamp(280px, 60vw, 480px)',
          pointerEvents: 'none',
          opacity: 0.05,
          zIndex: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img src="/church-logo-bw.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      </div>

      {accessRestriction ? (
        <div style={{ position: 'relative', zIndex: 10, width: '100%' }}>
          <AccessNoticeCard
            status={accessRestriction.status}
            user={accessRestriction.user}
            message={accessRestriction.message}
            onBackToLogin={() => setAccessRestriction(null)}
          />
        </div>
      ) : (
        /* Main Glass Card */
        <div style={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          borderTop: '4px solid #c62828',
          borderRadius: '28px',
          padding: '36px 32px',
          boxShadow: '0 24px 60px -12px rgba(15, 23, 42, 0.18), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
          position: 'relative',
          zIndex: 10
        }}>
        {/* Back Link */}
        <a 
          href="/" 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#64748b',
            textDecoration: 'none',
            marginBottom: '20px',
            transition: 'color 0.2s ease'
          }}
          className="hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Voltar ao Painel Principal
        </a>

        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: '#ffffff',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px auto',
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.08)'
          }}>
            <img src="/church-logo-color.jpg" alt="IMW Logo" style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
          </div>

          <span style={{
            fontSize: '0.7rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: '#64748b',
            display: 'block'
          }}>
            Igreja Metodista Wesleyana
          </span>
          <h1 style={{
            fontSize: '1.45rem',
            fontWeight: 900,
            color: '#0f172a',
            margin: '4px 0 0 0',
            letterSpacing: '-0.025em'
          }}>
            {mode === 'login' ? 'Acesse sua Conta' : 'Criar Nova Conta'}
          </h1>
          <p style={{ fontSize: '0.83rem', color: '#64748b', marginTop: '6px', marginBotton: 0 }}>
            {mode === 'login' 
              ? 'Entre com seu e-mail e senha para acessar os relatórios' 
              : 'Preencha seus dados abaixo para registrar seu perfil'}
          </p>
        </div>

        {/* Tab Segment Switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: '#f1f5f9',
          padding: '4px',
          borderRadius: '9999px',
          border: '1px solid #e2e8f0',
          marginBottom: '24px'
        }}>
          <button
            type="button"
            onClick={() => handleTabSwitch('login')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: mode === 'login' ? 800 : 600,
              background: mode === 'login' ? '#1565c0' : 'transparent',
              color: mode === 'login' ? '#ffffff' : '#64748b',
              boxShadow: mode === 'login' ? '0 4px 12px rgba(21, 101, 192, 0.25)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <LogIn size={16} />
            Entrar
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('register')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: mode === 'register' ? 800 : 600,
              background: mode === 'register' ? '#1565c0' : 'transparent',
              color: mode === 'register' ? '#ffffff' : '#64748b',
              boxShadow: mode === 'register' ? '0 4px 12px rgba(21, 101, 192, 0.25)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <UserPlus size={16} />
            Cadastrar
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#b91c1c',
            borderRadius: '14px',
            padding: '12px 14px',
            fontSize: '0.825rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            marginBottom: '20px'
          }} role="alert" aria-live="polite">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {noticeMsg && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#b45309',
            borderRadius: '14px',
            padding: '12px 14px',
            fontSize: '0.825rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            marginBottom: '20px'
          }} aria-live="polite">
            <Sparkles size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{noticeMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#047857',
            borderRadius: '14px',
            padding: '12px 14px',
            fontSize: '0.825rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            marginBottom: '20px'
          }} role="status" aria-live="polite">
            <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Nome Field (Register Mode Only) */}
          {mode === 'register' && (
            <div>
              <label htmlFor="auth-nome" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Nome Completo
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  id="auth-nome"
                  name="nome"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Ex: João da Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '14px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="auth-email" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              E-mail
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                id="auth-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                spellCheck={false}
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '14px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.9rem',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>
          </div>

          {/* Senha Field */}
          <div>
            <label htmlFor="auth-senha" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Senha
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                id="auth-senha"
                name="senha"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 42px',
                  borderRadius: '14px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.9rem',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: '4px'
                }}
                title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirmar Senha Field (Register Mode Only) */}
          {mode === 'register' && (
            <div>
              <label htmlFor="auth-confirm-senha" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Confirmar Senha
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  id="auth-confirm-senha"
                  name="confirmSenha"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmSenha}
                  onChange={(e) => setConfirmSenha(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '14px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              width: '100%',
              padding: '14px',
              borderRadius: '9999px',
              border: 'none',
              background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 6px 20px rgba(21, 101, 192, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? (
              <>
                <div className="animate-spin" style={{
                  width: 18,
                  height: 18,
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  borderTopColor: '#ffffff',
                  borderRadius: '50%'
                }} />
                <span>Processando…</span>
              </>
            ) : mode === 'login' ? (
              <>
                <LogIn size={18} />
                <span>Entrar no Sistema</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Cadastrar Minha Conta</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <ShieldCheck size={14} color="#10b981" />
          <span>Conexão criptografada com suporte a API REST & JWT Token</span>
        </div>
      </div>
      )}
    </div>
  );
}
