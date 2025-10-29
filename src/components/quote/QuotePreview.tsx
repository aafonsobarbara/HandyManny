import React, { useMemo, useRef, useState } from 'react';
import { FileDown, CheckCircle } from 'lucide-react';
import type { QuoteDraft } from '../../types/quote';
import { useQuoteStore } from '../../store/QuoteStoreProvider';
import { formatCurrency } from '../../utils/format';
import { DEFAULT_TERMS } from '../../constants/terms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface QuotePreviewProps {
  quote: QuoteDraft;
  onMarkApproved: () => void;
}

const QuotePreview: React.FC<QuotePreviewProps> = ({ quote, onMarkApproved }) => {
  const settings = useQuoteStore((state) => state.settings);
  const previewRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const termsText = useMemo(() => {
    const base = settings.defaultTerms || DEFAULT_TERMS;
    if (quote.terms.useCustom && quote.terms.customText) {
      return `${base}\n\nSpecial Conditions:\n${quote.terms.customText}`;
    }
    return base;
  }, [settings.defaultTerms, quote.terms]);

  const handlePdf = async () => {
    if (!previewRef.current) return;
    setGenerating(true);
    setError(null);
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
      const imgWidth = canvas.width * ratio;
      const imgHeight = canvas.height * ratio;
      pdf.addImage(imgData, 'PNG', (pageWidth - imgWidth) / 2, 20, imgWidth, imgHeight);
      pdf.save(`${quote.clientName || 'quote'}-${quote.id}.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setGenerating(false);
    }
  };

  const materialsTotal = quote.financials.materialsTotal;
  const laborSummary = quote.financials.laborTotal + quote.financials.helpersTotal;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Quote Preview &amp; Delivery</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePdf}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileDown className="h-4 w-4" /> {generating ? 'Generating…' : 'Generate PDF'}
          </button>
          <button
            type="button"
            onClick={onMarkApproved}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
          >
            <CheckCircle className="h-4 w-4" /> Mark as Approved
          </button>
        </div>
      </div>
      {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
      <div ref={previewRef} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <header className="flex flex-col gap-2 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary text-lg font-bold text-primary">
              {settings.companyName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="text-xl font-semibold text-slate-900">{settings.companyName}</h4>
              <p className="text-sm text-slate-500">{settings.companyPhone}</p>
              <p className="text-sm text-slate-500">{settings.companyEmail}</p>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            <p><strong>Quote ID:</strong> {quote.id}</p>
            <p><strong>Date:</strong> {quote.quoteDate}</p>
            <p><strong>Status:</strong> {quote.status}</p>
          </div>
        </header>
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-800">Client</p>
            <p>{quote.clientName || '—'}</p>
            <p>{quote.clientPhone || '—'}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-800">Totals</p>
            <p>Materials: {formatCurrency(materialsTotal)}</p>
            <p>Labor &amp; Helpers: {formatCurrency(laborSummary)}</p>
            <p>Fuel: {formatCurrency(quote.financials.fuelTotal)}</p>
            <p className="text-base font-semibold text-slate-900">Client Price: {formatCurrency(quote.financials.clientPrice)}</p>
          </div>
        </section>
        <section>
          <h4 className="mb-2 text-sm font-semibold text-slate-600">Materials</h4>
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Item</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Qty</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Store</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Unit Price</th>
                <th className="px-3 py-2 text-right font-medium text-slate-600">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quote.materials.map((material) => (
                <tr key={material.id}>
                  <td className="px-3 py-2 text-slate-700">{material.item}</td>
                  <td className="px-3 py-2">{material.quantity} {material.unit}</td>
                  <td className="px-3 py-2">{material.store ?? '—'}</td>
                  <td className="px-3 py-2">{material.unitPrice ? formatCurrency(material.unitPrice) : '—'}</td>
                  <td className="px-3 py-2 text-right font-semibold text-slate-800">
                    {material.totalPrice ? formatCurrency(material.totalPrice) : '—'}
                  </td>
                </tr>
              ))}
              {quote.materials.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-3 text-center text-slate-500">
                    No materials listed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
        <section>
          <h4 className="mb-2 text-sm font-semibold text-slate-600">Labor Summary</h4>
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Service</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Rate</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Hours</th>
                <th className="px-3 py-2 text-right font-medium text-slate-600">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quote.services.map((service) => (
                <tr key={service.id}>
                  <td className="px-3 py-2 text-slate-700">{service.name}</td>
                  <td className="px-3 py-2">{formatCurrency(service.rate)}/h</td>
                  <td className="px-3 py-2">{service.hours}</td>
                  <td className="px-3 py-2 text-right font-semibold text-slate-800">{formatCurrency(service.subtotal)}</td>
                </tr>
              ))}
              {quote.helperConfig.mode === 'helpers' && quote.helperConfig.helpersCount > 0 && (
                <tr>
                  <td className="px-3 py-2 text-slate-700">Helpers</td>
                  <td className="px-3 py-2">{formatCurrency(quote.helperConfig.dailyRate)}/day</td>
                  <td className="px-3 py-2">{`${quote.helperConfig.helpersCount} helpers × ${quote.helperConfig.days} days`}</td>
                  <td className="px-3 py-2 text-right font-semibold text-slate-800">{formatCurrency(quote.financials.helpersTotal)}</td>
                </tr>
              )}
              {quote.distanceMiles > 0 && (
                <tr>
                  <td className="px-3 py-2 text-slate-700">Fuel</td>
                  <td className="px-3 py-2">{formatCurrency(quote.gasRate)}/mi</td>
                  <td className="px-3 py-2">{quote.distanceMiles} mi</td>
                  <td className="px-3 py-2 text-right font-semibold text-slate-800">{formatCurrency(quote.financials.fuelTotal)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
        <section>
          <h4 className="mb-2 text-sm font-semibold text-slate-600">Terms &amp; Conditions</h4>
          <pre className="whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">{termsText}</pre>
        </section>
      </div>
    </section>
  );
};

export default QuotePreview;
