import React from 'react';
import { CompanyProfile, Quote } from '../../../types';
import { formatCurrencyBRL, formatDateBR, formatPhoneBR } from '../../../services/pdfGenerator';
import { QrCode } from 'lucide-react';

interface TemplateProps {
  quote: Quote;
  company: CompanyProfile;
  pixQrCodeUrl?: string;
  pixPayload?: string;
}

export const ClassicTemplate: React.FC<TemplateProps> = ({
  quote,
  company,
  pixQrCodeUrl,
}) => {
  return (
    <div className="pdf-sheet bg-[#fffdfa] text-[#2c2825] p-10 font-serif shadow-lg select-none text-[13px] leading-relaxed relative border-t-8 border-red-900">
      {/* Classic Top Title */}
      <div className="text-center pb-6 border-b-2 border-red-900/30">
        <h1 className="text-2xl font-bold tracking-tight text-red-950 uppercase">
          {company.tradingName || company.name}
        </h1>
        <p className="text-xs font-sans text-stone-600 mt-1">
          {company.document} • {company.address} - {company.city}
        </p>
        <p className="text-xs font-sans text-stone-500">
          Telefone: {formatPhoneBR(company.phone)} | E-mail: {company.email}
        </p>
      </div>

      {/* Proposal Header info */}
      <div className="flex justify-between items-center my-6 py-3 border-y border-stone-300 font-sans text-xs">
        <div>
          <span className="font-bold text-red-950 uppercase tracking-widest text-sm">
            Orçamento de Prestação de Serviços
          </span>
          <p className="text-stone-500 font-mono mt-0.5">Identificador: #{quote.code}</p>
        </div>
        <div className="text-right text-stone-700">
          <p>Data de Emissão: <strong>{formatDateBR(quote.issueDate)}</strong></p>
          <p>Validade da Proposta: <strong>{formatDateBR(quote.dueDate)}</strong></p>
        </div>
      </div>

      {/* Client details */}
      <div className="bg-stone-100/60 p-4 rounded border border-stone-300 my-4 font-sans text-xs">
        <p className="font-bold text-red-950 uppercase text-[11px] tracking-wider mb-1">
          Destinatário da Proposta
        </p>
        <div className="grid grid-cols-2 gap-2 text-stone-800">
          <div>
            <p><strong>Nome / Razão Social:</strong> {quote.clientName}</p>
            {quote.clientDocument && <p><strong>CPF / CNPJ:</strong> {quote.clientDocument}</p>}
          </div>
          <div>
            <p><strong>Contato:</strong> {formatPhoneBR(quote.clientPhone)}</p>
            {quote.clientEmail && <p><strong>E-mail:</strong> {quote.clientEmail}</p>}
          </div>
        </div>
        {(quote.clientAddress || quote.clientCity) && (
          <p className="mt-1 text-stone-600">
            <strong>Endereço:</strong> {quote.clientAddress} {quote.clientCity}
          </p>
        )}
      </div>

      {/* Items Table */}
      <div className="my-6">
        <table className="w-full text-left font-sans text-xs border border-stone-300">
          <thead>
            <tr className="bg-stone-200/80 text-stone-800 font-bold border-b border-stone-300">
              <th className="py-2 px-3 w-10 text-center">Nº</th>
              <th className="py-2 px-3">Especificação dos Itens e Serviços</th>
              <th className="py-2 px-3 text-center w-20">Unid</th>
              <th className="py-2 px-3 text-right w-16">Qtd</th>
              <th className="py-2 px-3 text-right w-28">Preço Unit.</th>
              <th className="py-2 px-3 text-right w-28">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {quote.items.map((item, idx) => (
              <tr key={item.id} className="hover:bg-stone-50">
                <td className="py-2 px-3 text-center font-mono text-stone-500">{idx + 1}</td>
                <td className="py-2 px-3 font-medium text-stone-900">{item.description}</td>
                <td className="py-2 px-3 text-center text-stone-600">{item.unit || 'un'}</td>
                <td className="py-2 px-3 text-right font-mono text-stone-700">{item.quantity}</td>
                <td className="py-2 px-3 text-right font-mono text-stone-700">
                  {formatCurrencyBRL(item.unitPrice)}
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold text-stone-900">
                  {formatCurrencyBRL(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals & Payment */}
      <div className="grid grid-cols-12 gap-6 my-6 font-sans text-xs items-start">
        <div className="col-span-7 space-y-3">
          <div className="p-3 bg-stone-50 border border-stone-200 rounded">
            <p className="font-bold text-stone-800 mb-1">Condições de Pagamento e Prazos</p>
            <p><strong>Forma:</strong> {quote.paymentMethod || 'A combinar'}</p>
            <p><strong>Condições:</strong> {quote.paymentTerms || company.defaultPaymentTerms}</p>
          </div>

          {quote.includePixQr && company.pixKey && pixQrCodeUrl && (
            <div className="flex items-center gap-3 p-3 bg-white border border-stone-300 rounded">
              <img src={pixQrCodeUrl} alt="PIX" className="w-20 h-20" />
              <div>
                <p className="font-bold text-red-950 flex items-center gap-1">
                  <QrCode className="w-4 h-4 text-red-900" /> Chave PIX Para Liquidação
                </p>
                <p className="text-[11px] font-mono text-stone-800 font-bold mt-1">
                  {company.pixKey}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="col-span-5 bg-stone-100 p-4 rounded border border-stone-300 space-y-1.5">
          <div className="flex justify-between text-stone-700">
            <span>Soma dos Itens:</span>
            <span className="font-mono">{formatCurrencyBRL(quote.subtotal)}</span>
          </div>
          {quote.discountTotal > 0 && (
            <div className="flex justify-between text-red-700">
              <span>Desconto Aplicado:</span>
              <span className="font-mono">-{formatCurrencyBRL(quote.discountTotal)}</span>
            </div>
          )}
          {quote.taxOrAddition > 0 && (
            <div className="flex justify-between text-stone-700">
              <span>Acréscimos:</span>
              <span className="font-mono">+{formatCurrencyBRL(quote.taxOrAddition)}</span>
            </div>
          )}
          <div className="pt-2 border-t-2 border-stone-400 flex justify-between items-baseline">
            <span className="font-bold text-stone-900 text-sm">TOTAL GERAL:</span>
            <span className="font-black text-xl font-mono text-red-950">
              {formatCurrencyBRL(quote.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="my-6 p-3 bg-stone-50 border border-stone-200 text-xs font-sans text-stone-600 rounded">
        <p className="font-bold text-stone-800 mb-0.5">Termos e Condições Gerais:</p>
        <p className="text-[11px] leading-relaxed">
          {quote.notes || company.defaultWarranty}
        </p>
      </div>

      {/* Signature */}
      <div className="grid grid-cols-2 gap-10 mt-14 pt-6 border-t border-stone-300 text-center font-sans text-xs">
        <div>
          <div className="border-b border-stone-600 w-3/4 mx-auto mb-1.5" />
          <p className="font-bold text-stone-900">{company.name}</p>
        </div>
        <div>
          <div className="border-b border-stone-600 w-3/4 mx-auto mb-1.5" />
          <p className="font-bold text-stone-900">{quote.clientName}</p>
          <p className="text-[10px] text-stone-500">Data de Aprovação: ___/___/______</p>
        </div>
      </div>
    </div>
  );
};
