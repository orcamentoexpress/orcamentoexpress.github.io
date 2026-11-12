import React from 'react';
import { ExternalLink, Code2, Heart } from 'lucide-react';

interface FooterBadgeProps {
  onOpenApoio?: () => void;
}

export const FooterBadge: React.FC<FooterBadgeProps> = ({ onOpenApoio }) => {
  return (
    <div className="w-full flex flex-wrap items-center justify-center gap-2 py-3 px-4">
      {/* Developed by Saulomgg */}
      <a
        href="https://saulomgg.github.io"
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/40 shadow-sm backdrop-blur-md transition-all duration-200 text-xs font-medium"
        title="Visitar saulomgg.github.io"
      >
        <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
          <Code2 className="w-2.5 h-2.5" />
        </span>
        <span>
          Desenvolvido por <strong className="text-slate-200 group-hover:text-emerald-300 font-semibold">Saulomgg</strong>
        </span>
        <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition-colors" />
      </a>

      <a
        href="https://orcamentoexpress.github.io/"
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/40 shadow-sm backdrop-blur-md transition-all duration-200 text-xs font-medium"
        title="Visitar o site oficial do Orçamento Express"
      >
        <span>Site oficial</span>
        <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition-colors" />
      </a>

      {/* Apoie o Projeto */}
      <button
        type="button"
        onClick={onOpenApoio}
        className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-950/40 hover:bg-pink-900/50 text-pink-300 hover:text-pink-100 border border-pink-500/30 hover:border-pink-500/60 shadow-sm backdrop-blur-md transition-all text-xs font-medium cursor-pointer"
        title="Apoiar a evolução do Orçamento Express"
      >
        <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400/40 group-hover:scale-110 transition-transform" />
        <span>
          Fechou um orçamento? <strong className="text-pink-200 group-hover:text-white font-semibold underline underline-offset-2">Apoie o projeto!</strong>
        </span>
      </button>
    </div>
  );
};
