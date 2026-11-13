import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CompanyProfile, PDFTheme, Quote } from '../types';

export interface PDFExportOptions {
  filename?: string;
  quality?: number;
}

export interface QuotePdfData {
  quote: Quote;
  company: CompanyProfile;
  theme?: PDFTheme;
}

const themeColors: Record<PDFTheme, [number, number, number]> = {
  modern: [37, 99, 235],
  corporate: [15, 23, 42],
  emerald: [5, 150, 105],
  classic: [127, 29, 29],
  compact: [180, 83, 9],
};

function brl(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

function dateBR(value?: string): string {
  if (!value) return '-';
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function cleanText(value?: string): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function addWrappedText(doc: jsPDF, value: string, x: number, y: number, width: number, lineHeight = 5): number {
  const lines = doc.splitTextToSize(cleanText(value), width) as string[];
  doc.text(lines, x, y);
  return y + Math.max(1, lines.length) * lineHeight;
}

/**
 * Geração nativa: não depende de html2canvas, fontes externas ou captura do DOM.
 * Isso evita o travamento infinito que deixava o botão em "Gerando...".
 */
export function createPdfFromQuote({ quote, company, theme = 'modern' }: QuotePdfData): jsPDF {
  const accent = themeColors[theme] || themeColors.modern;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const pageWidth = 210;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 14;

  const ensureSpace = (height: number) => {
    if (y + height > 282) {
      doc.addPage();
      y = 16;
      doc.setFillColor(...accent);
      doc.rect(0, 0, pageWidth, 4, 'F');
    }
  };

  doc.setFillColor(...accent);
  doc.rect(0, 0, pageWidth, 8, 'F');

  // Cabeçalho
  if (company.logoUrl && /^data:image\//.test(company.logoUrl)) {
    try {
      const format = company.logoUrl.includes('image/jpeg') ? 'JPEG' : 'PNG';
      doc.addImage(company.logoUrl, format, margin, y, 22, 22, undefined, 'FAST');
    } catch {
      // Uma logo inválida não pode impedir a emissão do orçamento.
    }
  }
  const headerX = company.logoUrl && /^data:image\//.test(company.logoUrl) ? margin + 27 : margin;
  doc.setTextColor(20, 35, 45);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(cleanText(company.tradingName || company.name || 'Orçamento Express'), headerX, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(92, 110, 115);
  const contact = [company.phone, company.email, company.city].filter(Boolean).join(' • ');
  if (contact) doc.text(cleanText(contact), headerX, y + 13);

  doc.setTextColor(...accent);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text(cleanText(quote.code), pageWidth - margin, y + 8, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(92, 110, 115);
  doc.text(`Emissão: ${dateBR(quote.issueDate)}`, pageWidth - margin, y + 14, { align: 'right' });
  doc.text(`Validade: ${dateBR(quote.dueDate)}`, pageWidth - margin, y + 19, { align: 'right' });
  y += 30;

  const drawCard = (title: string, lines: string[], x: number, width: number) => {
    const height = Math.max(27, 13 + lines.length * 5);
    ensureSpace(height + 5);
    doc.setFillColor(248, 251, 251);
    doc.setDrawColor(218, 230, 228);
    doc.roundedRect(x, y, width, height, 3, 3, 'FD');
    doc.setTextColor(...accent);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(title.toUpperCase(), x + 5, y + 7);
    doc.setTextColor(38, 58, 62);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    let lineY = y + 14;
    lines.forEach((line) => {
      lineY = addWrappedText(doc, line, x + 5, lineY, width - 10, 4.5);
    });
    return height;
  };

  const clientLines = [
    cleanText(quote.clientName),
    quote.clientDocument ? `CPF/CNPJ: ${quote.clientDocument}` : '',
    [formatPhoneBR(quote.clientPhone), quote.clientEmail].filter(Boolean).join(' • '),
    [quote.clientAddress, quote.clientCity].filter(Boolean).join(' - '),
  ].filter(Boolean);
  const commercialLines = [
    quote.paymentMethod ? `Pagamento: ${quote.paymentMethod}` : '',
    quote.paymentTerms ? `Condições: ${quote.paymentTerms}` : '',
    company.defaultWarranty ? `Garantia: ${company.defaultWarranty}` : '',
  ].filter(Boolean);
  const leftHeight = drawCard('Dados do cliente', clientLines, margin, 88);
  const rightHeight = drawCard('Condições comerciais', commercialLines, margin + 94, 88);
  y += Math.max(leftHeight, rightHeight) + 8;

  // Tabela de itens
  ensureSpace(34);
  doc.setFillColor(...accent);
  doc.roundedRect(margin, y, contentWidth, 9, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('#', margin + 4, y + 6);
  doc.text('Descrição do item / serviço', margin + 13, y + 6);
  doc.text('Un.', 133, y + 6);
  doc.text('Qtd.', 148, y + 6);
  doc.text('Unitário', 163, y + 6);
  doc.text('Total', 190, y + 6, { align: 'right' });
  y += 13;

  quote.items.forEach((item, index) => {
    const descriptionLines = doc.splitTextToSize(cleanText(item.description), 108) as string[];
    const rowHeight = Math.max(9, descriptionLines.length * 4.2 + 4);
    ensureSpace(rowHeight + 3);
    if (index % 2 === 0) {
      doc.setFillColor(248, 251, 251);
      doc.rect(margin, y - 4, contentWidth, rowHeight, 'F');
    }
    doc.setTextColor(54, 72, 75);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(String(index + 1).padStart(2, '0'), margin + 4, y + 1);
    doc.text(descriptionLines, margin + 13, y + 1);
    doc.text(cleanText(item.unit || 'un'), 133, y + 1);
    doc.text(String(item.quantity), 148, y + 1);
    doc.text(brl(item.unitPrice), 163, y + 1);
    doc.text(brl(item.total), 190, y + 1, { align: 'right' });
    y += rowHeight;
  });

  y += 5;
  ensureSpace(45);
  const totalsX = 126;
  doc.setDrawColor(218, 230, 228);
  doc.line(totalsX, y, pageWidth - margin, y);
  doc.setTextColor(92, 110, 115);
  doc.setFontSize(8.5);
  doc.text('Subtotal:', totalsX, y + 7);
  doc.text(brl(quote.subtotal), pageWidth - margin, y + 7, { align: 'right' });
  if (quote.discountTotal) {
    doc.setTextColor(190, 52, 52);
    doc.text('Desconto:', totalsX, y + 13);
    doc.text(`- ${brl(quote.discountTotal)}`, pageWidth - margin, y + 13, { align: 'right' });
  }
  if (quote.taxOrAddition) {
    doc.setTextColor(92, 110, 115);
    doc.text('Acréscimos:', totalsX, y + 19);
    doc.text(brl(quote.taxOrAddition), pageWidth - margin, y + 19, { align: 'right' });
  }
  doc.setFillColor(245, 248, 248);
  doc.roundedRect(totalsX - 3, y + 23, pageWidth - margin - totalsX + 3, 14, 2, 2, 'F');
  doc.setTextColor(...accent);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TOTAL GERAL:', totalsX + 2, y + 32);
  doc.setFontSize(14);
  doc.text(brl(quote.total), pageWidth - margin - 2, y + 32, { align: 'right' });
  y += 45;

  if (quote.notes) {
    ensureSpace(20);
    doc.setTextColor(...accent);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('INFORMAÇÕES ADICIONAIS', margin, y);
    doc.setTextColor(75, 92, 95);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    y = addWrappedText(doc, quote.notes, margin, y + 6, contentWidth, 4.5) + 4;
  }

  ensureSpace(24);
  doc.setDrawColor(180, 198, 196);
  doc.line(margin + 8, y + 10, 92, y + 10);
  doc.line(118, y + 10, pageWidth - margin - 8, y + 10);
  doc.setTextColor(92, 110, 115);
  doc.setFontSize(7.5);
  doc.text(company.tradingName || company.name || 'Orçamento Express', 50, y + 15, { align: 'center' });
  doc.text('Responsável técnico / comercial', 50, y + 19, { align: 'center' });
  doc.text(cleanText(quote.clientName), 164, y + 15, { align: 'center' });
  doc.text('De acordo do cliente / data', 164, y + 19, { align: 'center' });

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setTextColor(130, 145, 146);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`Documento gerado pelo Orçamento Express • Página ${page} de ${pageCount}`, pageWidth / 2, 291, { align: 'center' });
  }

  return doc;
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export function downloadPdfFromQuote(data: QuotePdfData, filename: string): void {
  const pdf = createPdfFromQuote(data);
  triggerBlobDownload(pdf.output('blob'), filename);
}

export function getPdfFileFromQuote(data: QuotePdfData, filename: string): File {
  const pdf = createPdfFromQuote(data);
  return new File([pdf.output('blob')], filename, { type: 'application/pdf' });
}

/** Legacy DOM export retained for compatibility with older callers. */
export async function createPdfFromElement(element: HTMLElement, options: PDFExportOptions = {}): Promise<jsPDF> {
  const filename = options.filename || 'orcamento.pdf';
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: element.scrollWidth,
    height: element.scrollHeight,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    scrollX: 0,
    scrollY: 0,
  });
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const imgWidth = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  let heightLeft = imgHeight;
  let position = 0;
  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
  heightLeft -= 297;
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= 297;
  }
  return pdf;
}

export async function downloadPdfFromElement(element: HTMLElement, filename: string): Promise<void> {
  const pdf = await createPdfFromElement(element, { filename });
  triggerBlobDownload(pdf.output('blob'), filename);
}

export async function getPdfFileFromElement(element: HTMLElement, filename: string): Promise<File> {
  const pdf = await createPdfFromElement(element, { filename });
  return new File([pdf.output('blob')], filename, { type: 'application/pdf' });
}

export function formatCurrencyBRL(value: number): string {
  return brl(value);
}

export function formatDateBR(dateString?: string): string {
  return dateBR(dateString);
}

export function formatPhoneBR(phone: string): string {
  const cleaned = (phone || '').replace(/\D/g, '');
  if (cleaned.length === 11) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  if (cleaned.length === 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  return phone;
}
