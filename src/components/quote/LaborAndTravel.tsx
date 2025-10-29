import React from 'react';
import type { QuoteDraft } from '../../types/quote';
import { useQuoteStore } from '../../store/QuoteStoreProvider';
import { computeLaborSummary } from '../../utils/calculations';
import { formatCurrency } from '../../utils/format';

interface LaborAndTravelProps {
  quote: QuoteDraft;
}

const LaborAndTravel: React.FC<LaborAndTravelProps> = ({ quote }) => {
  const patchQuote = useQuoteStore((state) => state.patchQuote);

  const handleHelperModeChange = (mode: 'solo' | 'helpers') => {
    patchQuote(quote.id, {
      helperConfig: {
        ...quote.helperConfig,
        mode
      }
    });
  };

  const updateHelperField = (field: 'helpersCount' | 'days' | 'dailyRate', value: string) => {
    patchQuote(quote.id, {
      helperConfig: {
        ...quote.helperConfig,
        [field]: Number(value) || 0
      }
    });
  };

  const handleDistanceChange = (value: string) => {
    patchQuote(quote.id, {
      distanceMiles: Number(value) || 0
    });
  };

  const handleGasRateChange = (value: string) => {
    patchQuote(quote.id, {
      gasRate: Number(value) || 0
    });
  };

  const summary = computeLaborSummary(quote);
  const financials = quote.financials;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold">Labor &amp; Travel</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-slate-600">Crew Setup</span>
            <div className="mt-2 flex gap-4 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name={`crew-${quote.id}`}
                  checked={quote.helperConfig.mode === 'solo'}
                  onChange={() => handleHelperModeChange('solo')}
                />
                Solo
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name={`crew-${quote.id}`}
                  checked={quote.helperConfig.mode === 'helpers'}
                  onChange={() => handleHelperModeChange('helpers')}
                />
                With Helpers
              </label>
            </div>
          </div>
          {quote.helperConfig.mode === 'helpers' && (
            <div className="grid gap-3 md:grid-cols-3">
              <label className="flex flex-col gap-1 text-sm text-slate-600">
                # Helpers
                <input
                  type="number"
                  min={0}
                  value={quote.helperConfig.helpersCount}
                  onChange={(event) => updateHelperField('helpersCount', event.target.value)}
                  className="rounded-md border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-600">
                # Days
                <input
                  type="number"
                  min={0}
                  value={quote.helperConfig.days}
                  onChange={(event) => updateHelperField('days', event.target.value)}
                  className="rounded-md border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-600">
                Daily Rate ($)
                <input
                  type="number"
                  min={0}
                  value={quote.helperConfig.dailyRate}
                  onChange={(event) => updateHelperField('dailyRate', event.target.value)}
                  className="rounded-md border border-slate-300 px-3 py-2"
                />
              </label>
            </div>
          )}
        </div>
        <div className="space-y-3">
          <label className="flex flex-col gap-1 text-sm text-slate-600">
            Round-trip Distance (miles)
            <input
              type="number"
              min={0}
              value={quote.distanceMiles}
              onChange={(event) => handleDistanceChange(event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-600">
            Gas Rate ($/mile)
            <input
              type="number"
              min={0}
              step={0.01}
              value={quote.gasRate}
              onChange={(event) => handleGasRateChange(event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
        </div>
      </div>
      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-slate-600">Description</th>
              <th className="px-3 py-2 text-left font-medium text-slate-600">Rate</th>
              <th className="px-3 py-2 text-left font-medium text-slate-600">Qty/Hours</th>
              <th className="px-3 py-2 text-right font-medium text-slate-600">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {summary.map((line, index) => (
              <tr key={index}>
                <td className="px-3 py-2 text-slate-700">{line.description}</td>
                <td className="px-3 py-2">{line.rateLabel}</td>
                <td className="px-3 py-2">{line.quantityLabel}</td>
                <td className="px-3 py-2 text-right font-semibold text-slate-800">{formatCurrency(line.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50">
              <td colSpan={3} className="px-3 py-2 text-right text-sm font-semibold text-slate-600">
                Labor Total
              </td>
              <td className="px-3 py-2 text-right text-base font-bold text-slate-900">{formatCurrency(financials.laborTotal)}</td>
            </tr>
            <tr className="bg-slate-50">
              <td colSpan={3} className="px-3 py-2 text-right text-sm font-semibold text-slate-600">
                Helpers Total
              </td>
              <td className="px-3 py-2 text-right text-base font-bold text-slate-900">{formatCurrency(financials.helpersTotal)}</td>
            </tr>
            <tr className="bg-slate-50">
              <td colSpan={3} className="px-3 py-2 text-right text-sm font-semibold text-slate-600">
                Fuel Total
              </td>
              <td className="px-3 py-2 text-right text-base font-bold text-slate-900">{formatCurrency(financials.fuelTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
};

export default LaborAndTravel;
