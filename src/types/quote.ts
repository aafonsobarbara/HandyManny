export type QuoteStatus = 'Draft' | 'Approved';

export interface MaterialRow {
  id: string;
  item: string;
  quantity: number;
  unit: string;
  store?: 'Home Depot' | 'Tractor Supply';
  unitPrice?: number;
  totalPrice?: number;
  link?: string;
  manualOverride?: boolean;
}

export interface ServiceRow {
  id: string;
  name: string;
  hours: number;
  rate: number;
  subtotal: number;
}

export interface HelperConfig {
  mode: 'solo' | 'helpers';
  helpersCount: number;
  days: number;
  dailyRate: number;
}

export interface QuoteFinancials {
  materialsTotal: number;
  laborTotal: number;
  helpersTotal: number;
  fuelTotal: number;
  totalCost: number;
  marginPercent: number;
  clientPrice: number;
  grossProfit: number;
}

export interface TermsState {
  useCustom: boolean;
  customText: string;
}

export interface QuoteDraft {
  id: string;
  clientName: string;
  clientPhone: string;
  quoteDate: string;
  status: QuoteStatus;
  materials: MaterialRow[];
  services: ServiceRow[];
  helperConfig: HelperConfig;
  distanceMiles: number;
  gasRate: number;
  financials: QuoteFinancials;
  terms: TermsState;
  locked: boolean;
  priceResearchCompleted: boolean;
}

export interface SettingsState {
  companyName: string;
  companyPhone: string;
  companyEmail: string;
  logoUrl: string;
  defaultRate: number;
  defaultGasRate: number;
  defaultTerms: string;
}

export interface QuoteStoreState {
  quotes: QuoteDraft[];
  activeQuoteId?: string;
  settings: SettingsState;
  setActiveQuote: (id?: string) => void;
  addQuote: (partial: Partial<QuoteDraft>) => QuoteDraft;
  updateQuote: (id: string, updater: (draft: QuoteDraft) => QuoteDraft) => void;
  patchQuote: (id: string, partial: Partial<QuoteDraft>) => void;
  deleteQuote: (id: string) => void;
  markApproved: (id: string) => void;
  updateSettings: (updater: (settings: SettingsState) => SettingsState) => void;
  clearAll: () => void;
}
