import { getApiUrl, getFallbackApiUrl } from './api';

const AUTH_TOKEN_KEY = 'igreja_auth_token';
const AUTH_USER_KEY = 'igreja_auth_user';

/**
 * Get stored JWT auth token
 */
export function getStoredToken() {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Get stored user profile object
 */
export function getStoredUser() {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (user && !user.status) {
      user.status = user.role === 'admin' ? 'aceito' : 'pendente';
    }
    return user;
  } catch (e) {
    console.warn('Erro ao decodificar usuario salvo:', e);
    return null;
  }
}

/**
 * Get normalized status for user ('pendente' | 'aceito' | 'negado')
 */
export function getUserStatus(user) {
  if (!user) return 'pendente';
  const rawStatus = (user.status || user.status_acesso || user.role || 'pendente').toLowerCase();
  if (rawStatus === 'aceito' || rawStatus === 'approved' || rawStatus === 'ativo' || rawStatus === 'admin') {
    return 'aceito';
  }
  if (rawStatus === 'negado' || rawStatus === 'rejected' || rawStatus === 'bloqueado') {
    return 'negado';
  }
  return 'pendente';
}

/**
 * Save auth payload to local storage
 */
export function setAuth(token, user) {
  if (typeof localStorage === 'undefined') return;
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
  if (user) {
    const normalizedUser = {
      ...user,
      status: getUserStatus(user)
    };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(normalizedUser));
  } else {
    localStorage.removeItem(AUTH_USER_KEY);
  }
  // Dispatch custom storage event for sync across tabs/components
  window.dispatchEvent(new Event('auth-change'));
}

/**
 * Clear auth data (Logout)
 */
export function logout() {
  setAuth(null, null);
}

/**
 * Authenticate existing user with email & password
 */
export async function loginApi(email, senha) {
  const baseUrl = getApiUrl();
  let endpoint = `${baseUrl}/auth/login`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    let response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha }),
        signal: controller.signal
      });
    } catch (primaryErr) {
      const fallbackUrl = getFallbackApiUrl(baseUrl);
      if (fallbackUrl && fallbackUrl !== baseUrl) {
        endpoint = `${fallbackUrl}/auth/login`;
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, senha }),
          signal: controller.signal
        });
      } else {
        throw primaryErr;
      }
    }
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const rawUser = data.user || {
        nome: data.nome || email.split('@')[0],
        email: email,
        id: data.id || 1,
        status: data.status || data.role || 'aceito'
      };
      const user = {
        ...rawUser,
        status: getUserStatus(rawUser)
      };

      // If user status is pending or denied before token generation
      if (user.status === 'pendente' || user.status === 'negado') {
        return {
          success: false,
          isAccessRestriction: true,
          status: user.status,
          error: data.message || data.detail || (user.status === 'negado' 
            ? 'Seu acesso foi negado pelo administrador.' 
            : 'Seu cadastro está pendente de aprovação pelo administrador.'),
          user
        };
      }

      const token = data.access_token || data.token;
      if (!token) {
        return { 
          success: false, 
          isAccessRestriction: true,
          status: 'pendente',
          error: data.message || data.detail || 'Seu acesso ainda não possui token liberado. Entre em contato com o administrador.',
          user
        };
      }

      setAuth(token, user);
      return { success: true, token, user };
    }

    const errData = await response.json().catch(() => null);
    const message = typeof errData?.detail === 'string' 
      ? errData.detail 
      : errData?.message || `Erro de autenticação (${response.status}).`;

    const statusFromErr = errData?.status || errData?.status_acesso;
    const normStatus = statusFromErr ? getUserStatus({ status: statusFromErr }) : null;
    const lowerMsg = message.toLowerCase();
    const isPendingOrDenied = normStatus === 'pendente' || normStatus === 'negado' ||
      response.status === 403 ||
      lowerMsg.includes('pendente') || lowerMsg.includes('aprovaç') || lowerMsg.includes('aprovac') || lowerMsg.includes('negado') || lowerMsg.includes('restringido');

    if (isPendingOrDenied) {
      const detectedStatus = normStatus || (lowerMsg.includes('negado') ? 'negado' : 'pendente');
      return {
        success: false,
        isAccessRestriction: true,
        status: detectedStatus,
        error: message,
        user: errData?.user || { email, nome: email.split('@')[0] }
      };
    }

    return { success: false, error: message };
  } catch (err) {
    console.warn('Erro de conexão no login:', err);
    return {
      success: false,
      isOffline: true,
      error: 'O servidor da aplicação está offline no momento. Entre em contato com o administrador para ligar o sistema.'
    };
  }
}

/**
 * Register a new user with nome, email, and password
 */
export async function registerApi(nome, email, senha) {
  const baseUrl = getApiUrl();
  let endpoint = `${baseUrl}/auth/register`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    let response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nome, email, senha }),
        signal: controller.signal
      });
    } catch (primaryErr) {
      const fallbackUrl = getFallbackApiUrl(baseUrl);
      if (fallbackUrl && fallbackUrl !== baseUrl) {
        endpoint = `${fallbackUrl}/auth/register`;
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ nome, email, senha }),
          signal: controller.signal
        });
      } else {
        throw primaryErr;
      }
    }
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const rawUser = data.user || {
        nome: nome || data.nome || email.split('@')[0],
        email: email,
        id: data.id || Date.now(),
        status: data.status || 'pendente'
      };
      const user = {
        ...rawUser,
        status: getUserStatus(rawUser)
      };

      const token = data.access_token || data.token;
      if (!token || user.status !== 'aceito') {
        return {
          success: false,
          isAccessRestriction: true,
          status: user.status,
          error: data.message || data.detail || 'Cadastro realizado com sucesso! Seu acesso está pendente de aprovação do administrador.',
          user
        };
      }

      setAuth(token, user);
      return { success: true, token, user, status: user.status };
    }

    const errData = await response.json().catch(() => null);
    const message = typeof errData?.detail === 'string'
      ? errData.detail
      : errData?.message || `Erro no cadastro (${response.status}).`;

    return { success: false, error: message };
  } catch (err) {
    console.warn('Erro de conexão no cadastro:', err);
    return {
      success: false,
      isOffline: true,
      error: 'O servidor da aplicação está offline no momento. Entre em contato com o administrador para ligar o sistema.'
    };
  }
}
