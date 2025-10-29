import useQuoteStore from '../store/quoteStore';
import QuoteForm from '../components/QuoteForm';
import ChatPanel from '../components/ChatPanel';
import MaterialsTable from '../components/MaterialsTable';
import LaborTable from '../components/LaborTable';
import PriceResearchPanel from '../components/PriceResearchPanel';
import TermsConditions from '../components/TermsConditions';
import QuotePreview from '../components/QuotePreview';
import { markQuoteApproved } from '../services/quotes';

const Dashboard: React.FC = () => {
  const { quotes, createDraft, activeQuote, setQuotes, updateActiveQuote } = useQuoteStore();

  const handleNewQuote = () => {
    createDraft();
  };

  const handleApprove = async () => {
    if (!activeQuote?.id) return;
    const updated = await markQuoteApproved(activeQuote.id);
    setQuotes((prev) => prev.map((quote) => (quote.id === updated.id ? updated : quote)));
    updateActiveQuote({ status: 'Approved' });
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:px-8">
      <header className="flex flex-col gap-4 rounded-lg bg-white p-6 shadow md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Handyman Quote Generator</h1>
          <p className="text-sm text-slate-500">Craft professional quotes with AI-assisted workflows.</p>
        </div>
        <button
          onClick={handleNewQuote}
          className="inline-flex items-center justify-center rounded bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          + New Quote
        </button>
      </header>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="col-span-1 md:col-span-2 rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-semibold text-slate-700">Past Quotes</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {quotes
              .slice()
              .sort((a, b) => {
                const dateA = new Date(a.updatedAt || a.quoteDate || 0).getTime();
                const dateB = new Date(b.updatedAt || b.quoteDate || 0).getTime();
                return dateB - dateA;
              })
              .map((quote) => (
                <li key={quote.id || Math.random()} className="flex justify-between rounded border border-slate-200 p-3">
                  <div>
                    <p className="font-semibold text-slate-700">{quote.clientName || 'Untitled'}</p>
                    <p className="text-xs text-slate-500">{new Date(quote.quoteDate).toLocaleDateString()}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-600">
                    {quote.status}
                  </span>
                </li>
              ))}
            {quotes.length === 0 && <li className="text-sm text-slate-500">No quotes yet. Create your first draft.</li>}
          </ul>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-semibold text-slate-700">Quote Status</h2>
          <p className="mt-2 text-sm text-slate-500">
            {activeQuote ? `Current quote is ${activeQuote.status}.` : 'Start a new quote to begin.'}
          </p>
          <button
            onClick={handleApprove}
            disabled={!activeQuote || activeQuote.status === 'Approved'}
            className="mt-4 inline-flex items-center rounded bg-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:bg-slate-300"
          >
            Mark as Approved
          </button>
        </div>
      </section>
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <QuoteForm />
          <MaterialsTable />
          <LaborTable />
          <PriceResearchPanel />
          <TermsConditions />
        </div>
        <div className="lg:col-span-1">
          <ChatPanel quoteId={activeQuote?.id} />
          <div className="mt-6">
            <QuotePreview />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
