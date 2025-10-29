import { createStore } from 'zustand/vanilla';
import { nanoid } from '../utils/nanoid';
import {
  QuoteDraft,
  QuoteStoreState,
  SettingsState,
  QuoteFinancials,
  HelperConfig
} from '../types/quote';
import { DEFAULT_TERMS, STORAGE_KEY } from '../constants/terms';
import { calculateFinancials } from '../utils/calculations';

const defaultSettings: SettingsState = {
  companyName: 'HandyManny Services',
  companyPhone: '(555) 867-5309',
  companyEmail: 'hello@handymanny.fake',
  logoUrl: '',
  defaultRate: 75,
  defaultGasRate: 0.2,
  defaultTerms: DEFAULT_TERMS
};

const defaultHelperConfig: HelperConfig = {
  mode: 'solo',
  helpersCount: 0,
  days: 0,
  dailyRate: 0
};

const emptyFinancials: QuoteFinancials = {
  materialsTotal: 0,
  laborTotal: 0,
  helpersTotal: 0,
  fuelTotal: 0,
  totalCost: 0,
  marginPercent: 25,
  clientPrice: 0,
  grossProfit: 0
};

const hydrate = (): { quotes: QuoteDraft[]; settings: SettingsState } => {
  if (typeof window === 'undefined') {
    return { quotes: [], settings: defaultSettings };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { quotes: [], settings: defaultSettings };
    const parsed = JSON.parse(raw) as Partial<QuoteStoreState>;
    return {
      quotes: parsed.quotes ?? [],
      settings: parsed.settings ?? defaultSettings
    };
  } catch (error) {
    console.warn('Failed to hydrate store', error);
    return { quotes: [], settings: defaultSettings };
  }
};

const persist = (state: QuoteStoreState) => {
  if (typeof window === 'undefined') return;
  const payload = JSON.stringify({
    quotes: state.quotes,
    settings: state.settings
  });
  window.localStorage.setItem(STORAGE_KEY, payload);
};

const createEmptyQuote = (settings: SettingsState): QuoteDraft => {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: nanoid(),
    clientName: '',
    clientPhone: '',
    quoteDate: today,
    status: 'Draft',
    materials: [],
    services: [],
    helperConfig: { ...defaultHelperConfig },
    distanceMiles: 0,
    gasRate: settings.defaultGasRate,
    financials: { ...emptyFinancials },
    terms: {
      useCustom: false,
      customText: ''
    },
    locked: false,
    priceResearchCompleted: false
  };
};

export const createQuoteStore = () => {
  const { quotes: initialQuotes, settings: initialSettings } = hydrate();

  const store = createStore<QuoteStoreState>((set, get) => ({
    quotes: initialQuotes,
    settings: initialSettings,
    activeQuoteId: initialQuotes[0]?.id,
    setActiveQuote: (id) => set({ activeQuoteId: id }),
    addQuote: (partial) => {
      const quote = {
        ...createEmptyQuote(get().settings),
        ...partial
      } as QuoteDraft;
      set((state) => ({
        quotes: [quote, ...state.quotes],
        activeQuoteId: quote.id
      }));
      persist(get());
      return quote;
    },
    updateQuote: (id, updater) => {
      set((state) => ({
        quotes: state.quotes.map((quote) =>
          quote.id === id ? updater({ ...quote }) : quote
        )
      }));
      persist(get());
    },
    patchQuote: (id, partial) => {
      set((state) => ({
        quotes: state.quotes.map((quote) => {
          if (quote.id !== id) return quote;
          const merged = {
            ...quote,
            ...partial,
            financials: {
              ...quote.financials,
              ...partial.financials
            }
          } as QuoteDraft;
          const recalculated = calculateFinancials({
            ...merged,
            financials: {
              ...merged.financials,
              marginPercent: merged.financials.marginPercent
            }
          });
          return {
            ...merged,
            financials: {
              ...recalculated,
              marginPercent: merged.financials.marginPercent
            }
          };
        })
      }));
      persist(get());
    },
    deleteQuote: (id) => {
      set((state) => ({
        quotes: state.quotes.filter((quote) => quote.id !== id),
        activeQuoteId: state.activeQuoteId === id ? undefined : state.activeQuoteId
      }));
      persist(get());
    },
    markApproved: (id) => {
      set((state) => ({
        quotes: state.quotes.map((quote) =>
          quote.id === id
            ? {
                ...quote,
                status: 'Approved'
              }
            : quote
        )
      }));
      persist(get());
    },
    updateSettings: (updater) => {
      set((state) => ({
        settings: updater(state.settings)
      }));
      persist(get());
    },
    clearAll: () => {
      set({ quotes: [], activeQuoteId: undefined });
      persist(get());
    }
  }));

  return store;
};

export const syncStoreToStorage = (store: ReturnType<typeof createQuoteStore>) => {
  const unsub = store.subscribe((state) => {
    persist(state);
  });
  return unsub;
};
