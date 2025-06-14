import jsPDF from 'jspdf';
import { Program } from '@/pages/Index';

export const generateProgramPDF = (program: Program) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let y = 20;

  // --- Colors & Fonts ---
  const colors = {
    primary: '#0D47A1', // Dark Blue
    secondary: '#42A5F5', // Light Blue
    accent: '#2E7D32', // Green
    textPrimary: '#212121', // Almost black
    textSecondary: '#757575', // Gray
    background: '#F5F5F5', // Light Gray for cards
    white: '#FFFFFF',
    border: '#E0E0E0'
  };

  const setFont = (style: 'normal' | 'bold', size: number, color: string) => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(color);
  };

  // --- Helper Functions ---
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 20) {
      doc.addPage();
      y = 20;
      addHeader();
    }
  };

  const addWrappedText = (text: string, x: number, startY: number, maxWidth: number, options: { fontSize?: number, color?: string, lineHeightFactor?: number } = {}) => {
    const { fontSize = 10, color = colors.textSecondary, lineHeightFactor = 1.5 } = options;
    setFont('normal', fontSize, color);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, startY);
    return startY + (lines.length * fontSize * 0.35 * lineHeightFactor);
  };

  // --- Header ---
  const addHeader = () => {
    doc.setFillColor(colors.primary);
    doc.rect(0, 0, pageWidth, 25, 'F');
    
    setFont('bold', 14, colors.white);
    doc.text('MUNICÍPIO DE PRESIDENTE GETÚLIO', pageWidth / 2, 12, { align: 'center' });
    setFont('normal', 10, colors.white);
    doc.text('Plano Plurianual (PPA) - Ficha de Programa', pageWidth / 2, 19, { align: 'center' });
    y = 35;
  };
  
  addHeader();

  // --- Program Title ---
  setFont('bold', 22, colors.primary);
  y = addWrappedText(program.programa, margin, y, contentWidth, { fontSize: 22, color: colors.primary, lineHeightFactor: 1.2 });
  y += 5;
  doc.setDrawColor(colors.secondary);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + 70, y);
  y += 10;

  // --- Metadata Grid ---
  const metaData = [
    { label: 'SECRETARIA', value: program.secretaria },
    { label: 'DEPARTAMENTO', value: program.departamento },
    { label: 'EIXO TEMÁTICO', value: program.eixo },
    { label: 'DATA CRIAÇÃO', value: program.createdAt.toLocaleDateString('pt-BR') },
  ];
  
  const boxWidth = (contentWidth - 10) / 2;
  const boxHeight = 20;

  metaData.forEach((item, index) => {
    const x = margin + (index % 2) * (boxWidth + 10);
    const currentY = y + Math.floor(index / 2) * (boxHeight + 5);

    doc.setFillColor(colors.background);
    doc.setDrawColor(colors.border);
    doc.setLineWidth(0.2);
    doc.rect(x, currentY, boxWidth, boxHeight, 'FD');

    setFont('bold', 8, colors.textSecondary);
    doc.text(item.label, x + 5, currentY + 7);

    setFont('normal', 11, colors.textPrimary);
    const valueText = item.value || 'Não informado';
    const valueLines = doc.splitTextToSize(valueText, boxWidth - 10);
    doc.text(valueLines[0], x + 5, currentY + 15);
  });
  y += Math.ceil(metaData.length / 2) * (boxHeight + 5);

  // --- Total Budget ---
  const calculateActionTotal = (acao) => {
    const vals = [acao.orcamento2026, acao.orcamento2027, acao.orcamento2028, acao.orcamento2029].map(
      v => parseFloat((v || "0").replace(/[^\d,]/g, '').replace(',', '.') || "0")
    );
    return vals.reduce((s, v) => s + v, 0);
  };
  const totalOrcamento = program.acoes.reduce((total, acao) => total + calculateActionTotal(acao), 0);
  
  if (totalOrcamento > 0) {
    y += 5;
    checkPageBreak(30);
    doc.setFillColor(colors.accent);
    doc.rect(margin, y, contentWidth, 20, 'F');
    
    setFont('bold', 10, colors.white);
    doc.text('ORÇAMENTO TOTAL ESTIMADO DO PROGRAMA', margin + 10, y + 8);
    
    setFont('bold', 16, colors.white);
    doc.text(totalOrcamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), pageWidth - margin - 10, y + 13, { align: 'right' });
    y += 30;
  } else {
    y += 10;
  }
  
  // --- Program Sections (Cards) ---
  const drawSectionCard = (title: string, content: string | null | undefined) => {
    if (!content) return;
    
    const textHeight = doc.getTextDimensions(content, { maxWidth: contentWidth - 20, fontSize: 10 }).h;
    checkPageBreak(textHeight + 30);
    
    const cardY = y;
    
    // Header
    doc.setFillColor(colors.primary);
    doc.rect(margin, cardY, contentWidth, 10, 'F');
    setFont('bold', 12, colors.white);
    doc.text(title, margin + 5, cardY + 7);

    // Content
    const contentY = addWrappedText(content, margin + 10, cardY + 20, contentWidth - 20);
    
    const cardHeight = (contentY - cardY) + 10;
    doc.setDrawColor(colors.border);
    doc.setLineWidth(0.2);
    doc.rect(margin, cardY, contentWidth, cardHeight, 'S');

    y = cardY + cardHeight + 10;
  };

  const objetivosDiretrizes = [program.objetivos, program.diretrizes].filter(Boolean).join('\n\n');

  drawSectionCard('DESCRIÇÃO DO PROGRAMA', program.descricao);
  drawSectionCard('JUSTIFICATIVA', program.justificativa);
  drawSectionCard('OBJETIVOS E DIRETRIZES', objetivosDiretrizes);
  
  // --- Actions Section ---
  if (program.acoes.length > 0) {
    checkPageBreak(30);
    
    // Section Title
    setFont('bold', 16, colors.primary);
    doc.text('AÇÕES DO PROGRAMA', margin, y);
    y += 5;
    doc.setDrawColor(colors.secondary);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + 50, y);
    y += 10;
    
    program.acoes.forEach((acao, index) => {
      checkPageBreak(70);

      const actionCardY = y;
      
      // Card background
      doc.setDrawColor(colors.border);
      doc.setFillColor(colors.background);
      doc.roundedRect(margin, actionCardY, contentWidth, 65, 3, 3, 'FD');

      // Action Number
      doc.setFillColor(colors.accent);
      doc.circle(margin + 12, actionCardY + 12, 6, 'F');
      setFont('bold', 12, colors.white);
      doc.text(String(index + 1), margin + 12, actionCardY + 13.5, { align: 'center' });
      
      // Action Name
      setFont('bold', 12, colors.primary);
      addWrappedText(acao.nome, margin + 25, actionCardY + 10, contentWidth - 35, { fontSize: 12, color: colors.primary, lineHeightFactor: 1.2 });
      
      const col1X = margin + 10;
      const col2X = margin + contentWidth / 2;
      const dataY = actionCardY + 25;
      
      // Details
      setFont('bold', 9, colors.textPrimary);
      doc.text('PRODUTO/SERVIÇO:', col1X, dataY);
      setFont('normal', 9, colors.textSecondary);
      doc.text(acao.produto || '-', col1X + 35, dataY);

      setFont('bold', 9, colors.textPrimary);
      doc.text('FONTE:', col2X, dataY);
      setFont('normal', 9, colors.textSecondary);
      doc.text(acao.fonte || '-', col2X + 15, dataY);

      const tableY = dataY + 8;
      
      // Table Header
      setFont('bold', 8, colors.textSecondary);
      doc.text('ANO', col1X, tableY);
      doc.text('META FÍSICA', col1X + 40, tableY, { align: 'right' });
      doc.text('ORÇAMENTO', col1X + 80, tableY, { align: 'right' });

      doc.setDrawColor(colors.border);
      doc.line(col1X, tableY + 2, margin + contentWidth - 10, tableY + 2);
      
      // Table Rows
      let tableRowY = tableY + 7;
      const years = ['2026', '2027', '2028', '2029'];
      const metas = [acao.metaFisica2026, acao.metaFisica2027, acao.metaFisica2028, acao.metaFisica2029];
      const orcamentos = [acao.orcamento2026, acao.orcamento2027, acao.orcamento2028, acao.orcamento2029];
      
      setFont('normal', 9, colors.textPrimary);
      years.forEach((year, i) => {
        const metaText = `${metas[i] || '-'} ${acao.unidadeMedida || ''}`.trim();
        const orcamentoVal = parseFloat((orcamentos[i] || "0").replace(/[^\d,]/g, '').replace(',', '.'));
        const orcamentoText = orcamentoVal > 0 ? orcamentos[i] : '-';
        
        doc.text(year, col1X, tableRowY);
        doc.text(metaText, col1X + 40, tableRowY, { align: 'right' });
        doc.text(orcamentoText, col1X + 80, tableRowY, { align: 'right' });
        tableRowY += 6;
      });

      // Action Total Budget
      const actionTotal = calculateActionTotal(acao);
      if(actionTotal > 0) {
        setFont('bold', 9, colors.accent);
        doc.text('TOTAL AÇÃO', col2X + 30, tableY + 15, {align: 'right'});
        doc.text(actionTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), col2X + 80, tableY + 15, { align: 'right' });
      }
      
      y = actionCardY + 75;
    });
  }

  // --- Add Footers to all pages ---
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    setFont('normal', 8, colors.textSecondary);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, margin, pageHeight - 10);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
  }

  // --- Save file ---
  const fileName = `programa-${program.programa.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.pdf`;
  doc.save(fileName);
};
