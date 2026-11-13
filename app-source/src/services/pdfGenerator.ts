import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
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

const A4_WIDTH_PX = 794; // 210mm a 96 DPI
const A4_HEIGHT_PX = 1123; // 297mm a 96 DPI
const CAPTURE_SCALE = 2;

async function waitForAssets(element: HTMLElement): Promise<void> {
  try {
    if ('fonts' in document) await (document as Document & { fonts: FontFaceSet }).fonts.ready;
  } catch {
    // fontes são opcionais
  }
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map((img) =>
      img.complete && img.naturalWidth > 0
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener('load', () => resolve(), { once: true });
            img.addEventListener('error', () => resolve(), { once: true });
            window.setTimeout(resolve, 4000);
          })
    )
  );
  // dá um respiro para o layout assentar antes da captura
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

/** Procura, perto do corte, uma linha de pixels em branco para não cortar texto ao meio. */
function findSafeCut(canvas: HTMLCanvasElement, target: number, minY: number): number {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return target;
  const width = canvas.width;
  const searchStart = Math.min(target, canvas.height);
  const searchEnd = Math.max(minY, searchStart - Math.round(140 * CAPTURE_SCALE));
  for (let y = searchStart; y > searchEnd; y -= 2) {
    const row = ctx.getImageData(0, y, width, 1).data;
    const r = row[0], g = row[1], b = row[2];
    let uniform = true;
    for (let x = 0; x < width * 4; x += 16) {
      if (Math.abs(row[x] - r) > 6 || Math.abs(row[x + 1] - g) > 6 || Math.abs(row[x + 2] - b) > 6) {
        uniform = false;
        break;
      }
    }
    if (uniform) return y;
  }
  return target;
}

/**
 * Gera o PDF a partir do MESMO modelo (template) mostrado na tela: captura o elemento
 * em tamanho real A4 (sem transform/zoom) e divide em páginas A4.
 * Usa html2canvas-pro porque o Tailwind v4 usa cores oklch(), que o html2canvas original
 * não entende (causava PDF em branco / quebrado).
 */
export async function createPdfFromElement(element: HTMLElement, options: PDFExportOptions = {}): Promise<jsPDF> {
  void options;
  await waitForAssets(element);

  const width = Math.max(element.scrollWidth, A4_WIDTH_PX);
  const height = element.scrollHeight;
  const canvas = await html2canvas(element, {
    scale: CAPTURE_SCALE,
    useCORS: true,
    allowTaint: false,
    logging: false,
    backgroundColor: '#ffffff',
    width,
    height,
    windowWidth: width,
    windowHeight: height,
    scrollX: 0,
    scrollY: 0,
  });

  if (!canvas.width || !canvas.height) throw new Error('Captura do documento retornou vazia');

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const pageHeightPx = Math.round((canvas.width * 297) / 210);
  const minSlice = Math.round(pageHeightPx * 0.55);

  let offset = 0;
  let pageIndex = 0;
  while (offset < canvas.height - 2) {
    let end = offset + pageHeightPx;
    if (end >= canvas.height) {
      end = canvas.height;
    } else {
      end = findSafeCut(canvas, end, offset + minSlice);
    }
    const sliceHeight = end - offset;

    const page = document.createElement('canvas');
    page.width = canvas.width;
    page.height = pageHeightPx;
    const pctx = page.getContext('2d');
    if (!pctx) throw new Error('Canvas 2D indisponível');
    pctx.fillStyle = '#ffffff';
    pctx.fillRect(0, 0, page.width, page.height);
    pctx.drawImage(canvas, 0, offset, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

    if (pageIndex > 0) pdf.addPage();
    pdf.addImage(page.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

    offset = end;
    pageIndex += 1;
    if (pageIndex > 30) break; // proteção contra loop
  }
  return pdf;
}

/** Tenta o modelo real; se falhar, usa o layout nativo como plano B para nunca ficar sem PDF. */
export async function buildQuotePdf(element: HTMLElement | null, data: QuotePdfData): Promise<jsPDF> {
  if (element) {
    try {
      return await createPdfFromElement(element);
    } catch (err) {
      console.error('Falha ao capturar o modelo, usando layout nativo', err);
    }
  }
  return createPdfFromQuote(data);
}

export async function downloadQuotePdf(element: HTMLElement | null, data: QuotePdfData, filename: string): Promise<void> {
  const pdf = await buildQuotePdf(element, data);
  triggerBlobDownload(pdf.output('blob'), filename);
}

export async function getQuotePdfFile(element: HTMLElement | null, data: QuotePdfData, filename: string): Promise<File> {
  const pdf = await buildQuotePdf(element, data);
  return new File([pdf.output('blob')], filename, { type: 'application/pdf' });
}

export async function downloadPdfFromElement(element: HTMLElement, filename: string): Promise<void> {
  const pdf = await createPdfFromElement(element);
  triggerBlobDownload(pdf.output('blob'), filename);
}

export async function getPdfFileFromElement(element: HTMLElement, filename: string): Promise<File> {
  const pdf = await createPdfFromElement(element);
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
