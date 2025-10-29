import React, { useMemo, useState } from 'react';
import { ExternalLink, RefreshCw, Search } from 'lucide-react';
import type { QuoteDraft } from '../../types/quote';
import { useQuoteStore } from '../../store/QuoteStoreProvider';
import { searchMaterialPrices, MaterialPriceQuote } from '../../services/pricing';
import { formatCurrency } from '../../utils/format';

interface PriceResearchProps {
  quote: QuoteDraft;
}

const PriceResearch: React.FC<PriceResearchProps> = ({ quote }) => {
  const patchQuote = useQuoteStore((state) => state.patchQuote);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceMap, setPriceMap] = useState<Record<string, MaterialPriceQuote[]>>({});

  const materialTotal = useMemo(() => {
    return quote.materials.reduce((acc, material) => acc + (material.totalPrice ?? 0), 0);
  }, [quote.materials]);

  const handleResearch = async () => {
    setLoading(true);
    setError(null);
    const nextPriceMap: Record<string, MaterialPriceQuote[]> = {};
    const updatedMaterials = [...quote.materials];

    try {
      for (let index = 0; index < quote.materials.length; index += 1) {
        const material = quote.materials[index];
        try {
          const quotes = await searchMaterialPrices(material);
          nextPriceMap[material.id] = quotes;
          const validQuotes = quotes.filter((item) => typeof item.unitPrice === 'number' && !Number.isNaN(item.unitPrice));
          if (validQuotes.length > 0) {
            const best = validQuotes.reduce((prev, current) =>
              (prev.unitPrice ?? Infinity) <= (current.unitPrice ?? Infinity) ? prev : current
            );
            updatedMaterials[index] = {
              ...material,
              store: best.store,
              unitPrice: best.unitPrice,
              totalPrice: (best.unitPrice ?? 0) * material.quantity,
              link: best.link,
              manualOverride: false
            };
          }
        } catch (innerError) {
          console.warn('Price search failed', innerError);
          nextPriceMap[material.id] = [];
        }
      }
      setPriceMap(nextPriceMap);
      patchQuote(quote.id, { materials: updatedMaterials, priceResearchCompleted: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error during price lookup');
    } finally {
      setLoading(false);
    }
  };

  const handleManualPrice = (materialId: string, value: string) => {
    const unitPrice = Number(value) || 0;
    const updated = quote.materials.map((material) =>
      material.id === materialId
        ? {
            ...material,
            unitPrice,
            totalPrice: unitPrice * material.quantity,
            manualOverride: true
          }
        : material
    );
    patchQuote(quote.id, { materials: updated, priceResearchCompleted: true });
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Material Price Research</h3>
          <p className="text-sm text-slate-500">Pull live pricing from Home Depot and Tractor Supply or enter manually.</p>
        </div>
        <button
          type="button"
          onClick={handleResearch}
          disabled={loading || quote.materials.length === 0}
          className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" /> Searching…
            </>
          ) : (
            <>
              <Search className="h-4 w-4" /> Research Prices
            </>
          )}
        </button>
      </div>
      {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-slate-600">Item</th>
              <th className="px-3 py-2 text-left font-medium text-slate-600">Qty</th>
              <th className="px-3 py-2 text-left font-medium text-slate-600">Store</th>
              <th className="px-3 py-2 text-left font-medium text-slate-600">Unit Price</th>
              <th className="px-3 py-2 text-left font-medium text-slate-600">Total</th>
              <th className="px-3 py-2 text-left font-medium text-slate-600">Link</th>
              <th className="px-3 py-2 text-left font-medium text-slate-600">Manual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {quote.materials.map((material) => {
              const quotes = priceMap[material.id] ?? [];
              return (
                <React.Fragment key={material.id}>
                  <tr>
                    <td className="px-3 py-2 font-medium text-slate-700">{material.item}</td>
                    <td className="px-3 py-2">{material.quantity}</td>
                    <td className="px-3 py-2">{material.store ?? '—'}</td>
                    <td className="px-3 py-2">{material.unitPrice ? formatCurrency(material.unitPrice) : '—'}</td>
                    <td className="px-3 py-2 font-semibold text-slate-800">
                      {material.totalPrice ? formatCurrency(material.totalPrice) : '—'}
                    </td>
                    <td className="px-3 py-2">
                      {material.link ? (
                        <a
                          href={material.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          View <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        value={material.unitPrice ?? ''}
                        onChange={(event) => handleManualPrice(material.id, event.target.value)}
                        className="w-24 rounded-md border border-slate-200 px-2 py-1"
                        placeholder="$"
                      />
                    </td>
                  </tr>
                  {quotes.length > 0 && (
                    <tr>
                      <td colSpan={7} className="bg-slate-50 px-3 py-2">
                        <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                          {quotes.map((quoteResult) => (
                            <div key={`${material.id}-${quoteResult.store}`} className="rounded-md border border-slate-200 bg-white px-2 py-1">
                              <span className="font-semibold">{quoteResult.store}</span>{' '}
                              {quoteResult.unitPrice ? formatCurrency(quoteResult.unitPrice) : 'No price'}
                              {quoteResult.error && <span className="ml-2 text-red-500">{quoteResult.error}</span>}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {quote.materials.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-center text-slate-500" colSpan={7}>
                  Generate materials first to research prices.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} className="px-3 py-3 text-right text-sm font-semibold text-slate-600">
                Materials Total
              </td>
              <td className="px-3 py-3 text-left text-base font-bold text-slate-900">{formatCurrency(materialTotal)}</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
};

export default PriceResearch;
