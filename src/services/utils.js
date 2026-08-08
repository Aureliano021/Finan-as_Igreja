/**
 * Utility functions for church financial app
 */

/**
 * Mask CPF to protect privacy (LGPD) — shows only middle digits
 * Input: "12345678901" → Output: "***.456.789-**"
 */
export function maskCpf(cpf) {
  if (!cpf) return '-';
  const clean = String(cpf).replace(/\D/g, '');
  if (clean.length !== 11) return cpf; // return as-is if not a valid CPF
  return `***.${clean.slice(3, 6)}.${clean.slice(6, 9)}-**`;
}

/**
 * Parse any numeric value safely (handles numbers, strings, and formatted currency "R$ 1.250,50")
 */
export function parseNumericValue(value) {
  if (value == null) return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (typeof value === 'string') {
    const cleanStr = value.replace(/R\$\s?/, '').trim();
    if (!cleanStr) return 0;
    // Check if format uses Brazilian comma for decimal (e.g. "1.250,50" or "250,50")
    if (cleanStr.includes(',')) {
      const normalized = cleanStr.replace(/\./g, '').replace(',', '.');
      const parsed = parseFloat(normalized);
      return isNaN(parsed) ? 0 : parsed;
    }
    const parsed = parseFloat(cleanStr);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Format a numeric value to Brazilian Real currency (R$ 1.250,00)
 */
export function formatCurrency(value) {
  const numericVal = parseNumericValue(value);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numericVal);
}

/**
 * Extract numeric value from a financial record trying all common backend property names
 */
export function getRecordValue(item) {
  if (!item) return 0;
  const raw = item.valor ?? item.valor_pago ?? item.amount ?? item.value ?? item.val ?? 0;
  return parseNumericValue(raw);
}

/**
 * Parse any date representation (ISO "2026-08-05", BR "05/08/2026", timestamp) into year, month, day components
 */
export function parseDateParts(dateValue) {
  if (!dateValue) return { year: null, month: null, day: null, iso: '' };
  const str = String(dateValue).trim().split('T')[0].split(' ')[0];
  
  if (str.includes('-')) {
    const p = str.split('-');
    if (p.length === 3) {
      // Could be YYYY-MM-DD or DD-MM-YYYY
      if (p[0].length === 4) {
        const y = parseInt(p[0], 10);
        const m = parseInt(p[1], 10);
        const d = parseInt(p[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          return { year: y, month: m, day: d, iso };
        }
      } else if (p[2].length === 4) {
        const d = parseInt(p[0], 10);
        const m = parseInt(p[1], 10);
        const y = parseInt(p[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          return { year: y, month: m, day: d, iso };
        }
      }
    }
  }
  
  if (str.includes('/')) {
    const p = str.split('/');
    if (p.length === 3) {
      if (p[0].length === 4) {
        const y = parseInt(p[0], 10);
        const m = parseInt(p[1], 10);
        const d = parseInt(p[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          return { year: y, month: m, day: d, iso };
        }
      } else if (p[2].length === 4) {
        const d = parseInt(p[0], 10);
        const m = parseInt(p[1], 10);
        const y = parseInt(p[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          return { year: y, month: m, day: d, iso };
        }
      }
    }
  }

  return { year: null, month: null, day: null, iso: str };
}

/**
 * Extract clean date string (YYYY-MM-DD) from a record trying all common backend date property names
 */
export function getRecordDate(item) {
  if (!item) return '';
  const rawDate = item.data ?? item.data_despesa ?? item.data_oferta ?? item.date ?? item.created_at ?? item.data_criacao ?? '';
  if (!rawDate) return '';
  const { iso } = parseDateParts(rawDate);
  return iso || String(rawDate).trim().split('T')[0].split(' ')[0];
}

/**
 * Format ISO date string (YYYY-MM-DD) to Brazilian date format (DD/MM/YYYY)
 */
export function formatDateBR(dateString) {
  if (!dateString) return '-';
  const { year, month, day } = parseDateParts(dateString);
  if (year && month && day) {
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
  }
  return String(dateString);
}

/**
 * Check if a date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss) belongs to a given year and month (1-based)
 * Pure string parsing to prevent timezone offset shifts
 */
export function isSameMonthAndYear(dateString, year, month) {
  if (!dateString) return false;
  try {
    const str = String(dateString).trim().split('T')[0];
    const parts = str.split('-');
    if (parts.length >= 2) {
      const itemYear = parseInt(parts[0], 10);
      const itemMonth = parseInt(parts[1], 10);
      return itemYear === parseInt(year, 10) && itemMonth === parseInt(month, 10);
    }
  } catch (e) {
    return false;
  }
  return false;
}

/**
 * List of months in Portuguese
 */
export const MONTHS = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' }
];

/**
 * Categorize expense based on keywords in its description
 */
export function categorizeExpense(description) {
  if (!description) return 'Outras Despesas';
  const desc = String(description).toLowerCase();
  
  if (desc.includes('luz') || desc.includes('energia') || desc.includes('cemig') || desc.includes('enel') || desc.includes('eletric')) {
    return 'Energia Elétrica';
  }
  if (desc.includes('água') || desc.includes('agua') || desc.includes('saneamento') || desc.includes('copasa') || desc.includes('sabesp')) {
    return 'Água e Saneamento';
  }
  if (desc.includes('aluguel') || desc.includes('locacao') || desc.includes('locação')) {
    return 'Aluguel do Imóvel';
  }
  if (desc.includes('som') || desc.includes('mic') || desc.includes('microfone') || desc.includes('cabo') || desc.includes('instrumento') || desc.includes('projetor') || desc.includes('tv') || desc.includes('equipamento')) {
    return 'Equipamentos e Som';
  }
  if (desc.includes('manutenção') || desc.includes('manutencao') || desc.includes('reforma') || desc.includes('pintura') || desc.includes('limpeza') || desc.includes('obra')) {
    return 'Manutenção e Conservação';
  }
  if (desc.includes('papel') || desc.includes('impress') || desc.includes('boletim') || desc.includes('material') || desc.includes('escritorio')) {
    return 'Material de Escritório';
  }
  if (desc.includes('ceia') || desc.includes('panificad') || desc.includes('pão') || desc.includes('suco') || desc.includes('vinho') || desc.includes('evento') || desc.includes('cafe') || desc.includes('alimento')) {
    return 'Eventos e Santa Ceia';
  }
  if (desc.includes('ajuda') || desc.includes('missao') || desc.includes('missões') || desc.includes('oferta de amor') || desc.includes('preletor') || desc.includes('pastoral')) {
    return 'Ação Social e Missões';
  }
  
  return 'Outras Despesas';
}
