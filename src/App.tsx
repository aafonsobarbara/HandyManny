import React, { useMemo, useState } from 'react';
import { PlusCircle, Settings, Trash2 } from 'lucide-react';
import { useQuoteStore } from './store/QuoteStoreProvider';
import type { QuoteDraft } from './types/quote';
import DashboardList from './components/DashboardList';
import QuoteBuilder from './components/QuoteBuilder';
import SettingsSheet from './components/SettingsSheet';

const App: React.FC = () => {
  const quotes = useQuoteStore((state) => state.quotes);
  const activeQuoteId = useQuoteStore((state) => state.activeQuoteId);
  const addQuote = useQuoteStore((state) => state.addQuote);
  const setActiveQuote = useQuoteStore((state) => state.setActiveQuote);
  const clearAll = useQuoteStore((state) => state.clearAll);
  const [showSettings, setShowSettings] = useState(false);

  const activeQuote = useMemo<QuoteDraft | undefined>(() => {
    return quotes.find((quote) => quote.id === activeQuoteId);
  }, [quotes, activeQuoteId]);

  const handleNewQuote = () => {
    const quote = addQuote({});
    setActiveQuote(quote.id);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-semibold">Handymanny Calculator</h1>
            <p className="text-sm text-slate-500">Professional quote builder for on-site estimates</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Settings className="h-4 w-4" /> Settings
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" /> Clear All Drafts
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-6">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Quotes Dashboard</h2>
            <button
              type="button"
              onClick={handleNewQuote}
              className="inline-flex items-center gap-2 rounded-md bg-primary text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-primary-dark"
            >
              <PlusCircle className="h-4 w-4" /> New Quote
            </button>
          </div>
          <DashboardList
            quotes={quotes}
            activeQuoteId={activeQuoteId}
            onSelect={setActiveQuote}
          />
        </section>
        {activeQuote ? (
          <QuoteBuilder quote={activeQuote} />
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            Select a quote or create a new one to get started.
          </div>
        )}
      </main>
      <SettingsSheet open={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};

export default App;
