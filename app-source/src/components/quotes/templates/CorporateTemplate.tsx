import React from 'react';
import { CompanyProfile, Quote } from '../../../types';
import { formatCurrencyBRL, formatDateBR, formatPhoneBR } from '../../../services/pdfGenerator';
import { Building2, ShieldCheck, QrCode } from 'lucide-react';

interface TemplateProps {
  quote: Quote;
  company: CompanyProfile;
  pixQrCodeUrl?: string;
  pixPayload?: string;
}

export const CorporateTemplate: React.FC<TemplateProps> = ({
  quote,
  company,
  pixQrCodeUrl,
}) => {
  return (
    <div className="pdf-sheet bg-white text-slate-800 p-10 font-sans shadow-lg select-none text-[13px] leading-relaxed relative">
      {/* Corporate Solid Banner */}
      <div className="bg-slate-900 text-white p-6 -mx-10 -mt-10 mb-6 flex justify-between items-center border-b-4 border-amber-500">
        <div className="flex items-center gap-4">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt={company.name}
              className="w-16 h-16 object-contain bg-white rounded p-1 shadow"
            />
          ) : (
            <div className="w-14 h-14 bg-amber-500 text-slate-950 font-black text-2xl flex items-center justify-center rounded shadow">
              <Building2 className="w-7 h-7" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-black tracking-wide uppercase">
              {company.tradingName || company.name}
            </h1>
            <p className="text-xs text-slate-300 font-medium">CNPJ/CPF: {company.document}</p>
            <p className="text-xs text-slate-400">
              {company.phone && formatPhoneBR(company.phone)} | {company.email}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-bold tracking-widest uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded">
            PROPOSTA COMERCIAL
          </span>
          <p className="text-2xl font-black text-white mt-1.5">{quote.code}</p>
          <p className="text-xs text-slate-400">Emissão: {formatDateBR(quote.issueDate)}</p>
        </div>
      </div>

      {/* Two Column Issuer / Client Box */}
      <div className="grid grid-cols-2 gap-6 my-6">
        <div className="border-l-2 border-slate-900 pl-4 py-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            EMISSOR DA PROPOSTA
          </p>
          <p className="font-bold text-slate-900 text-sm">{company.name}</p>
          <p className="text-xs text-slate-600">{company.address}</p>
          <p className="text-xs text-slate-600">{company.city}</p>
        </div>

        <div className="border-l-2 border-amber-500 pl-4 py-1 bg-amber-50/30 rounded-r-lg">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
            CLIENTE / DESTINATÁRIO
          </p>
          <p className="font-bold text-slate-900 text-sm">{quote.clientName}</p>
          {quote.clientDocument && (
            <p className="text-xs text-slate-700">Doc: {quote.clientDocument}</p>
          )}
          <p className="text-xs text-slate-700">{formatPhoneBR(quote.clientPhone)}</p>
          {quote.clientEmail && <p className="text-xs text-slate-600">{quote.clientEmail}</p>}
          {(quote.clientAddress || quote.clientCity) && (
            <p className="text-xs text-slate-500">{quote.clientAddress} {quote.clientCity}</p>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="my-6">
        <table className="w-full text-left text-xs border border-slate-300">
          <thead>
            <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px]">
              <th className="py-2.5 px-3 w-10 text-center">Item</th>
              <th className="py-2.5 px-3">Discriminação dos Serviços / Produtos</th>
              <th className="py-2.5 px-3 text-center w-20">Unid</th>
              <th className="py-2.5 px-3 text-right w-16">Qtd</th>
              <th className="py-2.5 px-3 text-right w-28">Unitário</th>
              <th className="py-2.5 px-3 text-right w-28">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {quote.items.map((item, idx) => (
              <tr key={item.id} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                <td className="py-2 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                <td className="py-2 px-3 font-semibold text-slate-800">{item.description}</td>
                <td className="py-2 px-3 text-center text-slate-500 uppercase">{item.unit || 'UN'}</td>
                <td className="py-2 px-3 text-right font-mono text-slate-700">{item.quantity}</td>
                <td className="py-2 px-3 text-right font-mono text-slate-700">
                  {formatCurrencyBRL(item.unitPrice)}
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                  {formatCurrencyBRL(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Financial Breakdown & Conditions */}
      <div className="grid grid-cols-12 gap-6 my-6 items-start">
        <div className="col-span-7 space-y-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
            <p className="font-bold text-slate-800 uppercase text-[11px] tracking-wider">
              Condições de Faturamento
            </p>
            <p><strong>Forma:</strong> {quote.paymentMethod || 'A combinar'}</p>
            <p><strong>Termos:</strong> {quote.paymentTerms || company.defaultPaymentTerms}</p>
            <p><strong>Validade da Proposta:</strong> até {formatDateBR(quote.dueDate)}</p>
          </div>

          {quote.includePixQr && company.pixKey && pixQrCodeUrl && (
            <div className="flex items-center gap-3 p-3 bg-white border-2 border-slate-900 rounded">
              <img src={pixQrCodeUrl} alt="PIX" className="w-20 h-20 bg-white" />
              <div className="text-xs">
                <p className="font-bold text-slate-900 flex items-center gap-1">
                  <QrCode className="w-4 h-4 text-amber-600" /> PIX para Faturamento Direto
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Chave: <span className="font-mono font-semibold">{company.pixKey}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="col-span-5">
          <div className="border border-slate-300 rounded bg-slate-50 p-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono">{formatCurrencyBRL(quote.subtotal)}</span>
            </div>
            {quote.discountTotal > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Desconto Concedido:</span>
                <span className="font-mono">-{formatCurrencyBRL(quote.discountTotal)}</span>
              </div>
            )}
            {quote.taxOrAddition > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Taxas Adicionais:</span>
                <span className="font-mono">+{formatCurrencyBRL(quote.taxOrAddition)}</span>
              </div>
            )}
            <div className="pt-2 border-t-2 border-slate-900 flex justify-between items-baseline">
              <span className="font-black text-slate-900 text-sm uppercase">Total Líquido:</span>
              <span className="font-black font-mono text-xl text-slate-900">
                {formatCurrencyBRL(quote.total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Warranty & Scope */}
      <div className="p-3 bg-slate-100/70 border border-slate-200 text-xs text-slate-700 rounded mb-8">
        <p className="font-bold text-slate-800 flex items-center gap-1.5 mb-0.5">
          <ShieldCheck className="w-4 h-4 text-slate-700" /> Cláusula de Garantia e Escopo
        </p>
        <p className="text-[11px]">
          {quote.notes || company.defaultWarranty}
        </p>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-12 mt-12 pt-6 border-t border-slate-300 text-center text-xs">
        <div>
          <div className="border-b border-slate-700 w-3/4 mx-auto mb-1.5" />
          <p className="font-bold text-slate-900">{company.name}</p>
          <p className="text-[11px] text-slate-500">Depto. Comercial / Gestão</p>
        </div>
        <div>
          <div className="border-b border-slate-700 w-3/4 mx-auto mb-1.5" />
          <p className="font-bold text-slate-900">{quote.clientName}</p>
          <p className="text-[11px] text-slate-500">Aceite Formal do Contratante</p>
        </div>
      </div>
    </div>
  );
};
