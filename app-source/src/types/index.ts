export type QuoteStatus = 'rascunho' | 'enviado' | 'aprovado' | 'concluido' | 'recusado';

export type PDFTheme = 'modern' | 'corporate' | 'emerald' | 'classic' | 'compact';

export interface QuoteItem {
  id: string;
  description: string;
  unit: string; // 'un', 'hr', 'm²', 'serviço', 'kg', 'cx', etc.
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Client {
  id: string;
  name: string;
  document?: string; // CPF or CNPJ
  phone: string; // WhatsApp
  email?: string;
  address?: string;
  city?: string;
  notes?: string;
  createdAt: string;
}

export interface CompanyProfile {
  name: string;
  tradingName?: string; // Nome fantasia
  document: string; // CNPJ or CPF
  phone: string; // WhatsApp
  email: string;
  address: string;
  city: string;
  logoUrl?: string; // Base64 data URL
  pixKey?: string;
  pixKeyType?: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
  defaultWarranty: string;
  defaultPaymentTerms: string;
  defaultNotes: string;
  whatsappMessageTemplate: string;
}

export interface Quote {
  id: string;
  code: string; // e.g. "ORC-001"
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  clientDocument?: string;
  clientAddress?: string;
  clientCity?: string;
  
  items: QuoteItem[];
  subtotal: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountTotal: number;
  taxOrAddition: number;
  total: number;
  
  status: QuoteStatus;
  theme: PDFTheme;
  
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // Validity date YYYY-MM-DD
  
  paymentMethod: string;
  paymentTerms: string;
  notes: string;
  includePixQr: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface CloudSyncConfig {
  scriptUrl: string;
  apiKey?: string;
  lastSyncedAt?: string;
  autoSync: boolean;
}

export interface AppData {
  company: CompanyProfile;
  clients: Client[];
  quotes: Quote[];
  cloudSync: CloudSyncConfig;
  version: number;
}
