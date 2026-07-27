/**
 * Utility functions for church financial app
 */

/**
 * Format a numeric value to Brazilian Real currency (R$ 1.250,00)
 */
export function formatCurrency(value) {
  const numericVal = Number(value) || 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numericVal);
}

/**
 * Format ISO date string (YYYY-MM-DD) to Brazilian date format (DD/MM/YYYY)
 */
export function formatDateBR(dateString) {
  if (!dateString) return '-';
  const str = String(dateString).trim().split('T')[0];
  const parts = str.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
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
