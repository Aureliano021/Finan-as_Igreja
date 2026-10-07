import {
  getApiUrl,
  getFallbackApiUrl,
  safeFetchJson,
  createRecord,
  updateRecord,
  deleteRecord,
  updateRecordPut
} from './api.js';
import { getStoredToken } from './auth.js';

/**
 * Serializa a descrição rica da escala (título, louvores, observações) para formato JSON.
 *
 * @param {Object} [data]
 * @param {string} [data.titulo]
 * @param {string[]} [data.louvores]
 * @param {string} [data.observacoes]
 * @returns {string}
 */
export function serializeEscalaDescricao({ titulo = '', louvores = [], observacoes = '' } = {}) {
  return JSON.stringify({
    titulo: titulo || '',
    louvores: Array.isArray(louvores) ? louvores : [],
    observacoes: observacoes || ''
  });
}

/**
 * Desserializa a descrição da escala de forma tolerante a falhas.
 * Se for JSON válido contendo objeto, extrai titulo, louvores e observacoes.
 * Se falhar ou for texto legado, trata como texto simples preservando no titulo.
 *
 * @param {string} rawDescricao
 * @returns {{ titulo: string, louvores: string[], observacoes: string }}
 */
export function deserializeEscalaDescricao(rawDescricao) {
  if (!rawDescricao || typeof rawDescricao !== 'string') {
    return {
      titulo: typeof rawDescricao === 'string' ? rawDescricao : '',
      louvores: [],
      observacoes: ''
    };
  }

  try {
    const parsed = JSON.parse(rawDescricao);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return {
        titulo: parsed.titulo || '',
        louvores: Array.isArray(parsed.louvores) ? parsed.louvores : [],
        observacoes: parsed.observacoes || ''
      };
    }
  } catch {
    // Trata como texto legado quando não for JSON
  }

  return {
    titulo: rawDescricao || '',
    louvores: [],
    observacoes: ''
  };
}

/**
 * Verifica se o usuário autenticado possui permissão para acessar o módulo de cultos.
 *
 * @param {Object} user
 * @param {Array} [_cargos]
 * @returns {boolean}
 */
export function canAccessCultos(user, cargos) {
  void cargos;
  if (!user) return false;
  return Boolean(
    user?.role === 'admin' ||
    user?.is_admin ||
    user?.status === 'admin' ||
    user?.status === 'aceito'
  );
}

/**
 * Busca todas as escalas cadastradas.
 */
export async function fetchEscalas() {
  return safeFetchJson(`${getApiUrl()}/escala`);
}

/**
 * Busca sugestão inteligente de escala gerada pelo backend.
 * Garante o envio do token JWT com 'Authorization: Bearer <token>' e cabeçalhos JSON.
 */
export async function fetchEscalaSuggestion() {
  const token = getStoredToken();
  const baseUrl = getApiUrl();
  const fallbackUrl = getFallbackApiUrl(baseUrl);

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn('[fetchEscalaSuggestion] Nenhum token JWT encontrado no armazenamento local.');
    return {
      success: false,
      unauthenticated: true,
      error: 'Token de autenticação não encontrado. Por favor, faça login novamente.'
    };
  }

  const endpoint = `${baseUrl}/escala/suggestion`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    let res;
    try {
      res = await fetch(endpoint, {
        method: 'GET',
        headers,
        signal: controller.signal
      });
    } catch (primaryErr) {
      if (fallbackUrl && fallbackUrl !== baseUrl) {
        const fallbackEndpoint = `${fallbackUrl}/escala/suggestion`;
        console.info(`[fetchEscalaSuggestion Fallback] Tentando ${fallbackEndpoint}...`);
        res = await fetch(fallbackEndpoint, {
          method: 'GET',
          headers,
          signal: controller.signal
        });
      } else {
        throw primaryErr;
      }
    }

    if (res.status === 401) {
      console.error('[fetchEscalaSuggestion] Backend retornou 401 Unauthorized para /escala/suggestion.');
      return {
        success: false,
        unauthenticated: true,
        status: 401,
        error: 'Sessão expirada ou não autorizada (401). Faça login novamente.'
      };
    }

    if (res.status === 403) {
      return {
        success: false,
        forbidden: true,
        status: 403,
        error: 'Seu usuário não possui permissão para gerar sugestões de escala.'
      };
    }

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        data: data
      };
    }

    const errBody = await res.json().catch(() => null);
    return {
      success: false,
      status: res.status,
      error: errBody?.detail || errBody?.message || `Erro HTTP ${res.status} ao buscar sugestão.`
    };
  } catch (err) {
    console.error('[fetchEscalaSuggestion Error]:', err);
    return {
      success: false,
      isOffline: true,
      error: 'Não foi possível conectar ao servidor para obter a sugestão.'
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Cria uma nova escala.
 *
 * @param {Object} payload
 */
export async function createEscala(payload) {
  return createRecord('escala', payload);
}

/**
 * Atualiza uma escala existente via PUT.
 *
 * @param {string|number} id
 * @param {Object} payload
 */
export async function updateEscala(id, payload) {
  return updateRecordPut('escala', id, payload);
}

/**
 * Remove uma escala por ID.
 *
 * @param {string|number} id
 */
export async function deleteEscala(id) {
  return deleteRecord('escala', id);
}

/**
 * Busca todos os cargos cadastrados.
 */
export async function fetchCargos() {
  return safeFetchJson(`${getApiUrl()}/cargos`);
}

/**
 * Cria um novo cargo.
 *
 * @param {Object} payload
 */
export async function createCargo(payload) {
  return createRecord('cargos', payload);
}

/**
 * Atualiza um cargo existente via PATCH.
 *
 * @param {string|number} id
 * @param {Object} payload
 */
export async function updateCargo(id, payload) {
  return updateRecord('cargos', id, payload);
}

/**
 * Remove um cargo por ID.
 *
 * @param {string|number} id
 */
export async function deleteCargo(id) {
  return deleteRecord('cargos', id);
}
