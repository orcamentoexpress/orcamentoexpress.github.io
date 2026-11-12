import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  filename?: string;
  quality?: number;
}

/**
 * Capture HTML element and generate high-resolution A4 jsPDF instance
 */
export async function createPdfFromElement(
  element: HTMLElement,
  options: PDFExportOptions = {}
): Promise<jsPDF> {
  const filename = options.filename || 'orcamento.pdf';

  // Render to canvas with high resolution scale
  const canvas = await html2canvas(element, {
    scale: 2, // 2x crispness without excessive memory
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  
  // A4 dimensions in mm: 210 x 297
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * pageWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  // First page
  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  // Add subsequent pages if multi-page document
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  return pdf;
}

/**
 * Trigger immediate browser download of the PDF
 */
export async function downloadPdfFromElement(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const pdf = await createPdfFromElement(element, { filename });
  pdf.save(filename);
}

/**
 * Convert HTML element to a standard File object for Web Share API
 */
export async function getPdfFileFromElement(
  element: HTMLElement,
  filename: string
): Promise<File> {
  const pdf = await createPdfFromElement(element, { filename });
  const blob = pdf.output('blob');
  return new File([blob], filename, { type: 'application/pdf' });
}

/**
 * Format currency helper BRL
 */
export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

/**
 * Format date pt-BR (DD/MM/YYYY)
 */
export function formatDateBR(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const [year, month, day] = dateString.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
    const d = new Date(dateString);
    return d.toLocaleDateString('pt-BR');
  } catch {
    return dateString;
  }
}

/**
 * Format Brazilian phone number
 */
export function formatPhoneBR(phone: string): string {
  const cleaned = (phone || '').replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}
