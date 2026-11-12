import React from 'react';
import { CompanyProfile, Quote } from '../../../types';
import { formatCurrencyBRL, formatDateBR, formatPhoneBR } from '../../../services/pdfGenerator';
import { CheckCircle2, Sparkles, QrCode } from 'lucide-react';

interface TemplateProps {
  quote: Quote;
  company: CompanyProfile;
  pixQrCodeUrl?: string;
  pixPayload?: string;
}

export const EmeraldTemplate: React.FC<TemplateProps> = ({
  quote,
  company,
  pixQrCodeUrl,
}) => {
  return (
    <div className="pdf-sheet bg-emerald-50/20 text-slate-800 p-10 font-sans shadow-lg select-none text-[13px] leading-relaxed relative">
      {/* Emerald Badge Header */}
      <div className="flex justify-between items-start pb-6 border-b-2 border-emerald-500">
        <div className="flex items-center gap-4">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt={company.name}
              className="w-16 h-16 object-contain rounded-2xl bg-white p-1 border border-emerald-200 shadow-sm"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-black text-xl shadow-md">
              <Sparkles className="w-7 h-7" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                {company.tradingName || company.name}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Oficial
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">{company.document}</p>
            <p className="text-xs text-slate-500">
              {formatPhoneBR(company.phone)} • {company.email}
            </p>
            <p className="text-xs text-slate-400">{company.address} - {company.city}</p>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider mb-1 shadow-sm">
            Orçamento
          </span>
          <p className="text-2xl font-black text-emerald-950 font-mono">{quote.code}</p>
          <p className="text-xs text-slate-500">Validade: <strong>{formatDateBR(quote.dueDate)}</strong></p>
        </div>
      </div>

      {/* Info Boxes */}
      <div className="grid grid-cols-2 gap-4 my-6">
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
          <p className="text-[11px] font-bold uppercase text-emerald-700 tracking-wider mb-1">
            Proposta Preparada Para:
          </p>
          <p className="text-base font-bold text-slate-900">{quote.clientName}</p>
          {quote.clientDocument && (
            <p className="text-xs text-slate-600 font-medium">CPF/CNPJ: {quote.clientDocument}</p>
          )}
          <p className="text-xs text-slate-600">{formatPhoneBR(quote.clientPhone)}</p>
          {quote.clientEmail && <p className="text-xs text-slate-500">{quote.clientEmail}</p>}
          {(quote.clientAddress || quote.clientCity) && (
            <p className="text-xs text-slate-500 mt-1">{quote.clientAddress} {quote.clientCity}</p>
          )}
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-emerald-700 tracking-wider mb-1">
              Condições e Prazos
            </p>
            <p className="text-xs text-slate-700">
              Pagamento: <strong>{quote.paymentMethod || 'PIX facilitado'}</strong>
            </p>
            <p className="text-xs text-slate-700 mt-0.5">
              Condições: <strong>{quote.paymentTerms || company.defaultPaymentTerms}</strong>
            </p>
          </div>
          <div className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200 mt-2">
            ✓ {company.defaultWarranty}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="my-6 bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-emerald-600 text-white font-semibold">
              <th className="py-2.5 px-3 w-10 text-center">#</th>
              <th className="py-2.5 px-3">Item / Serviço</th>
              <th className="py-2.5 px-3 text-center w-20">Unidade</th>
              <th className="py-2.5 px-3 text-right w-16">Qtd</th>
              <th className="py-2.5 px-3 text-right w-28">Unitário</th>
              <th className="py-2.5 px-3 text-right w-28">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-50 text-slate-700">
            {quote.items.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-emerald-50/20'}>
                <td className="py-2 px-3 text-center text-emerald-600 font-mono text-[11px] font-bold">
                  {index + 1}
                </td>
                <td className="py-2 px-3 font-semibold text-slate-900">{item.description}</td>
                <td className="py-2 px-3 text-center text-slate-500">{item.unit || 'un'}</td>
                <td className="py-2 px-3 text-right text-slate-700 font-mono">{item.quantity}</td>
                <td className="py-2 px-3 text-right text-slate-700 font-mono">
                  {formatCurrencyBRL(item.unitPrice)}
                </td>
                <td className="py-2 px-3 text-right font-bold text-emerald-900 font-mono">
                  {formatCurrencyBRL(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals & PIX */}
      <div className="grid grid-cols-12 gap-4 my-6 items-stretch">
        <div className="col-span-7 bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-4">
          {quote.includePixQr && company.pixKey && pixQrCodeUrl ? (
            <>
              <img
                src={pixQrCodeUrl}
                alt="PIX QR"
                className="w-24 h-24 rounded-xl border border-emerald-300 p-1 bg-white shadow-sm shrink-0"
              />
              <div className="text-xs">
                <span className="inline-flex items-center gap-1 font-bold text-emerald-800 text-sm">
                  <QrCode className="w-4 h-4 text-emerald-600" /> PIX Instantâneo
                </span>
                <p className="text-[11px] text-slate-600 mt-1">
                  Chave: <span className="font-mono font-bold text-slate-900">{company.pixKey}</span>
                </p>
                <p className="text-[10px] text-emerald-700 font-medium mt-1">
                  ✓ Aprovação e início imediato após confirmação
                </p>
              </div>
            </>
          ) : (
            <div className="text-xs text-slate-600">
              <p className="font-bold text-slate-800 mb-1">Observações da Proposta</p>
              <p className="text-[11px]">{quote.notes || company.defaultNotes}</p>
            </div>
          )}
        </div>

        <div className="col-span-5 bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-5 rounded-2xl shadow-md flex flex-col justify-between">
          <div className="space-y-1.5 text-xs text-emerald-100">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono">{formatCurrencyBRL(quote.subtotal)}</span>
            </div>
            {quote.discountTotal > 0 && (
              <div className="flex justify-between text-emerald-300 font-semibold">
                <span>Desconto Especial:</span>
                <span className="font-mono">-{formatCurrencyBRL(quote.discountTotal)}</span>
              </div>
            )}
            {quote.taxOrAddition > 0 && (
              <div className="flex justify-between">
                <span>Acréscimos:</span>
                <span className="font-mono">+{formatCurrencyBRL(quote.taxOrAddition)}</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-emerald-700/60 flex justify-between items-baseline mt-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-200">
              Valor Total:
            </span>
            <span className="text-2xl font-black font-mono text-white">
              {formatCurrencyBRL(quote.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Signature & Acceptance */}
      <div className="grid grid-cols-2 gap-8 mt-12 pt-6 border-t border-emerald-200 text-center text-xs">
        <div>
          <div className="border-b border-emerald-600 w-3/4 mx-auto mb-1.5" />
          <p className="font-bold text-slate-900">{company.name}</p>
          <p className="text-[11px] text-slate-500">Emissão Técnica</p>
        </div>
        <div>
          <div className="border-b border-emerald-600 w-3/4 mx-auto mb-1.5" />
          <p className="font-bold text-slate-900">{quote.clientName}</p>
          <p className="text-[11px] text-slate-500">Assinatura de Aceite</p>
        </div>
      </div>
    </div>
  );
};
