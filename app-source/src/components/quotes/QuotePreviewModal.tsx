import React, { useState, useRef, useEffect } from 'react';
import { CompanyProfile, PDFTheme, Quote, QuoteStatus } from '../../types';
import { TemplateRenderer } from './templates/TemplateRenderer';
import { generatePixPayload, generatePixQRCodeDataUrl } from '../../services/pix';
import { downloadPdfFromElement, getPdfFileFromElement, formatCurrencyBRL, formatDateBR } from '../../services/pdfGenerator';
import confetti from 'canvas-confetti';
import {
  X,
  Download,
  Share2,
  Printer,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  Palette,
  Loader2,
  Check,
  Send,
  Eye,
  FileText
} from 'lucide-react';

interface QuotePreviewModalProps {
  quote: Quote;
  company: CompanyProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (quoteId: string, newStatus: QuoteStatus) => void;
  onUpdateTheme: (quoteId: string, newTheme: PDFTheme) => void;
}

export const QuotePreviewModal: React.FC<QuotePreviewModalProps> = ({
  quote,
  company,
  isOpen,
  onClose,
  onUpdateStatus,
  onUpdateTheme,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<PDFTheme>(quote.theme || 'modern');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pixQrCodeUrl, setPixQrCodeUrl] = useState<string>('');
  const [pixPayload, setPixPayload] = useState<string>('');
  const [showWhatsAppEditor, setShowWhatsAppEditor] = useState(false);
  const [whatsappMsg, setWhatsappMsg] = useState('');
  const [canShareFiles, setCanShareFiles] = useState(false);
  const [scale, setScale] = useState(1);

  const previewSheetRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Generate PIX QR Code
  useEffect(() => {
    async function loadPix() {
      if (quote.includePixQr && company.pixKey) {
        const payload = generatePixPayload({
          key: company.pixKey,
          merchantName: company.tradingName || company.name,
          merchantCity: company.city,
          amount: quote.total,
          txid: quote.code.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20),
        });
        setPixPayload(payload);
        const qr = await generatePixQRCodeDataUrl(payload);
        setPixQrCodeUrl(qr);
      } else {
        setPixQrCodeUrl('');
        setPixPayload('');
      }
    }
    loadPix();
  }, [quote, company]);

  // Check Web Share File support
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'canShare' in navigator) {
      try {
        const testFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
        setCanShareFiles(navigator.canShare({ files: [testFile] }));
      } catch {
        setCanShareFiles(false);
      }
    }
  }, []);

  // Update scale based on screen width
  useEffect(() => {
    function updateScale() {
      if (!previewContainerRef.current) return;
      const containerWidth = previewContainerRef.current.clientWidth - 32;
      const targetWidth = 794; // A4 standard width
      if (containerWidth < targetWidth) {
        setScale(Math.max(0.4, containerWidth / targetWidth));
      } else {
        setScale(1);
      }
    }
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && previewContainerRef.current) {
      previewContainerRef.current.scrollTop = 0;
      previewContainerRef.current.scrollLeft = 0;
    }
  }, [isOpen, quote.id]);

  // Sync theme
  useEffect(() => {
    setSelectedTheme(quote.theme || 'modern');
  }, [quote.theme]);

  // Prepare default WhatsApp message
  useEffect(() => {
    const rawTemplate = company.whatsappMessageTemplate ||
      'Olá *{cliente}*, tudo bem?\n\nSegue o seu *Orçamento #{numero}* no valor total de *{total}*.\n\n📅 Validade: *{validade}*\n\nQualquer dúvida estou à disposição!';

    const replaced = rawTemplate
      .replace(/{cliente}/g, quote.clientName || 'Cliente')
      .replace(/{numero}/g, quote.code)
      .replace(/{total}/g, formatCurrencyBRL(quote.total))
      .replace(/{validade}/g, formatDateBR(quote.dueDate))
      .replace(/{empresa}/g, company.tradingName || company.name)
      .replace(/{pix}/g, company.pixKey || '');

    setWhatsappMsg(replaced);
  }, [quote, company]);

  if (!isOpen) return null;

  const handleThemeChange = (theme: PDFTheme) => {
    setSelectedTheme(theme);
    onUpdateTheme(quote.id, theme);
  };

  const handleDownloadPdf = async () => {
    if (!previewSheetRef.current) return;
    try {
      setIsGeneratingPdf(true);
      const filename = `Orcamento_${quote.code}_${quote.clientName.replace(/\s+/g, '_')}.pdf`;
      await downloadPdfFromElement(previewSheetRef.current, filename);
    } catch (err) {
      console.error('Erro ao gerar PDF', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSharePdfDirect = async () => {
    if (!previewSheetRef.current) return;
    try {
      setIsGeneratingPdf(true);
      const filename = `Orcamento_${quote.code}.pdf`;
      const file = await getPdfFileFromElement(previewSheetRef.current, filename);

      if (navigator.share && canShareFiles) {
        await navigator.share({
          title: `Orçamento ${quote.code} - ${company.name}`,
          text: whatsappMsg,
          files: [file],
        });
        onUpdateStatus(quote.id, 'enviado');
      } else {
        await downloadPdfFromElement(previewSheetRef.current, filename);
        openWhatsAppWithMessage();
      }
    } catch (err) {
      console.log('Share dismissed or not supported, using download fallback', err);
      try {
        const filename = `Orcamento_${quote.code}.pdf`;
        await downloadPdfFromElement(previewSheetRef.current, filename);
        openWhatsAppWithMessage();
      } catch (fallbackError) {
        console.error('Fallback de PDF também falhou', fallbackError);
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const openWhatsAppWithMessage = () => {
    const cleanPhone = (quote.clientPhone || '').replace(/\D/g, '');
    let fullPhone = cleanPhone;
    if (fullPhone.length === 10 || fullPhone.length === 11) {
      fullPhone = `55${fullPhone}`;
    }

    const encoded = encodeURIComponent(whatsappMsg);
    const url = fullPhone
      ? `https://wa.me/${fullPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;

    window.open(url, '_blank');
    onUpdateStatus(quote.id, 'enviado');
    setShowWhatsAppEditor(false);
  };

  const handleSendWhatsAppChat = async () => {
    if (!previewSheetRef.current) return;
    try {
      setIsGeneratingPdf(true);
      const filename = `Orcamento_${quote.code}.pdf`;
      // O WhatsApp Web não permite anexar um arquivo por wa.me automaticamente.
      // Baixamos o PDF primeiro e abrimos a conversa com a mensagem pronta.
      await downloadPdfFromElement(previewSheetRef.current, filename);
      openWhatsAppWithMessage();
    } catch (err) {
      console.error('Não foi possível preparar o PDF para o WhatsApp', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleApproveWithConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#06b6d4', '#f59e0b', '#3b82f6'],
    });
    onUpdateStatus(quote.id, 'aprovado');
  };

  const themesList: { id: PDFTheme; name: string; tag: string; color: string }[] = [
    { id: 'modern', name: 'Moderno', tag: 'Azul & Índigo', color: 'bg-blue-600' },
    { id: 'corporate', name: 'Executivo', tag: 'Navy & Gold', color: 'bg-slate-900' },
    { id: 'emerald', name: 'Emerald', tag: 'Verde Tech', color: 'bg-emerald-600' },
    { id: 'classic', name: 'Clássico', tag: 'Bordô & Papiro', color: 'bg-red-900' },
    { id: 'compact', name: 'Cupom / OS', tag: 'Ultra Compacto', color: 'bg-amber-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:px-6 sm:py-3.5 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400">
              <FileText className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{quote.code}</h2>
                <span className="text-xs text-slate-400 font-normal">({quote.clientName})</span>
              </div>
              <p className="text-xs text-emerald-400 font-semibold">
                Total: {formatCurrencyBRL(quote.total)}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* WhatsApp Send */}
            <button
              onClick={() => setShowWhatsAppEditor(!showWhatsAppEditor)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition active:scale-95"
              title="Enviar para o WhatsApp do cliente"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            {/* Direct Share on Mobile */}
            {canShareFiles && (
              <button
                onClick={handleSharePdfDirect}
                disabled={isGeneratingPdf}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition active:scale-95 disabled:opacity-50"
                title="Compartilhar arquivo PDF"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Compartilhar PDF</span>
              </button>
            )}

            {/* Download PDF */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition active:scale-95 disabled:opacity-50"
              title="Baixar PDF em alta definição"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isGeneratingPdf ? 'Gerando...' : 'Baixar PDF'}</span>
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition"
              title="Imprimir"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Style Selector Ribbon */}
        <div className="flex items-center gap-2 px-3 sm:px-6 py-2.5 bg-slate-950/70 border-b border-slate-800/80 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1 text-xs text-slate-400 font-medium shrink-0 mr-2">
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            <span>Estilo do PDF:</span>
          </div>

          <div className="flex items-center gap-2">
            {themesList.map((t) => {
              const active = selectedTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleThemeChange(t.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition shrink-0 ${
                    active
                      ? 'bg-slate-800 text-white border border-emerald-500/50 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${t.color}`} />
                  <span>{t.name}</span>
                  {active && <Check className="w-3 h-3 text-emerald-400 ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* WhatsApp Message Drawer (collapsible) */}
        {showWhatsAppEditor && (
          <div className="bg-emerald-950/30 border-b border-emerald-900/50 p-4 shrink-0 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                Mensagem para {quote.clientName} ({quote.clientPhone || 'sem telefone'})
              </span>
              <button
                onClick={() => setShowWhatsAppEditor(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Ocultar
              </button>
            </div>
            <textarea
              rows={3}
              value={whatsappMsg}
              onChange={(e) => setWhatsappMsg(e.target.value)}
              className="w-full text-xs bg-slate-950/80 border border-emerald-800/60 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              placeholder="Digite a mensagem..."
            />
            <div className="flex items-center justify-between mt-2.5">
              <p className="text-[11px] text-slate-400">
                O PDF será baixado e o WhatsApp abrirá com a mensagem preenchida. Anexe o arquivo baixado na conversa.
              </p>
              <button
                onClick={handleSendWhatsAppChat}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Abrir WhatsApp</span>
              </button>
            </div>
          </div>
        )}

        {/* PDF Canvas Viewport */}
        <div
          ref={previewContainerRef}
          className="flex-1 overflow-auto bg-slate-950/90 p-4 flex justify-center items-start"
        >
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              width: 794,
              marginBottom: scale < 1 ? `-${1123 * (1 - scale)}px` : undefined,
            }}
          >
            <div ref={previewSheetRef} className="shadow-2xl">
              <TemplateRenderer
                quote={quote}
                company={company}
                pixQrCodeUrl={pixQrCodeUrl}
                pixPayload={pixPayload}
                forcedTheme={selectedTheme}
              />
            </div>
          </div>
        </div>

        {/* Bottom Bar: Complete Status Switcher with all 5 options */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:px-6 bg-slate-900 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">Alterar Status:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-end">
            {/* Rascunho */}
            <button
              onClick={() => onUpdateStatus(quote.id, 'rascunho')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                quote.status === 'rascunho'
                  ? 'bg-slate-700 text-white border-slate-500 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              ⏳ Rascunho
            </button>

            {/* Enviado */}
            <button
              onClick={() => onUpdateStatus(quote.id, 'enviado')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                quote.status === 'enviado'
                  ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-blue-300 border-slate-800'
              }`}
            >
              📤 Enviado
            </button>

            {/* Aprovado */}
            <button
              onClick={() => {
                if (quote.status !== 'aprovado') {
                  handleApproveWithConfetti();
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                quote.status === 'aprovado'
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm shadow-emerald-950/50'
                  : 'bg-slate-950/60 text-slate-400 hover:text-emerald-300 border-slate-800'
              }`}
            >
              ✅ Aprovado
            </button>

            {/* Concluído */}
            <button
              onClick={() => onUpdateStatus(quote.id, 'concluido')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                quote.status === 'concluido'
                  ? 'bg-purple-600 text-white border-purple-400 shadow-sm shadow-purple-950/50'
                  : 'bg-slate-950/60 text-slate-400 hover:text-purple-300 border-slate-800'
              }`}
            >
              🚀 Concluído
            </button>

            {/* Recusado */}
            <button
              onClick={() => onUpdateStatus(quote.id, 'recusado')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                quote.status === 'recusado'
                  ? 'bg-rose-600 text-white border-rose-400 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-rose-300 border-slate-800'
              }`}
            >
              ❌ Recusado
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
