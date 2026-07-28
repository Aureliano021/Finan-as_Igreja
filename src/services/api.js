import { mockMembros, mockDizimos, mockOfertas, mockDespesas } from './mockData';

const API_URL_KEY = 'igreja_api_url';
const MOCK_MODE_KEY = 'igreja_use_mock';

export function getApiUrl() {
  const currentHost = (typeof window !== 'undefined' && window.location && window.location.hostname) 
    ? window.location.hostname 
    : 'localhost';

  const saved = localStorage.getItem(API_URL_KEY);
  
  if (saved) {
    // If on a remote device (e.g. smartphone on Wi-Fi at 192.168.x.x), replace localhost/127.0.0.1 with the actual host IP
    if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
      if (saved.includes('localhost') || saved.includes('127.0.0.1')) {
        return saved.replace('localhost', currentHost).replace('127.0.0.1', currentHost);
      }
    }
    return saved;
  }
  
  return `http://${currentHost}:8000`;
}

export function setApiUrl(url) {
  localStorage.setItem(API_URL_KEY, url);
}

export function isMockModeForced() {
  return localStorage.getItem(MOCK_MODE_KEY) === 'true';
}

export function setMockModeForced(value) {
  localStorage.setItem(MOCK_MODE_KEY, value ? 'true' : 'false');
}

/**
 * Ping backend API to check if accessible
 */
export async function checkApiHealth() {
  if (isMockModeForced()) {
    return { online: false, mode: 'mock', message: 'Modo Mock forçado manualmente.' };
  }

  const baseUrl = getApiUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 seconds timeout

    const res = await fetch(`${baseUrl}/membros`, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return { online: true, mode: 'api', message: 'API Python conectada com sucesso!' };
      }
    }
    return { online: false, mode: 'mock', message: `Servidor local respondeu, mas os dados não vieram em formato de lista.` };
  } catch (err) {
    return { online: false, mode: 'mock', message: 'Não foi possível conectar à API Python. Usando Dados Mock.' };
  }
}

/**
 * Helper to fetch single endpoint safely catching CORS and network errors
 * Uses a 5-second timeout to avoid blocking the Promise.all indefinitely
 */
async function safeFetchJson(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const json = await res.json();
      return Array.isArray(json) ? json : null;
    }
  } catch (e) {
    console.warn(`Fetch falhou para ${url}:`, e);
    return null;
  }
  return null;
}

/**
 * Fetch all datasets safely with fallback to mock data on CORS / Network issues
 */
export async function fetchAllFinancialData() {
  const health = await checkApiHealth();
  
  if (!health.online || health.mode === 'mock') {
    return {
      status: 'mock',
      membros: mockMembros,
      dizimos: mockDizimos,
      ofertas: mockOfertas,
      despesas: mockDespesas,
      message: health.message
    };
  }

  const baseUrl = getApiUrl();

  try {
    const [membrosData, dizimosData, ofertasData, despesasData] = await Promise.all([
      safeFetchJson(`${baseUrl}/membros`),
      safeFetchJson(`${baseUrl}/dizimos`),
      safeFetchJson(`${baseUrl}/ofertas`),
      safeFetchJson(`${baseUrl}/despesas`)
    ]);

    const membros = membrosData !== null ? membrosData : mockMembros;
    const dizimos = dizimosData !== null ? dizimosData : mockDizimos;
    const ofertas = ofertasData !== null ? ofertasData : mockOfertas;
    const despesas = despesasData !== null ? despesasData : mockDespesas;

    return {
      status: 'online',
      membros,
      dizimos,
      ofertas,
      despesas,
      message: 'Conectado à API Python local.'
    };
  } catch (error) {
    console.warn('Erro ao buscar da API real, usando mock:', error);
    return {
      status: 'mock',
      membros: mockMembros,
      dizimos: mockDizimos,
      ofertas: mockOfertas,
      despesas: mockDespesas,
      message: 'Erro na conexão com API. Exibindo Dados Mock.'
    };
  }
}
