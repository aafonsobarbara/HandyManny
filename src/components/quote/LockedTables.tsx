import React from 'react';
import { Unlock } from 'lucide-react';
import type { QuoteDraft } from '../../types/quote';
import { useQuoteStore } from '../../store/QuoteStoreProvider';
import { formatCurrency } from '../../utils/format';

interface LockedTablesProps {
  quote: QuoteDraft;
  onUnlock: () => void;
}

const LockedTables: React.FC<LockedTablesProps> = ({ quote, onUnlock }) => {
  const patchQuote = useQuoteStore((state) => state.patchQuote);

  const handleMaterialChange = (index: number, field: 'item' | 'quantity' | 'unit', value: string) => {
    if (quote.locked) return;
    const updated = [...quote.materials];
    const material = { ...updated[index] };
    if (field === 'quantity') {
      material.quantity = Number(value) || 0;
    } else {
      (material as any)[field] = value;
    }
    updated[index] = material;
    patchQuote(quote.id, { materials: updated });
  };

  const handleServiceChange = (index: number, field: 'name' | 'hours' | 'rate', value: string) => {
    if (quote.locked && field !== 'rate') return;
    const updated = [...quote.services];
    const service = { ...updated[index] };
    if (field === 'hours' || field === 'rate') {
      (service as any)[field] = Number(value) || 0;
    } else {
      service.name = value;
    }
    service.subtotal = service.hours * service.rate;
    updated[index] = service;
    patchQuote(quote.id, { services: updated });
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Services &amp; Materials</h3>
        {quote.locked && (
          <button
            type="button"
            onClick={onUnlock}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            <Unlock className="h-3.5 w-3.5" /> Unlock to Revise
          </button>
        )}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h4 className="mb-2 text-sm font-semibold text-slate-600">Materials</h4>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Item</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Qty</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quote.materials.map((material, index) => (
                  <tr key={material.id}>
                    <td className="px-3 py-2">
                      {quote.locked ? (
                        material.item
                      ) : (
                        <input
                          value={material.item}
                          onChange={(event) => handleMaterialChange(index, 'item', event.target.value)}
                          className="w-full rounded-md border border-slate-200 px-2 py-1"
                        />
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {quote.locked ? (
                        material.quantity
                      ) : (
                        <input
                          type="number"
                          value={material.quantity}
                          onChange={(event) => handleMaterialChange(index, 'quantity', event.target.value)}
                          className="w-full rounded-md border border-slate-200 px-2 py-1"
                        />
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {quote.locked ? (
                        material.unit
                      ) : (
                        <input
                          value={material.unit}
                          onChange={(event) => handleMaterialChange(index, 'unit', event.target.value)}
                          className="w-full rounded-md border border-slate-200 px-2 py-1"
                        />
                      )}
                    </td>
                  </tr>
                ))}
                {quote.materials.length === 0 && (
                  <tr>
                    <td className="px-3 py-4 text-center text-slate-500" colSpan={3}>
                      No materials yet. Use the chat to generate a list.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold text-slate-600">Labor Services</h4>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Service</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Est. Hours</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Rate ($/h)</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quote.services.map((service, index) => (
                  <tr key={service.id}>
                    <td className="px-3 py-2">
                      {quote.locked ? (
                        service.name
                      ) : (
                        <input
                          value={service.name}
                          onChange={(event) => handleServiceChange(index, 'name', event.target.value)}
                          className="w-full rounded-md border border-slate-200 px-2 py-1"
                        />
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={service.hours}
                        onChange={(event) => handleServiceChange(index, 'hours', event.target.value)}
                        className="w-full rounded-md border border-slate-200 px-2 py-1"
                        disabled={quote.locked}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={service.rate}
                        onChange={(event) => handleServiceChange(index, 'rate', event.target.value)}
                        className="w-full rounded-md border border-slate-200 px-2 py-1"
                      />
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-slate-700">
                      {formatCurrency(service.subtotal)}
                    </td>
                  </tr>
                ))}
                {quote.services.length === 0 && (
                  <tr>
                    <td className="px-3 py-4 text-center text-slate-500" colSpan={4}>
                      No services yet. Use the chat to generate estimates.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LockedTables;
