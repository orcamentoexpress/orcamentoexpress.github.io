import React, { useState, useEffect } from 'react';
import { Client, CompanyProfile, PDFTheme, Quote, QuoteItem, QuoteStatus } from '../../types';
import { formatCurrencyBRL } from '../../services/pdfGenerator';
import {
  Plus,
  Trash2,
  Save,
  Eye,
  ArrowLeft,
  UserPlus,
  FileCheck2,
  Calendar,
  Percent,
  DollarSign,
  Palette,
  CreditCard,
  QrCode,
  AlertTriangle,
  X
} from 'lucide-react';

interface QuoteEditorProps {
  initialQuote?: Quote | null;
  clients: Client[];
  company: CompanyProfile;
  onSave: (quote: Quote, openPreview?: boolean) => void;
  onCancel: () => void;
  onQuickAddClient: (newClient: Client) => void;
}

export const QuoteEditor: React.FC<QuoteEditorProps> = ({
  initialQuote,
  clients,
  company,
  onSave,
  onCancel,
  onQuickAddClient,
}) => {
  // Default dates
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultDue = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];

  const [code, setCode] = useState(
    initialQuote?.code || `ORC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`
  );
  const [selectedClientId, setSelectedClientId] = useState(initialQuote?.clientId || '');
  const [clientName, setClientName] = useState(initialQuote?.clientName || '');
  const [clientPhone, setClientPhone] = useState(initialQuote?.clientPhone || '');
  const [clientEmail, setClientEmail] = useState(initialQuote?.clientEmail || '');
  const [clientDocument, setClientDocument] = useState(initialQuote?.clientDocument || '');
  const [clientAddress, setClientAddress] = useState(initialQuote?.clientAddress || '');
  const [clientCity, setClientCity] = useState(initialQuote?.clientCity || '');

  const [items, setItems] = useState<QuoteItem[]>(
    initialQuote?.items?.length
      ? initialQuote.items
      : [
          {
            id: 'item-init-1',
            description: 'Serviço Profissional Especializado',
            unit: 'serviço',
            quantity: 1,
            unitPrice: 1500.00,
            total: 1500.00,
          },
        ]
  );

  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(
    initialQuote?.discountType || 'fixed'
  );
  const [discountValue, setDiscountValue] = useState<number>(initialQuote?.discountValue || 0);
  const [taxOrAddition, setTaxOrAddition] = useState<number>(initialQuote?.taxOrAddition || 0);

  const [issueDate, setIssueDate] = useState(initialQuote?.issueDate || todayStr);
  const [dueDate, setDueDate] = useState(initialQuote?.dueDate || defaultDue);
  const [status, setStatus] = useState<QuoteStatus>(initialQuote?.status || 'rascunho');
  const [theme, setTheme] = useState<PDFTheme>(initialQuote?.theme || 'modern');

  const [paymentMethod, setPaymentMethod] = useState(
    initialQuote?.paymentMethod || company.defaultPaymentTerms || 'PIX ou Boleto'
  );
  const [paymentTerms, setPaymentTerms] = useState(
    initialQuote?.paymentTerms || '50% entrada no aceite e 50% na conclusão'
  );
  const [notes, setNotes] = useState(initialQuote?.notes || company.defaultNotes || '');
  const [includePixQr, setIncludePixQr] = useState<boolean>(
    initialQuote ? initialQuote.includePixQr : true
  );

  const [showQuickClientModal, setShowQuickClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientDoc, setNewClientDoc] = useState('');

  // Handle client select change
  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    const found = clients.find((c) => c.id === clientId);
    if (found) {
      setClientName(found.name);
      setClientPhone(found.phone);
      setClientEmail(found.email || '');
      setClientDocument(found.document || '');
      setClientAddress(found.address || '');
      setClientCity(found.city || '');
    }
  };

  // Quick Client Creation
  const handleCreateQuickClient = () => {
    if (!newClientName.trim()) return;
    const newClient: Client = {
      id: `cli-${Date.now()}`,
      name: newClientName.trim(),
      phone: newClientPhone.trim(),
      email: newClientEmail.trim(),
      document: newClientDoc.trim(),
      createdAt: new Date().toISOString(),
    };
    onQuickAddClient(newClient);
    handleSelectClient(newClient.id);
    setShowQuickClientModal(false);
    setNewClientName('');
    setNewClientPhone('');
    setNewClientEmail('');
    setNewClientDoc('');
  };

  // Line item operations
  const handleAddItem = () => {
    const newItem: QuoteItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      description: '',
      unit: 'un',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof QuoteItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          const qty = Number(field === 'quantity' ? value : updated.quantity) || 0;
          const price = Number(field === 'unitPrice' ? value : updated.unitPrice) || 0;
          updated.total = Math.round(qty * price * 100) / 100;
        }
        return updated;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  // Subtotal & Totals calculations
  const subtotal = items.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
  let discountTotal = 0;
  if (discountType === 'percentage') {
    discountTotal = Math.round((subtotal * (Number(discountValue) || 0) / 100) * 100) / 100;
  } else {
    discountTotal = Number(discountValue) || 0;
  }

  const total = Math.max(0, subtotal - discountTotal + (Number(taxOrAddition) || 0));

  const buildQuoteObject = (): Quote => {
    return {
      id: initialQuote?.id || `orc-${Date.now()}`,
      code: code.trim() || 'ORC-001',
      clientId: selectedClientId,
      clientName: clientName.trim() || 'Cliente Não Informado',
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim(),
      clientDocument: clientDocument.trim(),
      clientAddress: clientAddress.trim(),
      clientCity: clientCity.trim(),
      items,
      subtotal,
      discountType,
      discountValue: Number(discountValue) || 0,
      discountTotal,
      taxOrAddition: Number(taxOrAddition) || 0,
      total,
      status,
      theme,
      issueDate,
      dueDate,
      paymentMethod,
      paymentTerms,
      notes,
      includePixQr,
      createdAt: initialQuote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const handleSubmit = (openPreview: boolean = false) => {
    if (!clientName.trim()) {
      setValidationError('Por favor, informe o nome do cliente antes de salvar o orçamento.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setValidationError(null);
    const q = buildQuoteObject();
    onSave(q, openPreview);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-between gap-3 text-xs text-rose-200 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{validationError}</span>
          </div>
          <button
            type="button"
            onClick={() => setValidationError(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Lista</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSubmit(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow-sm transition"
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Salvar & Ver PDF</span>
          </button>

          <button
            onClick={() => handleSubmit(false)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Orçamento</span>
          </button>
        </div>
      </div>

      {/* Main Form Cards */}
      <div className="space-y-6">
        {/* Card 1: Identificação e Cliente */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 font-bold text-xs">
                1
              </span>
              <h2 className="font-semibold text-slate-100 text-sm">Dados do Orçamento & Cliente</h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Código:</span>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-32 px-2.5 py-1 text-xs font-mono font-bold bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Quick Client Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-4">
            <div className="sm:col-span-8">
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Selecionar Cliente Cadastrado
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedClientId}
                  onChange={(e) => handleSelectClient(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Escolher da lista ou preencher abaixo --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ''}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setShowQuickClientModal(true)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold border border-slate-700 shrink-0"
                  title="Cadastrar novo cliente rapidamente"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Novo</span>
                </button>
              </div>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status do Orçamento
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as QuoteStatus)}
                className="w-full text-xs bg-slate-950 border border-emerald-500/50 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 font-bold"
              >
                <option value="rascunho">⏳ Rascunho</option>
                <option value="enviado">📤 Enviado</option>
                <option value="aprovado">✅ Aprovado</option>
                <option value="concluido">🚀 Concluído</option>
                <option value="recusado">❌ Recusado</option>
              </select>
            </div>
          </div>

          {/* Client Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Nome Completo / Empresa *</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: Carlos Eduardo ou Tech Ltda"
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">WhatsApp / Telefone *</label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="Ex: 11999998888"
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">E-mail</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="cliente@email.com"
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">CPF ou CNPJ</label>
              <input
                type="text"
                value={clientDocument}
                onChange={(e) => setClientDocument(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Data Emissão</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Validade da Proposta</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Itens do Orçamento */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs">
                2
              </span>
              <h2 className="font-semibold text-slate-100 text-sm">Itens e Serviços</h2>
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Item</span>
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="p-3 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-3 transition-colors hover:border-slate-700"
              >
                <div className="w-6 text-center text-xs text-slate-500 font-mono font-bold">
                  {index + 1}
                </div>

                <div className="flex-1 w-full sm:w-auto">
                  <label className="block sm:hidden text-[10px] text-slate-500 mb-1">Descrição</label>
                  <input
                    type="text"
                    required
                    value={item.description}
                    onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                    placeholder="Descrição do serviço ou material fornecido..."
                    className="w-full text-xs bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-3 sm:flex items-center gap-2 w-full sm:w-auto">
                  <div className="w-full sm:w-20">
                    <label className="block sm:hidden text-[10px] text-slate-500 mb-1">Unid</label>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => handleUpdateItem(item.id, 'unit', e.target.value)}
                      placeholder="un"
                      className="w-full text-xs text-center bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="w-full sm:w-20">
                    <label className="block sm:hidden text-[10px] text-slate-500 mb-1">Qtd</label>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value)}
                      className="w-full text-xs text-right font-mono bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="w-full sm:w-28">
                    <label className="block sm:hidden text-[10px] text-slate-500 mb-1">Unitário (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateItem(item.id, 'unitPrice', e.target.value)}
                      className="w-full text-xs text-right font-mono bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="w-full sm:w-28 text-right sm:text-right font-mono font-bold text-xs text-slate-100 flex items-center justify-between sm:justify-end gap-2">
                  <span className="sm:hidden text-slate-500 font-normal">Subtotal:</span>
                  <span>{formatCurrencyBRL(item.total)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={items.length <= 1}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition disabled:opacity-30"
                  title="Remover linha"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Subtotal, Discounts, and Final Total */}
          <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col md:flex-row justify-between gap-6">
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Desconto</label>
                  <div className="flex rounded-lg overflow-hidden border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setDiscountType('fixed')}
                      className={`px-2.5 py-1 text-xs font-semibold transition ${
                        discountType === 'fixed'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      R$
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('percentage')}
                      className={`px-2.5 py-1 text-xs font-semibold transition ${
                        discountType === 'percentage'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      %
                    </button>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      className="w-full text-xs font-mono bg-slate-950 px-2.5 py-1 text-slate-200 focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Acréscimos / Taxas Extras (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={taxOrAddition}
                    onChange={(e) => setTaxOrAddition(Number(e.target.value))}
                    className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="w-full md:w-64 bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal Itens:</span>
                <span className="font-mono">{formatCurrencyBRL(subtotal)}</span>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between text-rose-400">
                  <span>Desconto:</span>
                  <span className="font-mono">-{formatCurrencyBRL(discountTotal)}</span>
                </div>
              )}
              {taxOrAddition > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Acréscimos:</span>
                  <span className="font-mono">+{formatCurrencyBRL(taxOrAddition)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline font-bold">
                <span className="text-slate-200 text-sm">Total Final:</span>
                <span className="text-xl font-mono text-emerald-400 font-black">
                  {formatCurrencyBRL(total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Pagamento, PIX e Estilo do PDF */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-800">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 font-bold text-xs">
              3
            </span>
            <h2 className="font-semibold text-slate-100 text-sm">Condições de Pagamento & Estilo</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Forma de Pagamento</label>
              <input
                type="text"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="Ex: PIX, Boleto, Cartão 12x"
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Termos e Prazos</label>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="Ex: 50% entrada + 50% entrega"
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] text-slate-400 mb-1">
                Observações Específicas / Garantia deste Orçamento
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detalhes adicionais, escopo ou garantia..."
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Pix Checkbox */}
            <div className="sm:col-span-1 flex items-center gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
              <input
                type="checkbox"
                id="includePix"
                checked={includePixQr}
                onChange={(e) => setIncludePixQr(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700 focus:ring-emerald-500"
              />
              <label htmlFor="includePix" className="text-xs text-slate-200 flex items-center gap-1.5 cursor-pointer">
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>Incluir QR Code PIX no documento</span>
              </label>
            </div>

            {/* Template Chooser */}
            <div className="sm:col-span-1">
              <label className="block text-[11px] text-slate-400 mb-1">Modelo Visual do PDF</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as PDFTheme)}
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="modern">Moderno (Minimalista Azul & Índigo)</option>
                <option value="corporate">Executivo (Navy Blue & Dourado)</option>
                <option value="emerald">Emerald (Verde Tecnológico)</option>
                <option value="classic">Clássico (Bordô & Papiro)</option>
                <option value="compact">Cupom / Ordem de Serviço Rápida</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          Descartar
        </button>

        <button
          type="button"
          onClick={() => handleSubmit(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 shadow-sm transition"
        >
          <Eye className="w-4 h-4 text-emerald-400" />
          <span>Salvar & Abrir PDF</span>
        </button>

        <button
          type="button"
          onClick={() => handleSubmit(false)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Orçamento</span>
        </button>
      </div>

      {/* Quick Add Client Modal */}
      {showQuickClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-400" />
              <span>Novo Cliente Rápido</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Nome do cliente"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">WhatsApp / Telefone</label>
                <input
                  type="text"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  placeholder="11999998888"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">E-mail</label>
                <input
                  type="email"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  placeholder="email@cliente.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">CPF / CNPJ</label>
                <input
                  type="text"
                  value={newClientDoc}
                  onChange={(e) => setNewClientDoc(e.target.value)}
                  placeholder="Documento"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setShowQuickClientModal(false)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateQuickClient}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                Adicionar e Selecionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
