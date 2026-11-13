import React from 'react';
import {
  Wallet,
  FileText,
  Users,
  Settings,
  Plus,
  Cloud,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { CompanyProfile } from '../types';

export type NavigationTab = 'wallet' | 'quotes' | 'clients' | 'settings';

interface NavigationProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenCreateQuote: () => void;
  quotesCount: number;
  clientsCount: number;
  lastSyncedAt?: string;
  company: CompanyProfile;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  onOpenCreateQuote,
  quotesCount,
  clientsCount,
  lastSyncedAt,
  company,
}) => {
  const brandName = company.tradingName?.trim() || company.name?.trim() || 'Orçamento Express';
  const brandSecondary = company.tradingName?.trim() && company.name?.trim() && company.tradingName.trim() !== company.name.trim()
    ? company.name
    : 'Orçamento Express';

  return (
    <>
      {/* Desktop & Tablet Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('wallet')}>
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={`Logo de ${brandName}`} className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 border border-slate-700 shadow-md shadow-emerald-950/40" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-md shadow-emerald-950/40">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <FileText className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
            )}
            <div>
              <span className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                <span className="max-w-[15rem] truncate">{brandName}</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium max-w-[15rem] truncate">{brandSecondary}</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800/80">
            <button
              onClick={() => onSelectTab('wallet')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                currentTab === 'wallet'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/80'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Carteira</span>
            </button>

            <button
              onClick={() => onSelectTab('quotes')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                currentTab === 'quotes'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/80'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Orçamentos</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700/80 text-slate-300 font-mono">
                {quotesCount}
              </span>
            </button>

            <button
              onClick={() => onSelectTab('clients')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                currentTab === 'clients'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/80'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Clientes</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700/80 text-slate-300 font-mono">
                {clientsCount}
              </span>
            </button>

            <button
              onClick={() => onSelectTab('settings')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                currentTab === 'settings'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/80'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Ajustes</span>
            </button>
          </nav>

          {/* Right: PWA Install & Quick Action */}
          <div className="flex items-center gap-2.5">
            <PWAInstallButton compact />

            <button
              onClick={onOpenCreateQuote}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Orçamento</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 pb-safe">
        <div className="grid grid-cols-5 h-14 items-center">
          <button
            onClick={() => onSelectTab('wallet')}
            className={`flex flex-col items-center justify-center h-full transition ${
              currentTab === 'wallet' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Carteira</span>
          </button>

          <button
            onClick={() => onSelectTab('quotes')}
            className={`flex flex-col items-center justify-center h-full transition relative ${
              currentTab === 'quotes' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Orçamentos</span>
            {quotesCount > 0 && (
              <span className="absolute top-2 right-4 w-4 h-4 rounded-full bg-emerald-600 text-white font-mono text-[9px] flex items-center justify-center font-bold">
                {quotesCount}
              </span>
            )}
          </button>

          {/* Central Highlighted Button */}
          <div className="flex items-center justify-center">
            <button
              onClick={onOpenCreateQuote}
              className="w-12 h-12 -mt-5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-950/60 active:scale-90 transition-transform"
              title="Criar novo orçamento"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          <button
            onClick={() => onSelectTab('clients')}
            className={`flex flex-col items-center justify-center h-full transition ${
              currentTab === 'clients' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Clientes</span>
          </button>

          <button
            onClick={() => onSelectTab('settings')}
            className={`flex flex-col items-center justify-center h-full transition ${
              currentTab === 'settings' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Ajustes</span>
          </button>
        </div>
      </nav>
    </>
  );
};
