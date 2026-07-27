import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

/**
 * Capture an element as a PNG image and download it.
 */
export async function exportDashboardToPng(elementId = 'dashboard-content', filename = 'relatorio-financeiro-igreja.png') {
  const element = document.getElementById(elementId);
  if (!element) {
    alert('Elemento do painel não encontrado para exportação.');
    return;
  }

  try {
    const dataUrl = await toPng(element, {
      quality: 0.95,
      cacheBust: true,
      style: {
        background: '#0f172a',
        padding: '20px'
      }
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Erro ao gerar imagem:', error);
    alert('Não foi possível gerar a imagem. Tente novamente.');
  }
}

/**
 * Trigger window print or generate PDF
 */
export function printOrExportPdf() {
  window.print();
}
