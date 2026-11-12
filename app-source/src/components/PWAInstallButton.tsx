import React, { useState } from 'react';
import { Download, Share2, Smartphone, Check, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  compact = false,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already installed or running in standalone mode, DO NOT show anything
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      try {
        const success = await install();
        if (success) {
          setJustInstalled(true);
          setTimeout(() => setJustInstalled(false), 4000);
          return;
        }
      } catch (err) {
        console.warn('Direct install failed or dismissed', err);
      }
    }
    // If deferred prompt was not available or user is on mobile browser where prompt needs trigger
    setShowGuideModal(true);
  };

  if (justInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
        <Check className="w-3.5 h-3.5" />
        <span>App Adicionado!</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold shadow-md shadow-emerald-950/40 transition-all ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm'
        }`}
        title="Baixar Orçamento Express para a tela inicial"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Baixar App</span>
      </button>

      {showGuideModal && <InstallGuideModal onClose={() => setShowGuideModal(false)} />}
    </>
  );
};

export const InstallGuideModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-left animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL}icon.svg`}
              alt="Logo"
              className="w-10 h-10 rounded-xl bg-slate-950 border border-emerald-500/30 p-1 shrink-0"
            />
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Instalar no Celular</h3>
              <p className="text-[11px] text-slate-400">Orçamento Express • 100% Offline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-xs text-slate-300">
          {/* Chrome / Android Guide */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-emerald-400 text-xs">
              <Smartphone className="w-4 h-4" />
              <span>Android / Google Chrome:</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              1. Toque nos <strong>3 pontinhos (⋮)</strong> no topo do navegador.
            </p>
            <p className="text-slate-300 leading-relaxed">
              2. Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
            </p>
          </div>

          {/* iPhone / Safari Guide */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-blue-400 text-xs">
              <Share2 className="w-4 h-4" />
              <span>iPhone / Safari (iOS):</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              1. Toque no botão de <strong>Compartilhar</strong> (quadrado com seta).
            </p>
            <p className="text-slate-300 leading-relaxed">
              2. Escolha <strong>"Adicionar à Tela de Início"</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white transition shadow-md"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};
