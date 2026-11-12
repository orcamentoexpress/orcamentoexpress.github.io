import React, { useState } from 'react';
import { AppData, CompanyProfile } from '../../types';
import {
  exportBackupJSON,
  importBackupJSON,
  syncWithGoogleAppsScript,
  GOOGLE_APPS_SCRIPT_TEMPLATE,
  saveAppData,
  exportCompletedQuotesCSV,
  getCleanAppData,
  getDemoAppData
} from '../../services/storage';
import {
  Building2,
  Cloud,
  Download,
  Upload,
  FileSpreadsheet,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Save,
  QrCode,
  Image as ImageIcon,
  MessageSquare,
  HelpCircle,
  Database,
  Smartphone,
  Laptop,
  Heart,
  Eye,
  EyeOff,
  Trash2,
  Sparkles,
  Share2,
  AlertTriangle,
  X,
  FolderArchive,
  Rocket,
  Bug,
  Zap,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface SettingsViewProps {
  appData: AppData;
  onUpdateCompany: (company: CompanyProfile) => void;
  onDataRestored: (newData: AppData) => void;
  defaultSection?: 'empresa' | 'nuvem' | 'apoio' | 'backup';
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  appData,
  onUpdateCompany,
  onDataRestored,
  defaultSection = 'empresa',
}) => {
  const [activeTab, setActiveTab] = useState<'empresa' | 'nuvem' | 'apoio' | 'backup'>(defaultSection);
  const [company, setCompany] = useState<CompanyProfile>(appData.company);
  const [scriptUrl, setScriptUrl] = useState<string>(appData.cloudSync?.scriptUrl || '');
  const [autoSync, setAutoSync] = useState<boolean>(appData.cloudSync?.autoSync || false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Apoio ao projeto
  const [showSupportPix, setShowSupportPix] = useState(false);
  const [copiedSupportPix, setCopiedSupportPix] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  // In-app Modals and Toast states (replaces blocked native confirm/alert in iframe)
  const [showClearModal, setShowClearModal] = useState<boolean>(false);
  const [showDemoModal, setShowDemoModal] = useState<boolean>(false);
  const [restoreCandidate, setRestoreCandidate] = useState<AppData | null>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  const SUPPORT_LINK = 'https://link.mercadopago.com.br/saulomgg';

  const handleCompanyChange = (field: keyof CompanyProfile, value: string) => {
    setCompany((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Por favor, selecione uma imagem de até 2MB.', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        const base64 = evt.target?.result as string;
        handleCompanyChange('logoUrl', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCompany(company);
    setSavedSuccess(true);
    showToast('Dados da empresa salvos com sucesso!', 'success');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCopyScriptCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleCopySupportPix = () => {
    window.open(SUPPORT_LINK, '_blank', 'noopener,noreferrer');
  };

  const handleShareApp = async () => {
    const shareData = {
      title: 'Orçamento Express - Gerador de Orçamentos PWA',
      text: 'Conheça o Orçamento Express: crie propostas em PDF personalizadas, envie via WhatsApp e controle seus ganhos 100% offline!',
      url: window.location.origin,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // Ignored if cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.origin);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 3000);
    }
  };

  const handleTriggerSync = async () => {
    if (!scriptUrl.trim()) {
      setSyncStatus({ success: false, message: 'Insira a URL do seu Google Apps Script primeiro.' });
      return;
    }
    setIsSyncing(true);
    setSyncStatus(null);

    const result = await syncWithGoogleAppsScript(scriptUrl.trim(), appData);
    setIsSyncing(false);

    if (result.success && result.data) {
      setSyncStatus({ success: true, message: result.message });
      const updated: AppData = {
        ...result.data,
        cloudSync: {
          scriptUrl: scriptUrl.trim(),
          autoSync,
          lastSyncedAt: new Date().toISOString(),
        },
      };
      onDataRestored(updated);
      showToast('Sincronização em nuvem concluída com sucesso!', 'success');
    } else {
      setSyncStatus({ success: false, message: result.message });
    }
  };

  const handleExportBackup = () => {
    exportBackupJSON(appData);
    showToast('Backup baixado com sucesso! Arquivo salvo em Downloads.', 'success');
  };

  const handleDownloadZip = () => {
    window.open('https://github.com/saulomgg/orcamento-express', '_blank', 'noopener,noreferrer');
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await importBackupJSON(file);
      if (!parsed || !parsed.quotes || !parsed.company) {
        showToast('Arquivo de backup inválido ou com formato incompatível.', 'error');
        return;
      }
      setRestoreCandidate(parsed);
    } catch {
      showToast('Erro ao ler arquivo de backup.', 'error');
    } finally {
      e.target.value = '';
    }
  };

  const executeRestoreBackup = () => {
    if (!restoreCandidate) return;
    onDataRestored(restoreCandidate);
    setCompany(restoreCandidate.company);
    const countQuotes = restoreCandidate.quotes?.length || 0;
    const countClients = restoreCandidate.clients?.length || 0;
    setRestoreCandidate(null);
    showToast(`Backup restaurado com sucesso! (${countQuotes} orçamentos, ${countClients} clientes)`, 'success');
  };

  // Clear / Zero data execution
  const executeClearData = () => {
    const cleanData = getCleanAppData();
    onDataRestored(cleanData);
    setCompany(cleanData.company);
    setShowClearModal(false);
    showToast('Aplicativo zerado com sucesso! Comece preenchendo os dados da sua empresa.', 'success');
  };

  // Load demo / sample data execution
  const executeLoadDemoData = () => {
    const demoData = getDemoAppData();
    onDataRestored(demoData);
    setCompany(demoData.company);
    setShowDemoModal(false);
    showToast('Dados de demonstração carregados com sucesso! Confira a Carteira e a lista de Orçamentos.', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 text-xs">
      {/* Title & Feedback */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Configurações
          </h1>
          <p className="text-slate-400 mt-0.5">
            Personalize sua empresa, sincronização em nuvem, apoio ao projeto e backups.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
            <Check className="w-4 h-4" />
            <span>Alterações salvas!</span>
          </div>
        )}
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('empresa')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition shrink-0 ${
            activeTab === 'empresa'
              ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Sua Empresa</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('nuvem')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition shrink-0 ${
            activeTab === 'nuvem'
              ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>Nuvem & Sync</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('apoio')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition shrink-0 ${
            activeTab === 'apoio'
              ? 'bg-pink-950/60 text-pink-300 border border-pink-500/40 shadow-sm'
              : 'text-pink-400/80 hover:text-pink-300'
          }`}
        >
          <Heart className="w-4 h-4 text-pink-400 fill-pink-400/30" />
          <span>Apoio ao Projeto</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition shrink-0 ${
            activeTab === 'backup'
              ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Dados & Backup</span>
        </button>
      </div>

      {/* Section 1: Dados da Empresa & Logo */}
      {(activeTab === 'empresa' || activeTab === undefined) && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-800">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 font-bold">
              <Building2 className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-bold text-slate-100 text-sm">Dados da Sua Empresa (Emissor)</h2>
              <p className="text-[11px] text-slate-400">
                Informações que serão impressas no cabeçalho e rodapé dos seus orçamentos em PDF.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveCompany} className="space-y-4">
            {/* Logo Upload */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt="Logo"
                  className="w-16 h-16 object-contain rounded-xl bg-white p-1 border border-slate-700 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-slate-800 border border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 shrink-0">
                  <ImageIcon className="w-6 h-6 mb-0.5" />
                  <span className="text-[9px]">Sem logo</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-200">
                  Logotipo da Empresa
                </label>
                <p className="text-[11px] text-slate-400">
                  Aparecerá com alta nitidez no cabeçalho dos seus orçamentos em PDF gerados.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Escolher Imagem</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>

                  {company.logoUrl && (
                    <button
                      type="button"
                      onClick={() => handleCompanyChange('logoUrl', '')}
                      className="text-[11px] text-rose-400 hover:underline px-2"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Razão Social / Nome Oficial *</label>
                <input
                  type="text"
                  required
                  value={company.name}
                  onChange={(e) => handleCompanyChange('name', e.target.value)}
                  placeholder="Ex: saulomgg dev lab"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Nome Fantasia (Exibição no PDF)</label>
                <input
                  type="text"
                  value={company.tradingName || ''}
                  onChange={(e) => handleCompanyChange('tradingName', e.target.value)}
                  placeholder="Ex: Studio Lab"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">CNPJ ou CPF *</label>
                <input
                  type="text"
                  value={company.document}
                  onChange={(e) => handleCompanyChange('document', e.target.value)}
                  placeholder="00.000.000/0001-00"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Telefone / WhatsApp Comercial *</label>
                <input
                  type="text"
                  value={company.phone}
                  onChange={(e) => handleCompanyChange('phone', e.target.value)}
                  placeholder="11999998888"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">E-mail Comercial / Site</label>
                <input
                  type="text"
                  value={company.email}
                  onChange={(e) => handleCompanyChange('email', e.target.value)}
                  placeholder="saulomgg.github.io"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Endereço & Cidade / Local</label>
                <input
                  type="text"
                  value={company.address}
                  onChange={(e) => handleCompanyChange('address', e.target.value)}
                  placeholder="saulomgg.github.io"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* PIX Configuration for Quote Client Payments */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/50 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <QrCode className="w-4 h-4" />
                <span>Sua Chave PIX Comercial (Para Seus Clientes Pagarem o Orçamento)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Tipo de Chave</label>
                  <select
                    value={company.pixKeyType || 'email'}
                    onChange={(e) => handleCompanyChange('pixKeyType', e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="email">E-mail</option>
                    <option value="cpf">CPF</option>
                    <option value="cnpj">CNPJ</option>
                    <option value="telefone">Telefone</option>
                    <option value="aleatoria">Chave Aleatória (EVP)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Chave PIX da Sua Empresa</label>
                  <input
                    type="text"
                    value={company.pixKey || ''}
                    onChange={(e) => handleCompanyChange('pixKey', e.target.value)}
                    placeholder="sua-chave@pix.com ou 11999999999"
                    className="w-full font-mono bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Default Terms & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Texto Padrão de Garantia</label>
                <textarea
                  rows={2}
                  value={company.defaultWarranty}
                  onChange={(e) => handleCompanyChange('defaultWarranty', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Termos Padrão de Pagamento</label>
                <textarea
                  rows={2}
                  value={company.defaultPaymentTerms}
                  onChange={(e) => handleCompanyChange('defaultPaymentTerms', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">
                  Modelo da Mensagem do WhatsApp (Tags: &#123;cliente&#125;, &#123;numero&#125;, &#123;total&#125;, &#123;validade&#125;, &#123;empresa&#125;)
                </label>
                <textarea
                  rows={3}
                  value={company.whatsappMessageTemplate}
                  onChange={(e) => handleCompanyChange('whatsappMessageTemplate', e.target.value)}
                  className="w-full font-mono text-[11px] bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md transition active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Dados da Empresa</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Section 2: Google Apps Script Cloud Sync (Multi-Device) */}
      {activeTab === 'nuvem' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold">
                <Cloud className="w-4 h-4" />
              </span>
              <div>
                <h2 className="font-bold text-slate-100 text-sm">
                  Sincronização em Nuvem (Google Sheets)
                </h2>
                <p className="text-[11px] text-slate-400">
                  Sincronize seus orçamentos e clientes entre Celular e PC sem mensalidades.
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-slate-400 text-[11px]">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>↔</span>
              <Laptop className="w-4 h-4 text-blue-400" />
            </div>
          </div>

          <div className="space-y-4">
            {/* Input for script URL */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                URL do seu Web App no Google Apps Script:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={scriptUrl}
                  onChange={(e) => setScriptUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  className="w-full font-mono text-[11px] bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleTriggerSync}
                  disabled={isSyncing}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shrink-0 transition disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
                </button>
              </div>

              {appData.cloudSync?.lastSyncedAt && (
                <p className="text-[11px] text-slate-500 mt-1">
                  Última sincronização com a nuvem:{' '}
                  {new Date(appData.cloudSync.lastSyncedAt).toLocaleString('pt-BR')}
                </p>
              )}

              {syncStatus && (
                <div
                  className={`mt-2 p-2.5 rounded-xl border text-[11px] ${
                    syncStatus.success
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
                      : 'bg-rose-950/40 text-rose-300 border-rose-800'
                  }`}
                >
                  {syncStatus.message}
                </div>
              )}
            </div>

            {/* Tutorial & Script Code Accordion */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-200 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                  <span>Tutorial: Como configurar o banco em nuvem (2 minutos)</span>
                </h3>
                <button
                  type="button"
                  onClick={handleCopyScriptCode}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 transition cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Código Copiado!' : 'Copiar Código'}</span>
                </button>
              </div>

              <ol className="space-y-2 text-[11px] text-slate-300 list-decimal list-inside leading-relaxed">
                <li>
                  Abra o <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-semibold">Google Sheets (clique aqui)</a> e crie uma planilha em branco.
                </li>
                <li>
                  No menu superior da planilha, clique em <strong>Extensões</strong> &gt; <strong>Apps Script</strong>.
                </li>
                <li>
                  Apague qualquer código que estiver lá e cole o código fornecido (botão <em>Copiar Código</em> acima).
                </li>
                <li>
                  Clique no botão azul superior <strong>Implantar</strong> &gt; <strong>Nova Implantação</strong>.
                </li>
                <li>
                  Clique no ícone de engrenagem ao lado de "Selecionar tipo" e escolha <strong>App da Web</strong>.
                </li>
                <li>
                  Em <em>"Quem tem acesso"</em>, selecione <strong>Qualquer pessoa</strong> (necessário para o seu celular/PC enviar e receber dados).
                </li>
                <li>
                  Clique em <strong>Implantar</strong>, autorize as permissões se solicitado e copie a URL do Web App gerada.
                </li>
                <li>
                  Cole a URL no campo acima e clique em <strong>Sincronizar Agora</strong>!
                </li>
              </ol>

              {/* Script Code snippet preview */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>Código para o Apps Script:</span>
                </div>
                <pre className="max-h-36 overflow-y-auto p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-300">
                  {GOOGLE_APPS_SCRIPT_TEMPLATE}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Apoie a Evolução do Orçamento Express (Placed before backup) */}
      {(activeTab === 'apoio' || activeTab === undefined) && (
        <div id="apoio-section" className="bg-gradient-to-br from-slate-900 via-pink-950/20 to-slate-900 border border-pink-500/30 rounded-2xl p-5 sm:p-7 shadow-lg space-y-5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-pink-500/10 text-pink-400 border border-pink-500/20 shadow-sm">
                <Heart className="w-5 h-5 fill-pink-400/40" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-white text-base tracking-tight">
                    Apoie a Evolução do Orçamento Express
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30 uppercase">
                    Voluntário
                  </span>
                </div>
                <p className="text-xs text-pink-200/80 font-medium">
                  Apoie o WebApp & Criação de Novos Apps Gratuitos
                </p>
              </div>
            </div>
          </div>

          {/* Supportive Text Message */}
          <div className="space-y-3 text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <p className="text-slate-200 font-semibold flex items-start gap-2">
              <span className="text-sm">💼</span>
              <span>
                <strong>Fechou um orçamento?</strong> Se o Orçamento Express fez diferença na sua rotina profissional e te ajudou a conquistar clientes, considere apoiar o projeto quando puder!
              </span>
            </p>
            <p>
              O <strong>Orçamento Express</strong> é um projeto independente e gratuito, feito para oferecer ferramentas profissionais e práticas a freelancers, prestadores de serviços, técnicos, autônomos e pequenas empresas — sem mensalidades para usar todos os recursos.
            </p>
            <p className="text-slate-400">
              Apoios voluntários ajudam a dedicar tempo ao desenvolvimento, corrigir problemas, trazer novas melhorias contínuas e criar novos aplicativos gratuitos. Você também pode contribuir enviando seu feedback ou compartilhando o projeto com amigos!
            </p>
          </div>

          {/* PIX Key Card with Hidden Visibility by default */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-pink-500/30 space-y-3 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Link de apoio oficial
              </span>

              {/* Visibility Toggle Button */}
              <button
                type="button"
                onClick={() => setShowSupportPix(!showSupportPix)}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition cursor-pointer"
                title={showSupportPix ? 'Ocultar link' : 'Visualizar link'}
              >
                {showSupportPix ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-pink-400" />
                    <span>Ocultar link</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ver link de apoio</span>
                  </>
                )}
              </button>
            </div>

            {/* Key Field Display (Hidden / Masked by default unless clicked) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                {showSupportPix ? (
                  <span className="font-mono font-bold text-sm text-emerald-400 select-all">
                    link.mercadopago.com.br/saulomgg
                  </span>
                ) : (
                  <span className="font-mono text-slate-500 tracking-widest text-sm select-none">
                    ••••••••••••••••••••••••••••
                  </span>
                )}
              </div>

              {/* Direct Copy Button */}
              <button
                type="button"
                onClick={handleCopySupportPix}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition shrink-0 cursor-pointer"
              >
                {copiedSupportPix ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Chave Copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Abrir Link de apoio</span>
                  </>
                )}
              </button>
            </div>

            {copiedSupportPix && (
              <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-[11px] flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Abrindo o Mercado Pago para apoiar o projeto.</span>
              </div>
            )}

            <p className="text-[11px] text-slate-400 leading-relaxed">
              O apoio é voluntário e acontece com segurança pelo Mercado Pago. O app continua gratuito para todos.
            </p>

            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
              <span className="text-slate-300 font-medium">
                Doe qualquer valor: <strong>R$ 5, R$ 10, R$ 20, R$ 50</strong> ou quanto o coração mandar!
              </span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                💚 100% reinvestido em soluções gratuitas
              </span>
            </div>
          </div>

          {/* Roadmap de Evolução & Próximas Atualizações */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-pink-500/10 text-pink-400 font-bold border border-pink-500/20">
                  <Rocket className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                    <span>Roadmap de Evolução</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                      v2.5 Ativa
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    O que já foi entregue e o que está planejado para as próximas atualizações
                  </p>
                </div>
              </div>

              <span className="text-[10px] text-slate-500 font-mono">
                Desenvolvimento Contínuo
              </span>
            </div>

            {/* Grid 2 colunas: Concluído vs Próximas Atualizações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Coluna 1: O que já temos ativo (v2.5) */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Já Implementado (v2.5)</span>
                  </span>
                  <span className="text-[10px] text-slate-500">100% Grátis</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>PWA Offline:</strong> funciona sem internet no celular e PC</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>5 Modelos de PDF:</strong> Moderno, Corporativo, Esmeralda, Clássico e Compacto</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>PIX QR Code BACEN:</strong> cliente escaneia o QR code e paga na hora</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Envio via WhatsApp:</strong> mensagem formatada com dados da proposta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Carteira com Gráficos:</strong> faturamento mensal e exportação de CSV</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Nuvem Google Sheets:</strong> sincronização grátis entre celular e PC</span>
                  </li>
                </ul>
              </div>

              {/* Coluna 2: Próximas Atualizações Planejadas */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-indigo-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wide">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Próximas Atualizações</span>
                  </span>
                  <span className="text-[10px] text-indigo-300 font-semibold">Planejadas</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Mais Modelos de PDF:</strong> novos estilos temáticos para prestadores, técnicos e comércio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Bug className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Correção Contínua de Bugs:</strong> melhorias de estabilidade e refinamento para telas pequenas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                    <span><strong>Assinatura na Tela:</strong> cliente assina com o dedo no celular para fechar o orçamento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Itens e Serviços Favoritos:</strong> preenchimento rápido de itens frequentes em 1 toque</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Impressão Térmica (Cupom 80mm):</strong> recibos rápidos estilo comprovante</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Link Web Compartilhável:</strong> cliente abre a proposta pelo navegador</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Caixa de Sugestão / Feedback */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="text-amber-400">💡</span>
                <span>Tem ideias de funções ou quer relatar algum problema? Envie sua sugestão para evoluirmos juntos!</span>
              </span>
              <a
                href="mailto:saulomg2@hotmail.com?subject=Sugest%C3%A3o%20de%20Atualiza%C3%A7%C3%A3o%20Or%C3%A7amento%20Express"
                className="inline-flex items-center gap-1 text-pink-400 hover:text-pink-300 font-bold shrink-0 underline"
              >
                <span>Enviar Sugestão</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Social Links & Other Ways to Support */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            <a
              href="https://saulomgg.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition group"
            >
              <span>Conheça meus projetos</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
            </a>

            <button
              type="button"
              onClick={handleShareApp}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition group cursor-pointer"
            >
              <span>{copiedShareLink ? 'Link Copiado!' : 'Indicar para outros profissionais'}</span>
              <Share2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-pink-400" />
            </button>

            <a
              href="mailto:saulomg2@hotmail.com?subject=Feedback%20Or%C3%A7amento%20Express"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition group"
            >
              <span>Feedback e melhorias</span>
              <MessageSquare className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400" />
            </a>
          </div>

          <div className="text-center pt-2 text-[10px] text-slate-500">
            Orçamento Express · 100% Offline e Privado · Desenvolvido por Saulomgg
          </div>
        </div>
      )}

      {/* Section 4: Dados, Modo Teste / Zerar e Backup Manual */}
      {(activeTab === 'backup' || activeTab === undefined) && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Card: Ativar / Desativar Modo Teste (Zerar ou Preencher Exemplos) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-800">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h2 className="font-bold text-slate-100 text-sm">
                  Modo Demonstração / Teste & Limpeza de Dados
                </h2>
                <p className="text-[11px] text-slate-400">
                  Zere o aplicativo para começar do zero com seus dados reais ou reative os exemplos de teste.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Button: Limpar / Zerar Aplicativo */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-rose-500/30 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-rose-400 font-bold mb-1">
                    <Trash2 className="w-4 h-4" />
                    <span>Limpar Dados (Zerar Aplicativo)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Apaga todos os orçamentos, clientes e valores de exemplo. Deixa o aplicativo completamente limpo para você inserir os dados da sua empresa e seus clientes reais.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowClearModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 hover:text-rose-200 border border-rose-500/40 font-bold transition active:scale-95 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Limpar Tudo & Iniciar do Zero</span>
                </button>
              </div>

              {/* Button: Ativar Dados de Teste / Exemplo */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-indigo-500/30 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-indigo-400 font-bold mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Carregar Dados de Demonstração</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Insere orçamentos e clientes de exemplo pré-configurados com gráficos e métricas para você ou um cliente ver todas as possibilidades do app funcionando.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDemoModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-indigo-200 border border-indigo-500/40 font-bold transition active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Ativar Dados de Teste / Exemplo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card: Backup Manual & Exportação de Arquivos */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-800">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 font-bold">
                <Database className="w-4 h-4" />
              </span>
              <div>
                <h2 className="font-bold text-slate-100 text-sm">Backup Manual & Exportação de Relatórios</h2>
                <p className="text-[11px] text-slate-400">
                  Guarde uma cópia física segura de todos os seus orçamentos e clientes no seu computador ou celular.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleExportBackup}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Baixar Backup Completo (.JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const ok = exportCompletedQuotesCSV(appData.quotes);
                  if (!ok) {
                    showToast('Nenhum orçamento com status "Concluído" encontrado para exportação.', 'warning');
                  } else {
                    showToast('Relatório CSV de orçamentos concluídos exportado com sucesso!', 'success');
                  }
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-500/40 font-bold transition shadow-sm cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Exportar Relatório CSV (Concluídos)</span>
              </button>

              <label className="w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition shadow-sm">
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Restaurar Backup (.JSON)</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleDownloadZip}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/50 font-bold transition shadow-sm active:scale-95 cursor-pointer"
                title="Abrir o código-fonte do projeto no GitHub"
              >
                <FolderArchive className="w-4 h-4 text-indigo-400" />
                <span>Ver código-fonte no GitHub</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmação de Limpeza com Alerta Cuidadoso contra Perda de Dados */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border-2 border-rose-500/50 rounded-2xl p-6 shadow-2xl space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Atenção: Limpar Todos os Dados?
                  </h3>
                  <p className="text-xs text-rose-400 font-semibold">
                    Cuidado para não perder seus dados reais
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Warning Box */}
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/80 space-y-2 text-xs text-rose-200 leading-relaxed">
              <p className="font-bold flex items-center gap-1.5 text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>AVISO IMPORTANTE DE SEGURANÇA:</span>
              </p>
              <p>
                Esta ação apagará <strong>todos os {appData.quotes.length} orçamentos</strong> e <strong>{appData.clients.length} clientes</strong> salvos localmente neste aparelho para deixar o app totalmente limpo para uso comercial com seus próprios dados.
              </p>
            </div>

            {/* Recommendation to Backup */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs text-slate-300">
              <span className="font-semibold text-slate-200 block">
                Tem dados reais salvos? Faça o backup antes:
              </span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Recomendamos fortemente fazer o download do arquivo de backup antes de zerar para que você possa restaurar tudo se precisar.
              </p>
              <button
                type="button"
                onClick={() => {
                  handleExportBackup();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Baixar Backup Completo (.JSON)</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executeClearData}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50 transition active:scale-95 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Zerar Tudo e Iniciar do Zero</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Ativar Dados de Demonstração / Teste com Aviso */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border-2 border-indigo-500/50 rounded-2xl p-6 shadow-2xl space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Ativar Modo Demonstração / Teste?
                  </h3>
                  <p className="text-xs text-indigo-400 font-semibold">
                    Carregar exemplos realistas de clientes e orçamentos
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Warning Box */}
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/80 space-y-2 text-xs text-amber-200 leading-relaxed">
              <p className="font-bold flex items-center gap-1.5 text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>ATENÇÃO: CUIDADO COM SEUS DADOS REAIS!</span>
              </p>
              <p>
                Esta ação irá carregar clientes, orçamentos concluídos e aprovados de exemplo para demonstrar as funções e os gráficos do app.
              </p>
              <p className="text-[11px] text-amber-300/80">
                Se você já possui dados reais da sua empresa ou de clientes, baixe o backup antes para não substituí-los.
              </p>
            </div>

            {/* Recommendation to Backup */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs text-slate-300">
              <span className="font-semibold text-slate-200 block">
                Salvar cópia dos dados atuais primeiro:
              </span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Você poderá restaurar seus orçamentos e clientes a qualquer momento usando o arquivo de backup.
              </p>
              <button
                type="button"
                onClick={() => {
                  handleExportBackup();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Baixar Backup Atual (.JSON)</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executeLoadDemoData}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-950/50 transition active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Sim, Carregar Dados de Demonstração</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Restauração de Backup */}
      {restoreCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border-2 border-blue-500/50 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Restaurar Cópia de Backup?
                  </h3>
                  <p className="text-xs text-blue-400 font-semibold">
                    Arquivo de backup verificado
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRestoreCandidate(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
              <p className="font-semibold text-slate-200">Conteúdo do arquivo selecionado:</p>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                <li><strong>{restoreCandidate.quotes?.length || 0}</strong> orçamentos</li>
                <li><strong>{restoreCandidate.clients?.length || 0}</strong> clientes cadastrados</li>
                <li>Empresa: <strong>{restoreCandidate.company?.name || 'Não informada'}</strong></li>
              </ul>
              <div className="mt-2 p-2 rounded-lg bg-amber-950/30 border border-amber-800/60 text-amber-300 text-[11px]">
                ⚠️ Os dados atuais serão substituídos pelo conteúdo deste arquivo.
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRestoreCandidate(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executeRestoreBackup}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-950/50 transition active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar e Restaurar Backup</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating In-App Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 border-2 rounded-2xl p-4 shadow-2xl flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === 'success'
              ? 'border-emerald-500/60'
              : toast.type === 'error'
              ? 'border-rose-500/60'
              : 'border-amber-500/60'
          }`}
        >
          <div
            className={`p-2 rounded-xl shrink-0 ${
              toast.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-400'
                : toast.type === 'error'
                ? 'bg-rose-500/20 text-rose-400'
                : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            {toast.type === 'success' && <Check className="w-5 h-5" />}
            {toast.type === 'error' && <AlertTriangle className="w-5 h-5" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
          </div>
          <div className="flex-1 text-xs">
            <p className="font-bold text-white mb-0.5">
              {toast.type === 'success' ? 'Sucesso!' : toast.type === 'error' ? 'Atenção' : 'Aviso'}
            </p>
            <p className="text-slate-300 leading-relaxed">{toast.text}</p>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
