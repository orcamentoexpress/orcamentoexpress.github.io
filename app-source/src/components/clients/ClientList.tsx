import React, { useState } from 'react';
import { Client, Quote } from '../../types';
import { formatCurrencyBRL, formatPhoneBR, formatDateBR } from '../../services/pdfGenerator';
import { ClientModal } from './ClientModal';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  FileText,
  DollarSign,
  TrendingUp,
  MessageCircle,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MapPin,
  AlertTriangle,
  X
} from 'lucide-react';

interface ClientListProps {
  clients: Client[];
  quotes: Quote[];
  onSaveClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onNewQuoteForClient: (client: Client) => void;
  onViewQuote: (quote: Quote) => void;
}

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  quotes,
  onSaveClient,
  onDeleteClient,
  onNewQuoteForClient,
  onViewQuote,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const filteredClients = clients.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      (c.phone && c.phone.includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.document && c.document.includes(term))
    );
  });

  const handleOpenNew = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const getClientStats = (client: Client) => {
    const clientQuotes = quotes.filter(
      (q) => q.clientId === client.id || q.clientName.toLowerCase() === client.name.toLowerCase()
    );
    const approvedQuotes = clientQuotes.filter(
      (q) => q.status === 'aprovado' || q.status === 'concluido'
    );
    const totalApproved = approvedQuotes.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const totalAll = clientQuotes.reduce((acc, curr) => acc + (curr.total || 0), 0);

    return {
      quotesCount: clientQuotes.length,
      approvedCount: approvedQuotes.length,
      totalApproved,
      totalAll,
      quotes: clientQuotes,
    };
  };

  const handleOpenWhatsApp = (phone: string, name: string) => {
    const clean = phone.replace(/\D/g, '');
    let full = clean;
    if (full.length === 10 || full.length === 11) full = `55${full}`;
    const msg = encodeURIComponent(`Olá ${name}, tudo bem?`);
    window.open(`https://wa.me/${full}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Gestão de Clientes</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              {clients.length}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize o histórico de pedidos, total investido e orçamentos vinculados.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome, telefone, email ou documento..."
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-2xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">Nenhum cliente cadastrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Cadastre seus clientes para agilizar a criação de orçamentos e acompanhar o volume de pedidos.
          </p>
          <button
            onClick={handleOpenNew}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Cliente</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredClients.map((client) => {
            const stats = getClientStats(client);
            const isExpanded = expandedClientId === client.id;

            return (
              <div
                key={client.id}
                className="bg-slate-900 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Client info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 text-blue-400 font-bold text-sm flex items-center justify-center border border-blue-500/20 shrink-0">
                        {client.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                          {client.name}
                        </h3>
                        {client.document && (
                          <p className="text-[11px] text-slate-500 font-mono">
                            Doc: {client.document}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap pt-1">
                      {client.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          {formatPhoneBR(client.phone)}
                        </span>
                      )}
                      {client.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-500" />
                          {client.email}
                        </span>
                      )}
                      {(client.address || client.city) && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <MapPin className="w-3 h-3" />
                          {client.city || client.address}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle: Stats */}
                  <div className="flex items-center gap-3 sm:gap-6 bg-slate-950/60 p-2.5 sm:px-4 sm:py-2 rounded-xl border border-slate-800/80">
                    <div className="text-center sm:text-left">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Pedidos
                      </span>
                      <span className="text-sm font-bold font-mono text-slate-200">
                        {stats.quotesCount}
                      </span>
                    </div>

                    <div className="w-px h-7 bg-slate-800" />

                    <div className="text-center sm:text-left">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Faturado
                      </span>
                      <span className="text-sm font-black font-mono text-emerald-400">
                        {formatCurrencyBRL(stats.totalApproved)}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center justify-end gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    {/* Create Quote for this client */}
                    <button
                      onClick={() => onNewQuoteForClient(client)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
                      title="Criar novo orçamento para este cliente"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Novo Orç.</span>
                    </button>

                    {/* WhatsApp */}
                    {client.phone && (
                      <button
                        onClick={() => handleOpenWhatsApp(client.phone, client.name)}
                        className="p-1.5 rounded-xl text-emerald-400 hover:text-white hover:bg-emerald-600/20 transition"
                        title="Conversar no WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}

                    {/* Edit */}
                    <button
                      onClick={() => handleEdit(client)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Editar dados"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => setClientToDelete(client)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Excluir cliente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Toggle History Dropdown */}
                    {stats.quotesCount > 0 && (
                      <button
                        onClick={() => setExpandedClientId(isExpanded ? null : client.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition ml-1"
                        title="Ver histórico de orçamentos"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Quote History */}
                {isExpanded && stats.quotes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Histórico de Orçamentos ({stats.quotes.length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {stats.quotes.map((q) => (
                        <div
                          key={q.id}
                          onClick={() => onViewQuote(q)}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer transition text-xs"
                        >
                          <div>
                            <span className="font-mono font-bold text-slate-200">{q.code}</span>
                            <span className="text-slate-500 text-[11px] ml-2">
                              {formatDateBR(q.issueDate)}
                            </span>
                            <div className="text-[11px] capitalize text-slate-400">
                              Status: <strong className="text-slate-300">{q.status}</strong>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-emerald-400 block">
                              {formatCurrencyBRL(q.total)}
                            </span>
                            <span className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5 justify-end mt-0.5">
                              Abrir <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Client Modal */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveClient}
        editingClient={editingClient}
      />

      {/* In-app Deletion Modal */}
      {clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-slate-900 border-2 border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Excluir Cliente?</h3>
                  <p className="text-xs text-rose-400 font-semibold">{clientToDelete.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setClientToDelete(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Tem certeza que deseja excluir o cliente <strong>{clientToDelete.name}</strong>? Seus orçamentos já cadastrados não serão apagados, mas o cliente será desvinculado.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setClientToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteClient(clientToDelete.id);
                  setClientToDelete(null);
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
