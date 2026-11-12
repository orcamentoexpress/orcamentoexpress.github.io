import React from 'react';
import { CompanyProfile, Quote } from '../../../types';
import { formatCurrencyBRL, formatDateBR, formatPhoneBR } from '../../../services/pdfGenerator';
import { QrCode, Wrench } from 'lucide-react';

interface TemplateProps {
  quote: Quote;
  company: CompanyProfile;
  pixQrCodeUrl?: string;
  pixPayload?: string;
}

export const CompactTemplate: React.FC<TemplateProps> = ({
  quote,
  company,
  pixQrCodeUrl,
}) => {
  return (
    <div className="pdf-sheet bg-white text-slate-800 p-8 font-sans shadow-lg select-none text-xs leading-tight relative border border-slate-300">
      {/* Mini Header */}
      <div className="flex justify-between items-center pb-4 border-b-2 border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-slate-900 text-white flex items-center justify-center font-bold">
            <Wrench className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-base font-black uppercase text-slate-900">
              {company.tradingName || company.name}
            </h1>
            <p className="text-[11px] text-slate-600">
              {company.document} • Tel: {formatPhoneBR(company.phone)}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="font-mono font-bold text-sm bg-slate-100 px-2.5 py-1 rounded border border-slate-300">
            {quote.code}
          </span>
          <p className="text-[10px] text-slate-500 mt-1">
            Data: {formatDateBR(quote.issueDate)} | Validade: {formatDateBR(quote.dueDate)}
          </p>
        </div>
      </div>

      {/* Client Quick Info Strip */}
      <div className="grid grid-cols-2 gap-4 py-2.5 border-b border-slate-200 text-[11px] bg-slate-50/70 -mx-8 px-8 my-2">
        <div>
          <span className="text-slate-500 uppercase text-[9px] font-bold">Cliente:</span>{' '}
          <strong className="text-slate-900">{quote.clientName}</strong>
          {quote.clientDocument && ` (${quote.clientDocument})`}
        </div>
        <div className="text-right">
          <span className="text-slate-500 uppercase text-[9px] font-bold">Contato:</span>{' '}
          <strong className="text-slate-900">{formatPhoneBR(quote.clientPhone)}</strong>
        </div>
      </div>

      {/* Items dense table */}
      <div className="my-3">
        <table className="w-full text-left text-[11px]">
          <thead>
            <tr className="bg-slate-800 text-white font-semibold">
              <th className="py-1.5 px-2 w-8 text-center">#</th>
              <th className="py-1.5 px-2">Discriminação</th>
              <th className="py-1.5 px-2 text-center w-14">Unid</th>
              <th className="py-1.5 px-2 text-right w-12">Qtd</th>
              <th className="py-1.5 px-2 text-right w-24">Unitário</th>
              <th className="py-1.5 px-2 text-right w-24">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {quote.items.map((item, idx) => (
              <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="py-1.5 px-2 text-center text-slate-400 font-mono">{idx + 1}</td>
                <td className="py-1.5 px-2 font-medium text-slate-900">{item.description}</td>
                <td className="py-1.5 px-2 text-center text-slate-500">{item.unit || 'un'}</td>
                <td className="py-1.5 px-2 text-right font-mono text-slate-700">{item.quantity}</td>
                <td className="py-1.5 px-2 text-right font-mono text-slate-700">
                  {formatCurrencyBRL(item.unitPrice)}
                </td>
                <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-900">
                  {formatCurrencyBRL(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dense Summary & Pix */}
      <div className="grid grid-cols-2 gap-4 pt-3 border-t-2 border-slate-800 my-3">
        <div className="text-[11px] space-y-1">
          <p><strong>Pagamento:</strong> {quote.paymentMethod || 'A combinar'}</p>
          <p><strong>Garantia:</strong> {company.defaultWarranty}</p>
          {quote.notes && (
            <p className="text-slate-600 text-[10px] italic">Obs: {quote.notes}</p>
          )}

          {quote.includePixQr && company.pixKey && pixQrCodeUrl && (
            <div className="flex items-center gap-2 pt-2">
              <img src={pixQrCodeUrl} alt="PIX" className="w-16 h-16 border border-slate-300" />
              <div className="text-[10px]">
                <p className="font-bold flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5" /> Pagar via PIX
                </p>
                <p className="font-mono font-semibold">{company.pixKey}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-100 p-3 rounded border border-slate-300 text-right space-y-1">
          <div className="flex justify-between text-[11px] text-slate-600">
            <span>Subtotal:</span>
            <span className="font-mono">{formatCurrencyBRL(quote.subtotal)}</span>
          </div>
          {quote.discountTotal > 0 && (
            <div className="flex justify-between text-[11px] text-rose-600">
              <span>Desconto:</span>
              <span className="font-mono">-{formatCurrencyBRL(quote.discountTotal)}</span>
            </div>
          )}
          {quote.taxOrAddition > 0 && (
            <div className="flex justify-between text-[11px] text-slate-600">
              <span>Acréscimos:</span>
              <span className="font-mono">+{formatCurrencyBRL(quote.taxOrAddition)}</span>
            </div>
          )}
          <div className="pt-2 border-t border-slate-300 flex justify-between items-baseline font-bold">
            <span className="text-slate-900 text-xs">TOTAL:</span>
            <span className="text-lg font-mono text-slate-950 font-black">
              {formatCurrencyBRL(quote.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Signature compact */}
      <div className="grid grid-cols-2 gap-8 mt-6 pt-4 border-t border-slate-300 text-center text-[10px]">
        <div>
          <div className="border-b border-slate-400 w-3/4 mx-auto mb-1" />
          <p>{company.name}</p>
        </div>
        <div>
          <div className="border-b border-slate-400 w-3/4 mx-auto mb-1" />
          <p>{quote.clientName} (De acordo)</p>
        </div>
      </div>
    </div>
  );
};
