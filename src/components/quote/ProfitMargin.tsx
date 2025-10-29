import React from 'react';
import type { QuoteDraft } from '../../types/quote';
import { useQuoteStore } from '../../store/QuoteStoreProvider';
import { formatCurrency } from '../../utils/format';

interface ProfitMarginProps {
  quote: QuoteDraft;
}

const ProfitMargin: React.FC<ProfitMarginProps> = ({ quote }) => {
  const patchQuote = useQuoteStore((state) => state.patchQuote);
  const { financials } = quote;

  const handleMarginChange = (value: string) => {
    const marginPercent = Math.min(Math.max(Number(value) || 0, 0), 100);
    patchQuote(quote.id, {
      financials: {
        ...financials,
        marginPercent
      }
    });
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold">Profit Margin</h3>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Margin %
          <input
            type="number"
            min={0}
            max={100}
            value={financials.marginPercent}
            onChange={(event) => handleMarginChange(event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <Stat label="Total Cost" value={formatCurrency(financials.totalCost)} />
        <Stat label="Client Price" value={formatCurrency(financials.clientPrice)} />
        <Stat label="Gross Profit" value={formatCurrency(financials.grossProfit)} />
        <Stat label="Net Profit" value={formatCurrency(financials.grossProfit)} />
      </div>
    </section>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
    <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
    <p className="text-lg font-semibold text-slate-900">{value}</p>
  </div>
);

export default ProfitMargin;
