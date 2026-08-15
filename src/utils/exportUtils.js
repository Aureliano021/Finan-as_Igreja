import html2canvas from 'html2canvas';

/**
 * Exporta o relatório completo da congregação para uma imagem PNG em alta resolução (2x).
 * @param {string} periodLabel - Rótulo do período (ex: "Julho 2026")
 * @returns {Promise<string>} Nome do arquivo gerado
 */
export async function exportReportCardToPng(periodLabel = '') {
  const sourceElement = document.getElementById('printable-report');
  if (!sourceElement) {
    throw new Error('Elemento do relatório não encontrado no DOM.');
  }

  // Cria um container isolado no topo do documento para renderização perfeita
  const exportContainer = document.createElement('div');
  exportContainer.style.position = 'fixed';
  exportContainer.style.top = '0';
  exportContainer.style.left = '0';
  exportContainer.style.width = '800px';
  exportContainer.style.zIndex = '-9999';
  exportContainer.style.backgroundColor = '#ffffff';
  exportContainer.style.overflow = 'hidden';
  exportContainer.style.opacity = '1';

  // Clona o conteúdo do relatório
  const clone = sourceElement.cloneNode(true);
  clone.id = 'printable-report-clone';
  clone.style.display = 'block';
  clone.style.width = '800px';
  clone.style.backgroundColor = '#ffffff';

  exportContainer.appendChild(clone);
  document.body.appendChild(exportContainer);

  try {
    // Aguarda o carregamento das fontes do navegador
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    // Pequena pausa para garantir renderização de layout do clone
    await new Promise((resolve) => setTimeout(resolve, 80));

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 850
    });

    // Converte o canvas para Blob PNG legítimo
    const blob = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/png', 1.0);
    });

    if (!blob) {
      throw new Error('Falha ao gerar o arquivo de imagem PNG.');
    }

    // Dispara o download da imagem PNG
    const safePeriod = (periodLabel || 'geral')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-');

    const filename = `relatorio-financeiro-imw-${safePeriod}.png`;
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
    return filename;
  } finally {
    if (exportContainer.parentNode) {
      exportContainer.parentNode.removeChild(exportContainer);
    }
  }
}
