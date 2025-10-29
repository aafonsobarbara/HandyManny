export type QuoteStatus = 'Draft' | 'Approved' | 'Sent';

export interface MaterialItem {
  id?: number;
  item: string;
  qty: number;
  unit?: string;
  store?: string;
  unitPrice?: number;
  total?: number;
  link?: string;
  manual?: boolean;
}

export interface LaborItem {
  id?: number;
  description: string;
  rate: number;
  hours: number;
  total?: number;
}

export interface HelperConfig {
  enabled: boolean;
  helpers: number;
  days: number;
  dailyRate: number;
}

export interface TravelConfig {
  startAddressType: 'default' | 'custom';
  customAddress: string;
  miles?: number;
  fuelRate: number;
}

export interface ProfitSummary {
  materialTotal: number;
  laborTotal: number;
  helperTotal: number;
  fuelTotal: number;
  totalCost: number;
  clientPrice: number;
  grossProfit: number;
  margin: number;
}

export interface Quote {
  id?: number;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail?: string;
  quoteDate: string;
  status: QuoteStatus;
  materials: MaterialItem[];
  labor: LaborItem[];
  helperConfig: HelperConfig;
  travelConfig: TravelConfig;
  terms: string;
  margin: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
