import { logout, getStoredToken } from './auth';

const API_URL_KEY = 'igreja_api_url';

export function getApiUrl() {
  const currentHost = (typeof window !== 'undefined' && window.location && window.location.hostname) 
    ? window.location.hostname 
    : 'localhost';

  const saved = (typeof localStorage !== 'undefined') ? localStorage.getItem(API_URL_KEY) : null;
  let url = '';
  
  if (saved) {
    if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
      if (saved.includes('localhost') || saved.includes('127.0.0.1')) {
        url = saved.replace('localhost', currentHost).replace('127.0.0.1', currentHost);
      } else {
        url = saved;
      }
    } else {
      url = saved;
    }
  } else {
    // Default to /api (Vite Proxy) which forwards mobile requests directly to host's backend port 8000
    url = '/api';
  }
  
  return url.trim().replace(/\/+$/, '');
}

export function getFallbackApiUrl(primaryUrl = '') {
  const currentHost = (typeof window !== 'undefined' && window.location && window.location.hostname) 
    ? window.location.hostname 
    : 'localhost';

  const cleanPrimary = (primaryUrl || '').trim().replace(/\/+$/, '');

  if (cleanPrimary === '/api' || cleanPrimary.endsWith('/api')) {
    return `http://${currentHost}:8000`;
  }
  return '/api';
}

export function setApiUrl(url) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(API_URL_KEY, url);
  }
}

/**
 * Ping backend API to check if accessible
 */
export async function checkApiHealth() {
  let baseUrl = getApiUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5 seconds timeout

    const headers = {};
    const token = getStoredToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let res;
    try {
      res = await fetch(`${baseUrl}/membros`, {
        method: 'GET',
        headers,
        signal: controller.signal
      });
    } catch (primaryErr) {
      const fallbackUrl = getFallbackApiUrl(baseUrl);
      if (fallbackUrl && fallbackUrl !== baseUrl) {
        res = await fetch(`${fallbackUrl}/membros`, {
          method: 'GET',
          headers,
          signal: controller.signal
        });
        baseUrl = fallbackUrl;
      } else {
        throw primaryErr;
      }
    }
    clearTimeout(timeoutId);

    // 200 OK, 401 Unauthorized or 403 Forbidden all mean the backend API is online and responding
    if (res.ok || res.status === 401 || res.status === 403) {
      return { online: true, mode: 'api', message: 'API Backend conectada com sucesso!' };
    }

    return { online: false, mode: 'offline', message: `Servidor local respondeu com erro (${res.status}).` };
  } catch (err) {
    return { online: false, mode: 'offline', message: 'Não foi possível conectar à API Backend.' };
  }
}

/**
 * Helper to fetch single endpoint safely catching CORS and network errors
 * Uses a 5-second timeout to avoid blocking Promise.all indefinitely
 */
async function safeFetchJson(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 seconds timeout
  
  try {
    const headers = {};
    const token = getStoredToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let res;
    try {
      res = await fetch(url, { headers, signal: controller.signal });
    } catch (primaryErr) {
      const baseUrl = getApiUrl();
      const fallbackUrl = getFallbackApiUrl(baseUrl);
      if (fallbackUrl && fallbackUrl !== baseUrl) {
        const fallbackFullUrl = url.replace(baseUrl, fallbackUrl);
        res = await fetch(fallbackFullUrl, { headers, signal: controller.signal });
      } else {
        throw primaryErr;
      }
    }

    if (res.status === 401) {
      return { unauthenticated: true };
    }

    if (res.status === 403) {
      const errData = await res.json().catch(() => null);
      const detail = errData?.detail || errData?.message || '';
      const isDenied = typeof detail === 'string' && (detail.toLowerCase().includes('negado') || detail.toLowerCase().includes('denied'));
      return { forbidden: true, status: isDenied ? 'negado' : 'pendente', detail };
    }

    if (res.ok) {
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    }
  } catch (e) {
    console.warn(`Fetch falhou para ${url}:`, e);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
  return null;
}

/**
 * Fetch all datasets safely from backend API
 */
export async function fetchAllFinancialData() {
  const baseUrl = getApiUrl();

  try {
    const [membrosData, dizimosData, ofertasData, despesasData] = await Promise.all([
      safeFetchJson(`${baseUrl}/membros`),
      safeFetchJson(`${baseUrl}/dizimos`),
      safeFetchJson(`${baseUrl}/ofertas`),
      safeFetchJson(`${baseUrl}/despesas`)
    ]);

    const results = [membrosData, dizimosData, ofertasData, despesasData];

    // Check for 401 unauthenticated response on any endpoint
    if (results.some(r => r && r.unauthenticated === true)) {
      logout();
      return {
        status: 'unauthenticated',
        membros: [],
        dizimos: [],
        ofertas: [],
        despesas: [],
        message: 'Sessão não autenticada ou expirada. Por favor, faça login novamente.'
      };
    }

    // Check for 403 forbidden response (Pending or Denied access)
    const forbiddenRes = results.find(r => r && r.forbidden === true);
    if (forbiddenRes) {
      return {
        status: 'pending_approval',
        userStatus: forbiddenRes.status || 'pendente',
        membros: [],
        dizimos: [],
        ofertas: [],
        despesas: [],
        message: forbiddenRes.detail || 'Seu acesso aos endpoints de consulta ainda não foi aceito pelo administrador.'
      };
    }

    // If all requests returned null, server is unreachable/offline
    if (results.every(r => r === null)) {
      return {
        status: 'offline',
        membros: [],
        dizimos: [],
        ofertas: [],
        despesas: [],
        message: 'O servidor de API Backend está desligado (funciona sob demanda). Peça ao administrador para ligar o servidor.'
      };
    }

    return {
      status: 'online',
      membros: Array.isArray(membrosData) ? membrosData : [],
      dizimos: Array.isArray(dizimosData) ? dizimosData : [],
      ofertas: Array.isArray(ofertasData) ? ofertasData : [],
      despesas: Array.isArray(despesasData) ? despesasData : [],
      message: 'Conectado à API Backend local.'
    };
  } catch (error) {
    console.warn('Erro ao buscar dados da API:', error);
    return {
      status: 'offline',
      membros: [],
      dizimos: [],
      ofertas: [],
      despesas: [],
      message: 'Erro na conexão com a API Backend.'
    };
  }
}

/**
 * Generic helper to create a record via POST
 */
export async function createRecord(endpoint, payload) {
  const baseUrl = getApiUrl();
  const token = getStoredToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${baseUrl}/${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json().catch(() => payload);
      return { success: true, data };
    }
    const err = await res.json().catch(() => null);
    return { success: false, message: err?.detail || err?.message || `Erro ${res.status} ao criar registro.` };
  } catch (e) {
    return { success: false, message: 'Servidor offline ou sem conexão.' };
  }
}

/**
 * Generic helper to update a record via PUT
 */
export async function updateRecord(endpoint, id, payload) {
  const baseUrl = getApiUrl();
  const token = getStoredToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${baseUrl}/${endpoint}/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json().catch(() => payload);
      return { success: true, data };
    }
    const err = await res.json().catch(() => null);
    return { success: false, message: err?.detail || err?.message || `Erro ${res.status} ao atualizar registro.` };
  } catch (e) {
    return { success: false, message: 'Servidor offline ou sem conexão.' };
  }
}

/**
 * Generic helper to delete a record via DELETE
 */
export async function deleteRecord(endpoint, id) {
  const baseUrl = getApiUrl();
  const token = getStoredToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${baseUrl}/${endpoint}/${id}`, {
      method: 'DELETE',
      headers
    });
    if (res.ok) {
      return { success: true };
    }
    const err = await res.json().catch(() => null);
    return { success: false, message: err?.detail || err?.message || `Erro ${res.status} ao excluir registro.` };
  } catch (e) {
    return { success: false, message: 'Servidor offline ou sem conexão.' };
  }
}
