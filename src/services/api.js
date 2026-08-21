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

function normalizeEndpoint(endpoint) {
  if (endpoint === 'membros' || endpoint === 'membro') return 'membro';
  return endpoint;
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
      res = await fetch(`${baseUrl}/membro`, {
        method: 'GET',
        headers,
        signal: controller.signal
      });
    } catch (primaryErr) {
      const fallbackUrl = getFallbackApiUrl(baseUrl);
      if (fallbackUrl && fallbackUrl !== baseUrl) {
        res = await fetch(`${fallbackUrl}/membro`, {
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
 * Uses a 3.5-second timeout to avoid blocking Promise.all indefinitely when offline
 */
async function safeFetchJson(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout
  
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
      return { 
        forbidden: true, 
        status: isDenied ? 'negado' : 'pendente', 
        detail: detail || 'Acesso restrito ou aguardando aprovação do administrador.' 
      };
    }

    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json)) return json;
      if (json && typeof json === 'object') {
        if (Array.isArray(json.data)) return json.data;
        if (Array.isArray(json.ofertas)) return json.ofertas;
        if (Array.isArray(json.despesas)) return json.despesas;
        if (Array.isArray(json.dizimos)) return json.dizimos;
        if (Array.isArray(json.membros)) return json.membros;
        if (Array.isArray(json.membro)) return json.membro;
        if (Array.isArray(json.items)) return json.items;
        if (Array.isArray(json.results)) return json.results;
        if (Array.isArray(json.content)) return json.content;
        
        // Single record object case
        if (json.id != null || json.valor != null || json.nome != null) {
          return [json];
        }
      }
      return [];
    }
  } catch (e) {
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
  const token = getStoredToken();
  if (!token) {
    return {
      status: 'unauthenticated',
      membros: [],
      dizimos: [],
      ofertas: [],
      despesas: [],
      message: 'Sessão não autenticada ou expirada. Por favor, faça login novamente.'
    };
  }

  const baseUrl = getApiUrl();

  try {
    const [membrosData, dizimosData, ofertasData, despesasData] = await Promise.all([
      safeFetchJson(`${baseUrl}/membro`),
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
        message: 'O servidor da aplicação está offline no momento. Entre em contato com o administrador para ligar o sistema.'
      };
    }

    return {
      status: 'online',
      membros: Array.isArray(membrosData) ? membrosData : [],
      dizimos: Array.isArray(dizimosData) ? dizimosData : [],
      ofertas: Array.isArray(ofertasData) ? ofertasData : [],
      despesas: Array.isArray(despesasData) ? despesasData : [],
      message: 'Conectado à API Backend.'
    };
  } catch (error) {
    console.warn('Erro ao buscar dados da API:', error);
    return {
      status: 'offline',
      membros: [],
      dizimos: [],
      ofertas: [],
      despesas: [],
      message: 'O servidor da aplicação está offline no momento. Entre em contato com o administrador para ligar o sistema.'
    };
  }
}

/**
 * Shared mutation runner handling primary & fallback URLs, singular/plural endpoints, and errors
 */
async function executeMutation(endpoint, method, id = null, payload = null) {
  const baseUrl = getApiUrl();
  const fallbackUrl = getFallbackApiUrl(baseUrl);
  const token = getStoredToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const targetEp = normalizeEndpoint(endpoint);
  const buildPath = (ep) => id != null ? `${ep}/${id}` : `${ep}`;

  const opts = {
    method,
    headers,
    ...(payload != null ? { body: JSON.stringify(payload) } : {})
  };

  let primaryUrl = `${baseUrl}/${buildPath(targetEp)}`;
  let res = null;

  try {
    res = await fetch(primaryUrl, opts);
  } catch (primaryErr) {
    console.warn(`[Mutation Fetch Primary Error] ${method} ${primaryUrl} falhou:`, primaryErr);
    if (fallbackUrl && fallbackUrl !== baseUrl) {
      const fallbackFullUrl = `${fallbackUrl}/${buildPath(targetEp)}`;
      try {
        console.info(`[Mutation Fallback] Tentando ${method} ${fallbackFullUrl}`);
        res = await fetch(fallbackFullUrl, opts);
      } catch (fallbackErr) {
        console.error(`[Mutation Fallback Error] ${fallbackFullUrl} falhou:`, fallbackErr);
        return { success: false, message: 'Servidor offline ou sem conexão.' };
      }
    } else {
      return { success: false, message: 'Servidor offline ou sem conexão.' };
    }
  }

  // Singular / Plural 404 Endpoint Fallback
  if (res && res.status === 404) {
    console.warn(`[Mutation 404] ${method} ${primaryUrl} - tentando variação de endpoint...`);
    let altEp = null;
    if (targetEp === 'dizimos') altEp = 'dizimo';
    else if (targetEp === 'dizimo') altEp = 'dizimos';
    else if (targetEp === 'ofertas') altEp = 'oferta';
    else if (targetEp === 'oferta') altEp = 'ofertas';
    else if (targetEp === 'despesas') altEp = 'despesa';
    else if (targetEp === 'despesa') altEp = 'despesas';
    else if (targetEp === 'membro') altEp = 'membros';
    else if (targetEp === 'membros') altEp = 'membro';

    if (altEp) {
      const currentBase = res.url ? new URL(res.url).origin : baseUrl;
      const altUrl = `${currentBase}/${buildPath(altEp)}`;
      console.info(`[Mutation 404 Fallback] Tentando ${method} ${altUrl}`);
      const altRes = await fetch(altUrl, opts).catch(() => null);
      if (altRes && (altRes.ok || altRes.status === 201 || altRes.status === 204)) {
        res = altRes;
      }
    }
  }

  if (res.ok || res.status === 201 || res.status === 204) {
    const data = await res.json().catch(() => payload);
    console.log(`[Mutation Success] ${method} ${endpoint}:`, data);
    return { success: true, status: res.status, data };
  }

  if (res.status === 409) {
    const err = await res.json().catch(() => null);
    return {
      success: false,
      conflict: true,
      status: 409,
      message: err?.detail || err?.message || 'Não é possível realizar a operação devido a vínculo de dados.'
    };
  }

  const err = await res.json().catch(() => null);
  let detailMsg = '';
  if (typeof err?.detail === 'string') {
    detailMsg = err.detail;
  } else if (Array.isArray(err?.detail)) {
    detailMsg = err.detail.map(d => `${Array.isArray(d.loc) ? d.loc.slice(-1)[0] : 'campo'}: ${d.msg}`).join('; ');
  } else {
    detailMsg = err?.message || `Erro HTTP ${res.status} ao realizar ${method}.`;
  }

  console.error(`[Mutation HTTP ${res.status}] ${method} ${endpoint}:`, detailMsg);
  return { success: false, status: res.status, message: detailMsg };
}

/**
 * Generic helper to create a record via POST
 */
export async function createRecord(endpoint, payload) {
  return executeMutation(endpoint, 'POST', null, payload);
}

/**
 * Generic helper to update a record via PUT
 */
export async function updateRecord(endpoint, id, payload) {
  return executeMutation(endpoint, 'PUT', id, payload);
}

/**
 * Generic helper to delete a record via DELETE
 */
export async function deleteRecord(endpoint, id) {
  return executeMutation(endpoint, 'DELETE', id, null);
}
