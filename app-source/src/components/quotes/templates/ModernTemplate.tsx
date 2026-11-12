import React from 'react';
import { CompanyProfile, Quote } from '../../../types';
import { formatCurrencyBRL, formatDateBR, formatPhoneBR } from '../../../services/pdfGenerator';
import { CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';

interface TemplateProps {
  quote: Quote;
  company: CompanyProfile;
  pixQrCodeUrl?: string;
  pixPayload?: string;
}

export const ModernTemplate: React.FC<TemplateProps> = ({
  quote,
  company,
  pixQrCodeUrl,
  pixPayload,
}) => {
  return (
    <div className="pdf-sheet bg-white text-slate-800 p-10 font-sans shadow-lg rounded-none select-none text-[13px] leading-relaxed relative">
      {/* Top Accent Bar */}
      <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 -mx-10 -mt-10 mb-8" />

      {/* Header */}
      <div className="flex justify-between items-start pb-6 border-b border-slate-200">
        <div className="flex items-center gap-4">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt={company.name}
              className="w-16 h-16 object-contain rounded-lg border border-slate-100 shadow-sm"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-md">
              {company.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {company.tradingName || company.name}
            </h1>
            <p className="text-xs text-slate-500 font-medium">{company.document}</p>
            <p className="text-xs text-slate-500">
              {company.phone && formatPhoneBR(company.phone)} • {company.email}
            </p>
            <p className="text-xs text-slate-400">{company.address} - {company.city}</p>
          </div>
        </div>

        <div className="text-right">
          <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">
            Orçamento
          </div>
          <p className="text-2xl font-black text-slate-900">{quote.code}</p>
          <div className="text-xs text-slate-500 space-y-0.5 mt-1">
            <p>Emissão: <strong className="text-slate-700">{formatDateBR(quote.issueDate)}</strong></p>
            <p>Validade: <strong className="text-slate-700">{formatDateBR(quote.dueDate)}</strong></p>
          </div>
        </div>
      </div>

      {/* Client & Info Cards */}
      <div className="grid grid-cols-2 gap-4 my-6">
        <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Dados do Cliente
          </p>
          <p className="font-bold text-slate-900 text-sm">{quote.clientName}</p>
          {quote.clientDocument && (
            <p className="text-xs text-slate-600">CPF/CNPJ: {quote.clientDocument}</p>
          )}
          <p className="text-xs text-slate-600">
            {formatPhoneBR(quote.clientPhone)} {quote.clientEmail && `• ${quote.clientEmail}`}
          </p>
          {(quote.clientAddress || quote.clientCity) && (
            <p className="text-xs text-slate-500 mt-1">
              {quote.clientAddress} {quote.clientCity && `- ${quote.clientCity}`}
            </p>
          )}
        </div>

        <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Condições Comerciais
            </p>
            <p className="text-xs text-slate-700">
              Forma de Pagamento: <strong>{quote.paymentMethod || 'A combinar'}</strong>
            </p>
            <p className="text-xs text-slate-700 mt-0.5">
              Condições: <strong>{quote.paymentTerms || company.defaultPaymentTerms}</strong>
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mt-2 pt-2 border-t border-slate-200">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{company.defaultWarranty || 'Garantia legal de 90 dias'}</span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="my-6">
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100/90 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">Descrição do Item / Serviço</th>
                <th className="py-2.5 px-3 text-center w-20">Unidade</th>
                <th className="py-2.5 px-3 text-right w-20">Qtd</th>
                <th className="py-2.5 px-3 text-right w-28">Valor Unit.</th>
                <th className="py-2.5 px-3 text-right w-28">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {quote.items.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                  <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                    {String(index + 1).padStart(2, '0')}
                  </td>
                  <td className="py-2 px-3 font-medium text-slate-800">
                    {item.description}
                  </td>
                  <td className="py-2 px-3 text-center text-slate-500">{item.unit || 'un'}</td>
                  <td className="py-2 px-3 text-right text-slate-600 font-mono">{item.quantity}</td>
                  <td className="py-2 px-3 text-right text-slate-600 font-mono">
                    {formatCurrencyBRL(item.unitPrice)}
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">
                    {formatCurrencyBRL(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals & PIX row */}
      <div className="grid grid-cols-12 gap-4 my-6 items-start">
        {/* PIX QR Section */}
        <div className="col-span-7">
          {quote.includePixQr && company.pixKey && pixQrCodeUrl ? (
            <div className="flex items-center gap-4 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
              <img
                src={pixQrCodeUrl}
                alt="PIX QR Code"
                className="w-24 h-24 rounded-lg bg-white p-1 border border-emerald-200 shadow-sm shrink-0"
              />
              <div className="text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-1">
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  <span>Pagamento Instantâneo PIX</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-tight">
                  Aponte a câmera do aplicativo do seu banco para pagar com rapidez e segurança.
                </p>
                <div className="mt-1.5 text-[11px] text-slate-700">
                  Chave: <strong className="font-mono text-slate-900">{company.pixKey}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-600">
              <p className="font-bold text-slate-800 mb-1">Informações Adicionais</p>
              <p className="text-[11px] leading-relaxed">
                {quote.notes || company.defaultNotes || 'Agradecemos a preferência!'}
              </p>
            </div>
          )}
        </div>

        {/* Totals box */}
        <div className="col-span-5 bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono">{formatCurrencyBRL(quote.subtotal)}</span>
            </div>

            {quote.discountTotal > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Desconto:</span>
                <span className="font-mono">-{formatCurrencyBRL(quote.discountTotal)}</span>
              </div>
            )}

            {quote.taxOrAddition > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Acréscimos / Taxas:</span>
                <span className="font-mono">+{formatCurrencyBRL(quote.taxOrAddition)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-300 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">Total Geral:</span>
              <span className="text-xl font-black text-indigo-700 font-mono">
                {formatCurrencyBRL(quote.total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes & Observations if PIX took left box */}
      {quote.includePixQr && company.pixKey && quote.notes && (
        <div className="my-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <strong className="text-slate-800">Observações: </strong> {quote.notes}
        </div>
      )}

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-12 mt-12 pt-8 border-t border-slate-200 text-center text-xs">
        <div>
          <div className="border-b border-slate-400 w-4/5 mx-auto mb-2" />
          <p className="font-bold text-slate-800">{company.name}</p>
          <p className="text-[11px] text-slate-500">Responsável Técnico / Comercial</p>
        </div>

        <div>
          <div className="border-b border-slate-400 w-4/5 mx-auto mb-2" />
          <p className="font-bold text-slate-800">{quote.clientName}</p>
          <p className="text-[11px] text-slate-500">De acordo do Cliente / Data: ___/___/______</p>
        </div>
      </div>

      {/* Discreet footer */}
      <div className="absolute bottom-3 left-10 right-10 flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-100 pt-2">
        <span>Documento gerado eletronicamente via Orçamento Express</span>
        <span>Página 1 de 1</span>
      </div>
    </div>
  );
};
