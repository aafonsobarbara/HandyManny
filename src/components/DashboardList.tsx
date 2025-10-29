import React from 'react';
import { QuoteDraft } from '../types/quote';
import { formatCurrency } from '../utils/format';

interface DashboardListProps {
  quotes: QuoteDraft[];
  activeQuoteId?: string;
  onSelect: (id: string) => void;
}

const DashboardList: React.FC<DashboardListProps> = ({ quotes, activeQuoteId, onSelect }) => {
  if (quotes.length === 0) {
    return <p className="text-sm text-slate-500">No drafts yet. Create your first quote to get started.</p>;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {quotes.map((quote) => {
        const total = quote.financials?.clientPrice ?? 0;
        return (
          <button
            key={quote.id}
            type="button"
            onClick={() => onSelect(quote.id)}
            className={`rounded-lg border px-4 py-3 text-left shadow-sm transition ${
              activeQuoteId === quote.id
                ? 'border-primary bg-orange-50'
                : 'border-slate-200 hover:border-primary/50 hover:bg-orange-50/40'
            }`}
          >
            <div className="flex items-center justify-between text-sm font-medium text-slate-500">
              <span>{quote.status}</span>
              <span>{new Date(quote.quoteDate).toLocaleDateString()}</span>
            </div>
            <div className="mt-1 text-lg font-semibold text-slate-800">
              {quote.clientName || 'Unnamed client'}
            </div>
            <div className="text-sm text-slate-500">Total: {formatCurrency(total)}</div>
          </button>
        );
      })}
    </div>
  );
};

export default DashboardList;
