import React, { createContext, useContext, useMemo } from 'react';
import { useStore } from 'zustand';
import { createQuoteStore } from './createQuoteStore';
import type { QuoteStoreState } from '../types/quote';

const QuoteStoreContext = createContext<ReturnType<typeof createQuoteStore> | null>(null);

export const QuoteStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useMemo(() => createQuoteStore(), []);
  return <QuoteStoreContext.Provider value={store}>{children}</QuoteStoreContext.Provider>;
};

export const useQuoteStore = <T,>(selector: (state: QuoteStoreState) => T): T => {
  const store = useContext(QuoteStoreContext);
  if (!store) {
    throw new Error('QuoteStoreProvider missing');
  }
  return useStore(store, selector);
};

export const useQuoteStoreApi = () => {
  const store = useContext(QuoteStoreContext);
  if (!store) {
    throw new Error('QuoteStoreProvider missing');
  }
  return store;
};
