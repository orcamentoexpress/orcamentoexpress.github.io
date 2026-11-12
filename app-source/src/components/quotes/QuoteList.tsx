import React, { useState } from 'react';
import { Quote, QuoteStatus } from '../../types';
import { formatCurrencyBRL, formatDateBR, formatPhoneBR } from '../../services/pdfGenerator';
import confetti from 'canvas-confetti';
import {
  Search,
  Plus,
  Eye,
  MessageCircle,
  Copy,
  Edit,
  Trash2,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  XCircle,
  FileText,
  ChevronDown,
  AlertTriangle,
  X
} from 'lucide-react';

interface QuoteListProps {
  quotes: Quote[];
  onOpenCreate: () => void;
  onEdit: (quote: Quote) => void;
  onPreview: (quote: Quote) => void;
  onDuplicate: (quote: Quote) => void;
  onDelete: (quoteId: string) => void;
  onUpdateStatus: (quoteId: string, newStatus: QuoteStatus) => void;
}

export const QuoteList: React.FC<QuoteListProps> = ({
  quotes,
  onOpenCreate,
  onEdit,
  onPreview,
  onDuplicate,
  onDelete,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | QuoteStatus>('all');
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);

  const filteredQuotes = quotes.filter((q) => {
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      q.code.toLowerCase().includes(term) ||
      q.clientName.toLowerCase().includes(term) ||
      q.clientPhone.includes(term) ||
      q.items.some((i) => i.description.toLowerCase().includes(term));
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = (quoteId: string, currentStatus: QuoteStatus, newStatus: QuoteStatus) => {
    if (newStatus === 'aprovado' && currentStatus !== 'aprovado') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#f59e0b', '#3b82f6'],
      });
    }
    onUpdateStatus(quoteId, newStatus);
  };

  const statusCounts = {
    all: quotes.length,
    rascunho: quotes.filter((q) => q.status === 'rascunho').length,
    enviado: quotes.filter((q) => q.status === 'enviado').length,
    aprovado: quotes.filter((q) => q.status === 'aprovado').length,
    concluido: quotes.filter((q) => q.status === 'concluido').length,
    recusado: quotes.filter((q) => q.status === 'recusado').length,
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Orçamentos & Propostas</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              {quotes.length}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Gerencie, mude o status para aprovado/concluído e envie direto ao WhatsApp.
          </p>
        </div>

        <button
          onClick={onOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Orçamento</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'Todos', count: statusCounts.all },
            { id: 'aprovado', label: 'Aprovados', count: statusCounts.aprovado },
            { id: 'concluido', label: 'Concluídos', count: statusCounts.concluido },
            { id: 'enviado', label: 'Enviados', count: statusCounts.enviado },
            { id: 'rascunho', label: 'Rascunhos', count: statusCounts.rascunho },
            { id: 'recusado', label: 'Recusados', count: statusCounts.recusado },
          ].map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                  active
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, código ou item..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Quote Cards List */}
      {filteredQuotes.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">Nenhum orçamento encontrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'all'
              ? 'Tente ajustar sua busca ou filtro de status.'
              : 'Crie seu primeiro orçamento profissional agora e gere o PDF em instantes.'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={onOpenCreate}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Orçamento</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredQuotes.map((quote) => (
            <div
              key={quote.id}
              className="bg-slate-900 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 transition-all shadow-sm group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Left: Code, Interactive Status Selector & Dates */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono font-black text-sm text-white">
                      {quote.code}
                    </span>

                    {/* Direct Interactive Status Selector */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        Status:
                      </span>
                      <select
                        value={quote.status}
                        onChange={(e) =>
                          handleStatusChange(quote.id, quote.status, e.target.value as QuoteStatus)
                        }
                        className={`text-xs font-bold rounded-xl px-2.5 py-1 border focus:outline-none transition-all cursor-pointer shadow-sm ${
                          quote.status === 'aprovado'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                            : quote.status === 'concluido'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30'
                            : quote.status === 'enviado'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30'
                            : quote.status === 'recusado'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                        title="Clique para alterar o status do orçamento"
                      >
                        <option value="rascunho" className="bg-slate-900 text-slate-300">
                          ⏳ Rascunho
                        </option>
                        <option value="enviado" className="bg-slate-900 text-blue-300">
                          📤 Enviado
                        </option>
                        <option value="aprovado" className="bg-slate-900 text-emerald-300">
                          ✅ Aprovado
                        </option>
                        <option value="concluido" className="bg-slate-900 text-purple-300">
                          🚀 Concluído
                        </option>
                        <option value="recusado" className="bg-slate-900 text-rose-300">
                          ❌ Recusado
                        </option>
                      </select>
                    </div>

                    <span className="text-[11px] text-slate-500 font-medium">
                      Estilo: <strong className="text-slate-400 capitalize">{quote.theme || 'modern'}</strong>
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>{quote.clientName}</span>
                    {quote.clientPhone && (
                      <span className="text-xs text-slate-500 font-normal">
                        • {formatPhoneBR(quote.clientPhone)}
                      </span>
                    )}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                    <span>{quote.items.length} {quote.items.length === 1 ? 'item' : 'itens'}</span>
                    <span>•</span>
                    <span>Emissão: {formatDateBR(quote.issueDate)}</span>
                    <span>•</span>
                    <span className="text-slate-400">
                      Validade: <strong className="text-slate-300">{formatDateBR(quote.dueDate)}</strong>
                    </span>
                  </div>

                  {/* Quick Shortcut Buttons for frequent actions */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    {quote.status !== 'aprovado' && quote.status !== 'concluido' && (
                      <button
                        onClick={() => handleStatusChange(quote.id, quote.status, 'aprovado')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/40 text-[11px] font-semibold transition"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Aprovar Agora</span>
                      </button>
                    )}

                    {quote.status === 'aprovado' && (
                      <button
                        onClick={() => handleStatusChange(quote.id, quote.status, 'concluido')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/40 text-[11px] font-semibold transition"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Marcar Concluído</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Right: Value & Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800/80 gap-2">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Total</span>
                    <span className="text-base sm:text-lg font-black font-mono text-emerald-400">
                      {formatCurrencyBRL(quote.total)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* View PDF */}
                    <button
                      onClick={() => onPreview(quote)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                      title="Visualizar e Baixar PDF"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Ver PDF</span>
                    </button>

                    {/* Quick WhatsApp Send */}
                    <button
                      onClick={() => onPreview(quote)}
                      className="p-1.5 rounded-xl text-emerald-400 hover:text-white hover:bg-emerald-600/20 transition"
                      title="Enviar via WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => onEdit(quote)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Editar dados do orçamento"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Duplicate */}
                    <button
                      onClick={() => onDuplicate(quote)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Duplicar Orçamento"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => setQuoteToDelete(quote)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* In-app Deletion Modal */}
      {quoteToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-slate-900 border-2 border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Excluir Orçamento?</h3>
                  <p className="text-xs text-rose-400 font-semibold">{quoteToDelete.code} · {quoteToDelete.clientName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuoteToDelete(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Tem certeza que deseja excluir o orçamento <strong>{quoteToDelete.code}</strong> no valor de <strong>{formatCurrencyBRL(quoteToDelete.total)}</strong>? Esta ação não pode ser desfeita.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setQuoteToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(quoteToDelete.id);
                  setQuoteToDelete(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition active:scale-95 cursor-pointer shadow-md"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Excluir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
