import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Quote, MaterialItem, LaborItem, HelperConfig, TravelConfig, ProfitSummary } from '../types/quote';
import { DEFAULT_TERMS } from '../constants/terms';
import { calculateProfitSummary } from '../utils/calculations';

interface QuoteState {
  quotes: Quote[];
  activeQuote?: Quote;
  chatLocked: boolean;
  setQuotes: (quotes: Quote[] | ((quotes: Quote[]) => Quote[])) => void;
  setActiveQuote: (quote?: Quote) => void;
  createDraft: () => Quote;
  updateActiveQuote: (data: Partial<Quote>) => void;
  setMaterials: (materials: MaterialItem[]) => void;
  setLabor: (labor: LaborItem[]) => void;
  toggleChatLocked: (locked: boolean) => void;
  updateHelperConfig: (config: Partial<HelperConfig>) => void;
  updateTravelConfig: (config: Partial<TravelConfig>) => void;
  updateMargin: (margin: number) => void;
  setTerms: (terms: string) => void;
  computeSummary: () => ProfitSummary | undefined;
}

const initialHelperConfig: HelperConfig = {
  enabled: false,
  helpers: 0,
  days: 0,
  dailyRate: 0
};

const initialTravelConfig: TravelConfig = {
  startAddressType: 'default',
  customAddress: '',
  miles: 0,
  fuelRate: 0.2
};

const emptyQuote = (): Quote => ({
  clientName: '',
  clientAddress: '',
  clientPhone: '',
  clientEmail: '',
  quoteDate: new Date().toISOString(),
  status: 'Draft',
  materials: [],
  labor: [],
  helperConfig: initialHelperConfig,
  travelConfig: initialTravelConfig,
  terms: DEFAULT_TERMS,
  margin: 20
});

const useQuoteStore = create<QuoteState>()(
  devtools(
    immer((set, get) => ({
      quotes: [],
      activeQuote: undefined,
      chatLocked: false,
      setQuotes: (payload) =>
        set((state) => ({
          quotes: typeof payload === 'function' ? payload(state.quotes) : payload
        })),
      setActiveQuote: (quote) => set({ activeQuote: quote }),
      createDraft: () => {
        const draft = emptyQuote();
        set({ activeQuote: draft, chatLocked: false });
        return draft;
      },
      updateActiveQuote: (data) =>
        set((state) => {
          if (!state.activeQuote) return;
          state.activeQuote = { ...state.activeQuote, ...data };
        }),
      setMaterials: (materials) =>
        set((state) => {
          if (!state.activeQuote) return;
          state.activeQuote.materials = materials;
        }),
      setLabor: (labor) =>
        set((state) => {
          if (!state.activeQuote) return;
          state.activeQuote.labor = labor;
        }),
      toggleChatLocked: (locked) => set({ chatLocked: locked }),
      updateHelperConfig: (config) =>
        set((state) => {
          if (!state.activeQuote) return;
          state.activeQuote.helperConfig = {
            ...state.activeQuote.helperConfig,
            ...config,
            enabled: config.enabled ?? state.activeQuote.helperConfig.enabled
          };
        }),
      updateTravelConfig: (config) =>
        set((state) => {
          if (!state.activeQuote) return;
          state.activeQuote.travelConfig = {
            ...state.activeQuote.travelConfig,
            ...config
          };
        }),
      updateMargin: (margin) =>
        set((state) => {
          if (!state.activeQuote) return;
          state.activeQuote.margin = margin;
        }),
      setTerms: (terms) =>
        set((state) => {
          if (!state.activeQuote) return;
          state.activeQuote.terms = terms;
        }),
      computeSummary: () => {
        const { activeQuote } = get();
        if (!activeQuote) return undefined;
        return calculateProfitSummary(activeQuote);
      }
    }))
  )
);

export default useQuoteStore;
