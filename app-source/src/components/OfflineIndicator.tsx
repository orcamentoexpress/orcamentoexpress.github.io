import React, { useEffect, useState } from 'react';
import { WifiOff, Database, X } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);

  // Se a conexão cair de novo depois, o aviso volta a aparecer.
  useEffect(() => {
    if (isOnline) setDismissed(false);
  }, [isOnline]);

  if (isOnline || dismissed) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 pl-3.5 pr-2 py-1.5 rounded-full bg-amber-500/90 text-amber-950 text-xs font-semibold shadow-lg backdrop-blur-md animate-fade-in border border-amber-300">
      <WifiOff className="w-3.5 h-3.5 animate-pulse" />
      <span>Modo Offline Ativo</span>
      <span className="hidden sm:flex items-center gap-1 font-normal opacity-90">
        <Database className="w-3 h-3" /> Armazenamento local seguro
      </span>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Fechar aviso"
        className="p-1 rounded-full hover:bg-amber-950/10"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
