import { useState } from 'react';
import useQuoteStore from '../store/quoteStore';
import { requestPriceResearch } from '../services/quotes';
import { formatCurrency } from '../utils/calculations';

const PriceResearchPanel: React.FC = () => {
  const { activeQuote, setMaterials } = useQuoteStore();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleResearch = async () => {
    if (!activeQuote?.id) {
      setMessage('Save the quote first to fetch prices automatically.');
      return;
    }
    try {
      setLoading(true);
      await requestPriceResearch(activeQuote.id);
      setMessage('Price research requested. Refresh materials once ready.');
    } catch (error) {
      console.error(error);
      setMessage('Price lookup failed. Enter prices manually below.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualChange = (index: number, field: 'unitPrice' | 'store' | 'link', value: string) => {
    if (!activeQuote) return;
    const updated = [...activeQuote.materials];
    const target = { ...updated[index], manual: true };
    if (field === 'unitPrice') {
      const numeric = parseFloat(value || '0');
      target.unitPrice = numeric;
      target.total = numeric * target.qty;
    } else {
      target[field] = value;
    }
    updated[index] = target;
    setMaterials(updated);
  };

  const materialTotal = activeQuote?.materials.reduce((sum, item) => sum + (item.total ?? 0), 0) ?? 0;

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Price Research</h3>
        <button
          onClick={handleResearch}
          className="rounded bg-primary px-3 py-1 text-sm font-semibold text-white hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Fetching...' : 'Fetch Prices'}
        </button>
      </div>
      {message && <p className="mt-2 text-xs text-slate-500">{message}</p>}
      <div className="mt-3 space-y-3">
        {activeQuote?.materials.map((material, index) => (
          <div key={`${material.item}-${index}`} className="rounded border border-slate-200 p-3 text-sm">
            <p className="font-medium text-slate-700">{material.item}</p>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
              <label className="block text-xs uppercase text-slate-400">
                Store
                <input
                  className="mt-1 w-full rounded border border-slate-300 p-2 focus:border-primary focus:outline-none"
                  value={material.store || ''}
                  onChange={(event) => handleManualChange(index, 'store', event.target.value)}
                  placeholder="Home Depot"
                />
              </label>
              <label className="block text-xs uppercase text-slate-400">
                Unit Price ($)
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 w-full rounded border border-slate-300 p-2 focus:border-primary focus:outline-none"
                  value={material.unitPrice ?? ''}
                  onChange={(event) => handleManualChange(index, 'unitPrice', event.target.value)}
                />
              </label>
              <label className="block text-xs uppercase text-slate-400">
                Product Link
                <input
                  className="mt-1 w-full rounded border border-slate-300 p-2 focus:border-primary focus:outline-none"
                  value={material.link || ''}
                  onChange={(event) => handleManualChange(index, 'link', event.target.value)}
                  placeholder="https://"
                />
              </label>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Total: <span className="font-semibold text-slate-700">{formatCurrency(material.total ?? 0)}</span>
            </p>
          </div>
        ))}
        {activeQuote && activeQuote.materials.length === 0 && (
          <p className="text-sm text-slate-500">Add services and materials through the chat to research prices.</p>
        )}
      </div>
      <div className="mt-4 flex items-center justify-end border-t pt-3 text-sm font-semibold text-slate-700">
        Materials Total: {formatCurrency(materialTotal)}
      </div>
    </div>
  );
};

export default PriceResearchPanel;
