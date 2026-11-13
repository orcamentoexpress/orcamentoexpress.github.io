/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppData, Client, CompanyProfile, PDFTheme, Quote, QuoteStatus } from './types';
import { loadAppData, saveAppData, syncWithGoogleAppsScript } from './services/storage';
import { Navigation, NavigationTab } from './components/Navigation';
import { WalletDashboard } from './components/wallet/WalletDashboard';
import { QuoteList } from './components/quotes/QuoteList';
import { QuoteEditor } from './components/quotes/QuoteEditor';
import { QuotePreviewModal } from './components/quotes/QuotePreviewModal';
import { ClientList } from './components/clients/ClientList';
import { SettingsView } from './components/settings/SettingsView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { FooterBadge } from './components/FooterBadge';

export default function App() {
  const [data, setData] = useState<AppData>(() => loadAppData());
  const [currentTab, setCurrentTab] = useState<NavigationTab>('wallet');
  
  // Quote Editing state
  const [isEditingQuote, setIsEditingQuote] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);

  // Quote Preview Modal state
  const [previewQuote, setPreviewQuote] = useState<Quote | null>(null);

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveAppData(data);
  }, [data]);

  // Auto-sync with Google Apps Script if enabled
  const triggerAutoSync = async (newData: AppData) => {
    if (newData.cloudSync?.autoSync && newData.cloudSync?.scriptUrl) {
      try {
        const res = await syncWithGoogleAppsScript(newData.cloudSync.scriptUrl, newData);
        if (res.success && res.data) {
          setData((prev) => ({
            ...prev,
            cloudSync: {
              ...prev.cloudSync,
              lastSyncedAt: new Date().toISOString(),
            },
          }));
        }
      } catch (err) {
        console.warn('Auto-sync silent fail (will retry next save)', err);
      }
    }
  };

  // Quotes Management Handlers
  const handleOpenCreateQuote = (prefilledClient?: Client) => {
    if (prefilledClient) {
      const newQuote: Quote = {
        id: `orc-${Date.now()}`,
        code: `ORC-${new Date().getFullYear()}-${String(data.quotes.length + 1).padStart(3, '0')}`,
        clientId: prefilledClient.id,
        clientName: prefilledClient.name,
        clientPhone: prefilledClient.phone,
        clientEmail: prefilledClient.email || '',
        clientDocument: prefilledClient.document || '',
        clientAddress: prefilledClient.address || '',
        clientCity: prefilledClient.city || '',
        items: [
          {
            id: `item-${Date.now()}-1`,
            description: 'Prestação de Serviço Especializado',
            unit: 'serviço',
            quantity: 1,
            unitPrice: 1200.00,
            total: 1200.00,
          },
        ],
        subtotal: 1200.00,
        discountType: 'fixed',
        discountValue: 0,
        discountTotal: 0,
        taxOrAddition: 0,
        total: 1200.00,
        status: 'rascunho',
        theme: 'modern',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        paymentMethod: data.company.defaultPaymentTerms || 'PIX ou Boleto',
        paymentTerms: '50% entrada no aceite e 50% na conclusão',
        notes: data.company.defaultNotes || '',
        includePixQr: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setEditingQuote(newQuote);
    } else {
      setEditingQuote(null);
    }
    setIsEditingQuote(true);
  };

  const handleEditQuote = (quote: Quote) => {
    setEditingQuote(quote);
    setIsEditingQuote(true);
  };

  const handleSaveQuote = (savedQuote: Quote, openPreview: boolean = false) => {
    setData((prev) => {
      const exists = prev.quotes.some((q) => q.id === savedQuote.id);
      let updatedQuotes: Quote[];
      if (exists) {
        updatedQuotes = prev.quotes.map((q) => (q.id === savedQuote.id ? savedQuote : q));
      } else {
        updatedQuotes = [savedQuote, ...prev.quotes];
      }

      // Check if client exists, if not, automatically register
      let updatedClients = [...prev.clients];
      if (savedQuote.clientName && !updatedClients.some((c) => c.name.toLowerCase() === savedQuote.clientName.toLowerCase())) {
        const autoClient: Client = {
          id: `cli-${Date.now()}`,
          name: savedQuote.clientName,
          phone: savedQuote.clientPhone,
          email: savedQuote.clientEmail,
          document: savedQuote.clientDocument,
          address: savedQuote.clientAddress,
          city: savedQuote.clientCity,
          createdAt: new Date().toISOString(),
        };
        updatedClients.push(autoClient);
      }

      const newData = { ...prev, quotes: updatedQuotes, clients: updatedClients };
      triggerAutoSync(newData);
      return newData;
    });

    setIsEditingQuote(false);
    setEditingQuote(null);

    if (openPreview) {
      setPreviewQuote(savedQuote);
    }
  };

  const handleDuplicateQuote = (quote: Quote) => {
    const duplicated: Quote = {
      ...quote,
      id: `orc-${Date.now()}`,
      code: `${quote.code}-COP`,
      status: 'rascunho',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setData((prev) => {
      const newData = { ...prev, quotes: [duplicated, ...prev.quotes] };
      triggerAutoSync(newData);
      return newData;
    });

    setPreviewQuote(duplicated);
  };

  const handleDeleteQuote = (quoteId: string) => {
    setData((prev) => {
      const newData = { ...prev, quotes: prev.quotes.filter((q) => q.id !== quoteId) };
      triggerAutoSync(newData);
      return newData;
    });
    if (previewQuote?.id === quoteId) {
      setPreviewQuote(null);
    }
  };

  const handleUpdateQuoteStatus = (quoteId: string, newStatus: QuoteStatus) => {
    setData((prev) => {
      const updatedQuotes = prev.quotes.map((q) =>
        q.id === quoteId ? { ...q, status: newStatus, updatedAt: new Date().toISOString() } : q
      );
      const newData = { ...prev, quotes: updatedQuotes };
      triggerAutoSync(newData);
      return newData;
    });

    if (previewQuote && previewQuote.id === quoteId) {
      setPreviewQuote((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleUpdateQuoteTheme = (quoteId: string, newTheme: PDFTheme) => {
    setData((prev) => {
      const updatedQuotes = prev.quotes.map((q) =>
        q.id === quoteId ? { ...q, theme: newTheme, updatedAt: new Date().toISOString() } : q
      );
      const newData = { ...prev, quotes: updatedQuotes };
      triggerAutoSync(newData);
      return newData;
    });

    if (previewQuote && previewQuote.id === quoteId) {
      setPreviewQuote((prev) => (prev ? { ...prev, theme: newTheme } : null));
    }
  };

  // Client Management Handlers
  const handleSaveClient = (client: Client) => {
    setData((prev) => {
      const exists = prev.clients.some((c) => c.id === client.id);
      const updatedClients = exists
        ? prev.clients.map((c) => (c.id === client.id ? client : c))
        : [client, ...prev.clients];
      const newData = { ...prev, clients: updatedClients };
      triggerAutoSync(newData);
      return newData;
    });
  };

  const handleDeleteClient = (clientId: string) => {
    setData((prev) => {
      const newData = { ...prev, clients: prev.clients.filter((c) => c.id !== clientId) };
      triggerAutoSync(newData);
      return newData;
    });
  };

  const handleQuickAddClient = (client: Client) => {
    handleSaveClient(client);
  };

  // Settings & Sync Handlers
  const handleUpdateCompany = (company: CompanyProfile) => {
    setData((prev) => {
      const newData = { ...prev, company };
      triggerAutoSync(newData);
      return newData;
    });
  };

  const handleDataRestored = (newData: AppData) => {
    setData(newData);
    saveAppData(newData);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30">
      {/* Offline Connectivity Notification Banner */}
      <OfflineIndicator />

      {/* Navigation (Header + Mobile Bottom Bar) */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setIsEditingQuote(false);
          setCurrentTab(tab);
        }}
        onOpenCreateQuote={() => handleOpenCreateQuote()}
        quotesCount={data.quotes.length}
        clientsCount={data.clients.length}
        lastSyncedAt={data.cloudSync?.lastSyncedAt}
        company={data.company}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5 sm:pt-7">
        {isEditingQuote ? (
          <QuoteEditor
            initialQuote={editingQuote}
            clients={data.clients}
            company={data.company}
            onSave={handleSaveQuote}
            onCancel={() => {
              setIsEditingQuote(false);
              setEditingQuote(null);
            }}
            onQuickAddClient={handleQuickAddClient}
          />
        ) : (
          <>
            {currentTab === 'wallet' && (
              <WalletDashboard
                quotes={data.quotes}
                onOpenCreate={() => handleOpenCreateQuote()}
                onViewQuote={(q) => setPreviewQuote(q)}
                onFilterByStatus={(status) => {
                  setCurrentTab('quotes');
                }}
              />
            )}

            {currentTab === 'quotes' && (
              <QuoteList
                quotes={data.quotes}
                onOpenCreate={() => handleOpenCreateQuote()}
                onEdit={handleEditQuote}
                onPreview={(q) => setPreviewQuote(q)}
                onDuplicate={handleDuplicateQuote}
                onDelete={handleDeleteQuote}
                onUpdateStatus={handleUpdateQuoteStatus}
              />
            )}

            {currentTab === 'clients' && (
              <ClientList
                clients={data.clients}
                quotes={data.quotes}
                onSaveClient={handleSaveClient}
                onDeleteClient={handleDeleteClient}
                onNewQuoteForClient={(c) => handleOpenCreateQuote(c)}
                onViewQuote={(q) => setPreviewQuote(q)}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsView
                appData={data}
                onUpdateCompany={handleUpdateCompany}
                onDataRestored={handleDataRestored}
              />
            )}
          </>
        )}
      </main>

      {/* Quote Live Preview Modal */}
      {previewQuote && (
        <QuotePreviewModal
          quote={previewQuote}
          company={data.company}
          isOpen={!!previewQuote}
          onClose={() => setPreviewQuote(null)}
          onUpdateStatus={handleUpdateQuoteStatus}
          onUpdateTheme={handleUpdateQuoteTheme}
        />
      )}

      {/* Footer: Desenvolvido por Saulomgg & Apoie o Projeto */}
      <footer className="mt-auto mb-16 md:mb-0">
        <FooterBadge
          onOpenApoio={() => {
            setIsEditingQuote(false);
            setCurrentTab('settings');
          }}
        />
      </footer>
    </div>
  );
}
