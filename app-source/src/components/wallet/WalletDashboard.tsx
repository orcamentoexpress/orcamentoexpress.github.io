import React from 'react';
import { Quote } from '../../types';
import { formatCurrencyBRL, formatDateBR } from '../../services/pdfGenerator';
import {
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BarChart3,
  ArrowUpRight,
  DollarSign,
  PieChart,
  Calendar,
  FileCheck2,
  CheckCheck,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  X
} from 'lucide-react';
import { exportCompletedQuotesCSV } from '../../services/storage';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

interface WalletDashboardProps {
  quotes: Quote[];
  onOpenCreate: () => void;
  onViewQuote: (quote: Quote) => void;
  onFilterByStatus: (status: any) => void;
}

export const WalletDashboard: React.FC<WalletDashboardProps> = ({
  quotes,
  onOpenCreate,
  onViewQuote,
  onFilterByStatus,
}) => {
  const [csvMessage, setCsvMessage] = React.useState<{ text: string; type: 'success' | 'warning' } | null>(null);

  // Calculations
  const completedQuotes = quotes.filter((q) => q.status === 'concluido');
  const approvedQuotes = quotes.filter((q) => q.status === 'aprovado' || q.status === 'concluido');
  const pendingQuotes = quotes.filter((q) => q.status === 'enviado' || q.status === 'rascunho');

  const totalCompleted = completedQuotes.reduce((acc, q) => acc + (q.total || 0), 0);
  const totalEarned = approvedQuotes.reduce((acc, q) => acc + (q.total || 0), 0);
  const totalPending = pendingQuotes.reduce((acc, q) => acc + (q.total || 0), 0);

  const conversionRate = quotes.length > 0
    ? Math.round((approvedQuotes.length / quotes.length) * 100)
    : 0;

  const averageTicket = approvedQuotes.length > 0
    ? totalEarned / approvedQuotes.length
    : 0;

  // Monthly revenue breakdown specifically for status 'concluido' (last 6 months)
  const monthlyStatsMap: { [key: string]: { month: string; total: number; count: number } } = {};
  
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthName = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    monthlyStatsMap[key] = {
      month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      total: 0,
      count: 0,
    };
  }

  // Populate data strictly based on quotes with status 'concluido'
  quotes.forEach((q) => {
    if (q.status === 'concluido') {
      const monthKey = (q.issueDate || '').slice(0, 7);
      if (monthlyStatsMap[monthKey]) {
        monthlyStatsMap[monthKey].total += q.total || 0;
        monthlyStatsMap[monthKey].count += 1;
      }
    }
  });

  const chartData = Object.values(monthlyStatsMap);

  // Custom Dark Mode Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-2xl text-xs backdrop-blur-md">
          <p className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{label}</span>
          </p>
          <p className="text-emerald-400 font-black font-mono text-sm">
            {formatCurrencyBRL(payload[0].value)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {dataPoint.count} {dataPoint.count === 1 ? 'orçamento concluído' : 'orçamentos concluídos'}
          </p>
        </div>
      );
    }
    return null;
  };

  const handleExportCSV = () => {
    const success = exportCompletedQuotesCSV(quotes);
    if (!success) {
      setCsvMessage({
        text: 'Nenhum orçamento com status "Concluído" encontrado. Altere o status de seus orçamentos aprovados para "Concluído" para gerar o relatório financeiro CSV.',
        type: 'warning',
      });
    } else {
      setCsvMessage({
        text: 'Relatório financeiro CSV exportado com sucesso!',
        type: 'success',
      });
    }
    setTimeout(() => {
      setCsvMessage(null);
    }, 5000);
  };

  return (
    <div className="space-y-6 pb-20 relative">
      {/* CSV Status In-app Notification */}
      {csvMessage && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs animate-in fade-in duration-150 ${
            csvMessage.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
              : 'bg-amber-950/70 border-amber-500/50 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{csvMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setCsvMessage(null)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-5 h-5" />
            </span>
            <span>Carteira Financeira & Ganhos</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Visão consolidada de valores aprovados, propostas em negociação e taxa de conversão.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 text-xs font-bold transition shadow-sm"
            title="Exportar planilha CSV dos orçamentos com status Concluído"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={onOpenCreate}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition shrink-0"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Criar Orçamento</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Faturado Realizado (Concluídos & Aprovados) */}
        <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Total Faturado / Aceito
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
              {formatCurrencyBRL(totalEarned)}
            </span>
            <p className="text-xs text-emerald-300/80 mt-1 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{approvedQuotes.length} orçamentos aprovados/concluídos</span>
            </p>
          </div>
        </div>

        {/* Card 2: Em Negociação */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
              Em Negociação
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-100 tracking-tight">
              {formatCurrencyBRL(totalPending)}
            </span>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span>{pendingQuotes.length} propostas aguardando retorno</span>
            </p>
          </div>
        </div>

        {/* Card 3: Taxa de Conversão */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
              Taxa de Conversão
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black font-mono text-purple-400 tracking-tight">
              {conversionRate}%
            </span>
            <p className="text-xs text-slate-400 mt-1">
              De {quotes.length} propostas totais geradas
            </p>
          </div>
        </div>

        {/* Card 4: Ticket Médio */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Ticket Médio
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-100 tracking-tight">
              {formatCurrencyBRL(averageTicket)}
            </span>
            <p className="text-xs text-slate-400 mt-1">
              Média por proposta aceita
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Chart (Recharts) & Pipeline Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Monthly Revenue Chart via Recharts */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-slate-100 text-sm">
                  Ganhos Mensais (Status 'Concluído')
                </h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-slate-400 font-medium">Total Concluído:</span>
                <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                  {formatCurrencyBRL(totalCompleted)}
                </span>
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold transition"
                  title="Baixar planilha CSV detalhada"
                >
                  <Download className="w-3 h-3" />
                  <span>Baixar CSV</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mb-4">
              Gráfico interativo gerado via Recharts calculando exclusivamente os valores recebidos de orçamentos com status <strong>Concluído</strong>.
            </p>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="completedBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                    <stop offset="100%" stopColor="#047857" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  opacity={0.3}
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(val) =>
                    val >= 1000 ? `R$${(val / 1000).toFixed(0)}k` : `R$${val}`
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="total"
                  fill="url(#completedBarGradient)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={52}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.total > 0 ? 'url(#completedBarGradient)' : '#1e293b'}
                      cursor="pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Breakdown */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-100 text-sm mb-4 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-blue-400" />
              <span>Distribuição por Status</span>
            </h3>

            <div className="space-y-3 text-xs">
              {[
                { status: 'concluido', label: 'Concluídos', color: 'bg-purple-500', count: quotes.filter((q) => q.status === 'concluido').length },
                { status: 'aprovado', label: 'Aprovados', color: 'bg-emerald-500', count: quotes.filter((q) => q.status === 'aprovado').length },
                { status: 'enviado', label: 'Enviados', color: 'bg-blue-500', count: quotes.filter((q) => q.status === 'enviado').length },
                { status: 'rascunho', label: 'Rascunhos', color: 'bg-slate-600', count: quotes.filter((q) => q.status === 'rascunho').length },
                { status: 'recusado', label: 'Recusados', color: 'bg-rose-500', count: quotes.filter((q) => q.status === 'recusado').length },
              ].map((item) => (
                <div
                  key={item.status}
                  onClick={() => onFilterByStatus(item.status)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 cursor-pointer transition border border-transparent hover:border-slate-700"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-slate-300 font-medium">{item.label}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-300">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4 text-[11px] text-slate-500">
            Dica: Clique em qualquer status para filtrar a lista de orçamentos.
          </div>
        </div>
      </div>

      {/* Recent Approved / Completed Deals */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h3 className="font-bold text-slate-100 text-sm mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Últimos Orçamentos Concluídos e Aprovados</span>
        </h3>

        {approvedQuotes.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            Nenhum orçamento aprovado ou concluído ainda. Crie e envie orçamentos para seus clientes!
          </p>
        ) : (
          <div className="divide-y divide-slate-800">
            {approvedQuotes.slice(0, 5).map((q) => (
              <div
                key={q.id}
                onClick={() => onViewQuote(q)}
                className="py-3 flex items-center justify-between hover:bg-slate-800/40 px-2 rounded-xl cursor-pointer transition text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-200">{q.code}</span>
                    <span className="font-medium text-slate-100">• {q.clientName}</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Emissão: {formatDateBR(q.issueDate)} • {q.items.length} itens
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-400 text-sm block">
                    {formatCurrencyBRL(q.total)}
                  </span>
                  <span className={`text-[10px] font-semibold ${
                    q.status === 'concluido' ? 'text-purple-400' : 'text-emerald-400'
                  }`}>
                    {q.status === 'concluido' ? '🚀 Concluído' : '✅ Aprovado'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
