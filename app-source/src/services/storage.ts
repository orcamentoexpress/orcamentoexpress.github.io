import { AppData, Client, CompanyProfile, Quote } from '../types';

const STORAGE_KEY = 'orcamento_express_data_v2';

export const DEFAULT_COMPANY: CompanyProfile = {
  name: 'Orçamento Express',
  tradingName: 'Sua Empresa',
  document: '',
  phone: '',
  email: '',
  address: '',
  city: 'São Paulo - SP',
  logoUrl: '',
  pixKey: '',
  pixKeyType: 'email',
  defaultWarranty: 'Garantia legal de 90 dias conforme CDC sobre serviços executados e peças instaladas.',
  defaultPaymentTerms: '50% de entrada no aceite e 50% na conclusão e entrega, via PIX, boleto ou link de pagamento.',
  defaultNotes: 'Proposta válida por 15 dias. Valores sujeitos a alteração caso haja mudança no escopo inicial acordado.',
  whatsappMessageTemplate: 'Olá *{cliente}*, tudo bem?\n\nSegue o seu *Orçamento #{numero}* da *{empresa}* no valor total de *{total}*.\n\n📅 Validade: *{validade}*\n💰 Pagamento facilitado via PIX.\n\nFicamos à disposição para quaisquer dúvidas!',
};

export const EMPTY_COMPANY: CompanyProfile = {
  name: '',
  tradingName: '',
  document: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  logoUrl: '',
  pixKey: '',
  pixKeyType: 'email',
  defaultWarranty: 'Garantia legal de 90 dias conforme CDC sobre serviços executados.',
  defaultPaymentTerms: '50% de entrada no aceite e 50% na conclusão.',
  defaultNotes: 'Proposta válida por 15 dias.',
  whatsappMessageTemplate: 'Olá *{cliente}*, tudo bem?\n\nSegue o seu *Orçamento #{numero}* no valor de *{total}*.\n\n📅 Validade: *{validade}*\n\nQualquer dúvida estou à disposição!',
};

export function getDemoAppData(): AppData {
  return {
    company: DEFAULT_COMPANY,
    clients: INITIAL_CLIENTS,
    quotes: INITIAL_QUOTES,
    cloudSync: {
      scriptUrl: '',
      autoSync: false,
    },
    version: 2,
  };
}

export function getCleanAppData(): AppData {
  return {
    company: EMPTY_COMPANY,
    clients: [],
    quotes: [],
    cloudSync: {
      scriptUrl: '',
      autoSync: false,
    },
    version: 2,
  };
}

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    name: 'Carlos Eduardo Oliveira',
    document: '284.912.448-30',
    phone: '11987654321',
    email: 'carlos.eduardo@email.com',
    address: 'Rua das Flores, 245 - Jardins',
    city: 'São Paulo - SP',
    notes: 'Cliente preferencial, prefere contato pela manhã.',
    createdAt: '2026-10-15T10:00:00Z',
  },
  {
    id: 'cli-2',
    name: 'TechNova Soluções Digitais Ltda',
    document: '19.452.887/0001-12',
    phone: '11977778888',
    email: 'financeiro@technova.com.br',
    address: 'Rua Funchal, 418, Cj 52 - Vila Olímpia',
    city: 'São Paulo - SP',
    notes: 'Solicita emissão de NF-e para pagamento a 30 dias.',
    createdAt: '2026-10-20T14:30:00Z',
  },
  {
    id: 'cli-3',
    name: 'Mariana Silveira Santos',
    document: '391.045.228-55',
    phone: '21998881234',
    email: 'mariana.silveira@gmail.com',
    address: 'Av. Atlântica, 1500, Apt 302',
    city: 'Rio de Janeiro - RJ',
    notes: 'Projeto residencial e consultoria.',
    createdAt: '2026-11-01T09:15:00Z',
  },
];

export const INITIAL_QUOTES: Quote[] = [
  {
    id: 'orc-101',
    code: 'ORC-2026-001',
    clientId: 'cli-1',
    clientName: 'Carlos Eduardo Oliveira',
    clientPhone: '11987654321',
    clientEmail: 'carlos.eduardo@email.com',
    clientDocument: '284.912.448-30',
    clientAddress: 'Rua das Flores, 245 - Jardins',
    clientCity: 'São Paulo - SP',
    items: [
      {
        id: 'item-1',
        description: 'Desenvolvimento e Configuração de Website PWA Responsivo',
        unit: 'serviço',
        quantity: 1,
        unitPrice: 2800.00,
        total: 2800.00,
      },
      {
        id: 'item-2',
        description: 'Otimização de SEO e Integração de Catálogo Online',
        unit: 'serviço',
        quantity: 1,
        unitPrice: 950.00,
        total: 950.00,
      },
      {
        id: 'item-3',
        description: 'Suporte e Manutenção Técnica Especializada (Mensalidade)',
        unit: 'mês',
        quantity: 2,
        unitPrice: 350.00,
        total: 700.00,
      },
    ],
    subtotal: 4450.00,
    discountType: 'fixed',
    discountValue: 250.00,
    discountTotal: 250.00,
    taxOrAddition: 0,
    total: 4200.00,
    status: 'aprovado',
    theme: 'modern',
    issueDate: '2026-10-25',
    dueDate: '2026-11-15',
    paymentMethod: 'PIX (50% entrada + 50% entrega)',
    paymentTerms: 'Parcelado em 2x sem juros no PIX',
    notes: 'Inclusa garantia de 90 dias e treinamento de uso da plataforma.',
    includePixQr: true,
    createdAt: '2026-10-25T11:00:00Z',
    updatedAt: '2026-10-26T14:20:00Z',
  },
  {
    id: 'orc-102',
    code: 'ORC-2026-002',
    clientId: 'cli-2',
    clientName: 'TechNova Soluções Digitais Ltda',
    clientPhone: '11977778888',
    clientEmail: 'financeiro@technova.com.br',
    clientDocument: '19.452.887/0001-12',
    clientAddress: 'Rua Funchal, 418, Cj 52 - Vila Olímpia',
    clientCity: 'São Paulo - SP',
    items: [
      {
        id: 'item-201',
        description: 'Consultoria de Arquitetura de Nuvem e Automação de Processos',
        unit: 'hr',
        quantity: 24,
        unitPrice: 180.00,
        total: 4320.00,
      },
      {
        id: 'item-202',
        description: 'Implementação de Rotinas de Backup Automatizado',
        unit: 'serviço',
        quantity: 1,
        unitPrice: 1200.00,
        total: 1200.00,
      },
    ],
    subtotal: 5520.00,
    discountType: 'percentage',
    discountValue: 5,
    discountTotal: 276.00,
    taxOrAddition: 0,
    total: 5244.00,
    status: 'enviado',
    theme: 'corporate',
    issueDate: '2026-11-02',
    dueDate: '2026-11-17',
    paymentMethod: 'Boleto Bancário / Transferência TED',
    paymentTerms: 'Faturado em 28 DDL após validação da homologação',
    notes: 'Proposta técnica revisada pelo comitê de engenharia.',
    includePixQr: true,
    createdAt: '2026-11-02T16:00:00Z',
    updatedAt: '2026-11-02T16:00:00Z',
  },
  {
    id: 'orc-103',
    code: 'ORC-2026-003',
    clientId: 'cli-3',
    clientName: 'Mariana Silveira Santos',
    clientPhone: '21998881234',
    clientEmail: 'mariana.silveira@gmail.com',
    clientDocument: '391.045.228-55',
    clientAddress: 'Av. Atlântica, 1500, Apt 302',
    clientCity: 'Rio de Janeiro - RJ',
    items: [
      {
        id: 'item-301',
        description: 'Projeto de Design de Interiores e Memorial Descritivo 3D',
        unit: 'projeto',
        quantity: 1,
        unitPrice: 3200.00,
        total: 3200.00,
      },
    ],
    subtotal: 3200.00,
    discountType: 'fixed',
    discountValue: 0,
    discountTotal: 0,
    taxOrAddition: 0,
    total: 3200.00,
    status: 'concluido',
    theme: 'emerald',
    issueDate: '2026-10-18',
    dueDate: '2026-10-30',
    paymentMethod: 'PIX à vista',
    paymentTerms: 'Quitado na assinatura da entrega final',
    notes: 'Projeto finalizado e aprovado com sucesso!',
    includePixQr: true,
    createdAt: '2026-10-18T10:00:00Z',
    updatedAt: '2026-10-28T18:00:00Z',
  },
];

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial: AppData = {
        company: DEFAULT_COMPANY,
        clients: INITIAL_CLIENTS,
        quotes: INITIAL_QUOTES,
        cloudSync: {
          scriptUrl: '',
          autoSync: false,
        },
        version: 2,
      };
      saveAppData(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as AppData;
    const loadedCompany = { ...DEFAULT_COMPANY, ...parsed.company };

    // Migrate previous placeholder data to user's updated company branding
    if (loadedCompany.name === 'Studio MGG Serviços & Tecnologia' || loadedCompany.name === 'Studio MGG Serviços') {
      loadedCompany.name = 'saulomgg dev lab';
    }
    if (loadedCompany.tradingName === 'MGG Soluções') {
      loadedCompany.tradingName = 'Studio Lab';
    }
    if (loadedCompany.email === 'contato@saulomgg.github.io' || loadedCompany.email === 'contato@suaempresa.com') {
      loadedCompany.email = 'saulomgg.github.io';
    }
    if (loadedCompany.address === 'Av. Paulista, 1000 - Bela Vista') {
      loadedCompany.address = 'saulomgg.github.io';
    }
    if (loadedCompany.pixKey === 'contato@saulomgg.github.io' || loadedCompany.pixKey === 'saulomg2@hotmail.com') {
      loadedCompany.pixKey = '';
    }

    return {
      ...parsed,
      company: loadedCompany,
      clients: parsed.clients || [],
      quotes: parsed.quotes || [],
      cloudSync: {
        scriptUrl: parsed.cloudSync?.scriptUrl || '',
        autoSync: parsed.cloudSync?.autoSync ?? false,
        lastSyncedAt: parsed.cloudSync?.lastSyncedAt,
      },
    };
  } catch (err) {
    console.error('Failed to load local data', err);
    return {
      company: DEFAULT_COMPANY,
      clients: INITIAL_CLIENTS,
      quotes: INITIAL_QUOTES,
      cloudSync: { scriptUrl: '', autoSync: false },
      version: 2,
    };
  }
}

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
}

export function exportBackupJSON(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `backup_orcamento_express_${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export CSV report specifically containing completed quotes (status === 'concluido')
 */
export function exportCompletedQuotesCSV(quotes: Quote[]): boolean {
  const completed = quotes.filter((q) => q.status === 'concluido');
  if (completed.length === 0) {
    return false;
  }

  const headers = [
    'Código',
    'Cliente',
    'Documento (CPF/CNPJ)',
    'Telefone / WhatsApp',
    'E-mail',
    'Cidade',
    'Data de Emissão',
    'Validade',
    'Forma de Pagamento',
    'Condições de Pagamento',
    'Qtd Itens',
    'Discriminação dos Itens',
    'Subtotal (R$)',
    'Desconto (R$)',
    'Acréscimos (R$)',
    'Valor Total Concluído (R$)',
    'Status',
  ];

  const escapeCSV = (val: string | number | undefined) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = completed.map((q) => {
    const itemsSummary = q.items
      .map((i) => `${i.description} (${i.quantity} ${i.unit || 'un'} x R$ ${i.unitPrice.toFixed(2)})`)
      .join(' | ');

    return [
      escapeCSV(q.code),
      escapeCSV(q.clientName),
      escapeCSV(q.clientDocument || ''),
      escapeCSV(q.clientPhone),
      escapeCSV(q.clientEmail || ''),
      escapeCSV(q.clientCity || ''),
      escapeCSV(q.issueDate),
      escapeCSV(q.dueDate),
      escapeCSV(q.paymentMethod),
      escapeCSV(q.paymentTerms),
      escapeCSV(q.items.length),
      escapeCSV(itemsSummary),
      escapeCSV(q.subtotal.toFixed(2).replace('.', ',')),
      escapeCSV(q.discountTotal.toFixed(2).replace('.', ',')),
      escapeCSV(q.taxOrAddition.toFixed(2).replace('.', ',')),
      escapeCSV(q.total.toFixed(2).replace('.', ',')),
      escapeCSV('Concluído'),
    ].join(';');
  });

  // UTF-8 BOM \uFEFF for seamless Portuguese Excel compatibility
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `relatorio_orcamentos_concluidos_${dateStr}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  return true;
}

export async function importBackupJSON(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text) as AppData;
        if (!parsed.company || !Array.isArray(parsed.quotes)) {
          throw new Error('Arquivo de backup inválido.');
        }
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo.'));
    reader.readAsText(file);
  });
}

/**
 * Google Apps Script Cloud Sync service
 * Allows 2-way sync between devices via a Google Sheet web app!
 */
export async function syncWithGoogleAppsScript(
  scriptUrl: string,
  localData: AppData
): Promise<{ success: boolean; data?: AppData; message: string }> {
  if (!scriptUrl || !scriptUrl.startsWith('https://script.google.com/macros/s/')) {
    return {
      success: false,
      message: 'URL do Google Apps Script inválida. Deve começar com https://script.google.com/macros/s/',
    };
  }

  try {
    const payload = {
      action: 'sync',
      clientTimestamp: new Date().toISOString(),
      data: localData,
    };

    // Google Apps Script requires text/plain or URL-encoded to bypass CORS preflight restrictions
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Falha no servidor (${response.status})`);
    }

    const result = await response.json();

    if (result.success && result.data) {
      return {
        success: true,
        data: result.data,
        message: result.message || 'Sincronização em nuvem concluída com sucesso!',
      };
    } else {
      return {
        success: false,
        message: result.error || 'Resposta inválida do Google Apps Script.',
      };
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Erro na sincronização: ${errorMsg}. Verifique as permissões do Web App (Acesso: Qualquer pessoa).`,
    };
  }
}

/**
 * Ready-to-copy Google Apps Script template code
 */
export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * ========================================================
 * ORÇAMENTO EXPRESS - NUVEM & BACKUP AUTOMÁTICO
 * Desenvolvido por Saulomgg (saulomgg.github.io)
 * ========================================================
 * INSTRUÇÕES RÁPIDAS:
 * 1. Crie uma planilha em branco no Google Sheets (drive.google.com).
 * 2. Clique no menu "Extensões" > "Apps Script".
 * 3. Apague tudo e cole este código completo.
 * 4. Clique em "Implantar" (botão azul no canto superior direito) > "Nova Implantação".
 * 5. Tipo: Selecione a engrenagem e escolha "App da Web".
 * 6. Configurações:
 *    - Executar como: "Eu (seu_email@gmail.com)"
 *    - Quem tem acesso: "Qualquer pessoa" (OBRIGATÓRIO para permitir sync do app)
 * 7. Clique em "Implantar", autorize o acesso à planilha se solicitado.
 * 8. Copie o "URL do app da web" e cole nas Configurações do Orçamento Express!
 * ========================================================
 */

function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("DATABASE");
  if (!sheet) {
    sheet = ss.insertSheet("DATABASE");
    sheet.appendRow(["Chave", "Valor JSON", "Data/Hora Atualização"]);
    sheet.setFrozenRows(1);
    sheet.getRange("A1:C1").setFontWeight("bold").setBackground("#0f172a").setFontColor("#ffffff");
  }
  return sheet;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var sheet = setupDatabase();
    var contents = e.postData ? e.postData.contents : "";
    if (!contents) {
      return sendResponse({ success: false, error: "Nenhum dado recebido" });
    }

    var payload = JSON.parse(contents);
    var action = payload.action;

    if (action === "sync" || action === "backup") {
      var clientData = payload.data;
      var timestamp = new Date().toISOString();

      // Salva os dados na linha 2 da aba DATABASE
      sheet.getRange(2, 1).setValue("APP_DATA_BACKUP");
      sheet.getRange(2, 2).setValue(JSON.stringify(clientData));
      sheet.getRange(2, 3).setValue(timestamp);

      return sendResponse({
        success: true,
        message: "Dados sincronizados com a nuvem em " + new Date().toLocaleTimeString("pt-BR"),
        data: clientData,
        syncedAt: timestamp
      });
    }

    return sendResponse({ success: false, error: "Ação desconhecida" });
  } catch (err) {
    return sendResponse({ success: false, error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    var sheet = setupDatabase();
    var jsonStr = sheet.getRange(2, 2).getValue();
    var timestamp = sheet.getRange(2, 3).getValue();

    if (!jsonStr) {
      return sendResponse({ success: true, empty: true, message: "Nenhum dado salvo ainda." });
    }

    var data = JSON.parse(jsonStr);
    return sendResponse({
      success: true,
      data: data,
      lastUpdated: timestamp
    });
  } catch (err) {
    return sendResponse({ success: false, error: err.toString() });
  }
}

function sendResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
