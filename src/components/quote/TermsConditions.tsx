import React from 'react';
import type { QuoteDraft } from '../../types/quote';
import { useQuoteStore } from '../../store/QuoteStoreProvider';
import { DEFAULT_TERMS } from '../../constants/terms';

interface TermsConditionsProps {
  quote: QuoteDraft;
}

const TermsConditions: React.FC<TermsConditionsProps> = ({ quote }) => {
  const patchQuote = useQuoteStore((state) => state.patchQuote);
  const settings = useQuoteStore((state) => state.settings);

  const effectiveDefault = settings.defaultTerms || DEFAULT_TERMS;

  const handleToggle = (checked: boolean) => {
    patchQuote(quote.id, {
      terms: {
        ...quote.terms,
        useCustom: checked
      }
    });
  };

  const handleCustomChange = (value: string) => {
    patchQuote(quote.id, {
      terms: {
        ...quote.terms,
        customText: value
      }
    });
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold">Terms &amp; Conditions</h3>
      <label className="mt-3 flex items-center gap-3 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={quote.terms.useCustom}
          onChange={(event) => handleToggle(event.target.checked)}
        />
        Add special conditions?
      </label>
      {quote.terms.useCustom && (
        <textarea
          value={quote.terms.customText}
          onChange={(event) => handleCustomChange(event.target.value)}
          className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          rows={4}
          placeholder="Enter special terms and conditions"
        />
      )}
      <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <div className="prose prose-sm max-w-none">
          <p><strong>Default Terms Preview</strong></p>
          <pre className="whitespace-pre-wrap text-xs text-slate-600">{effectiveDefault}</pre>
          {quote.terms.useCustom && quote.terms.customText && (
            <>
              <p className="mt-3 font-semibold">Special Conditions</p>
              <pre className="whitespace-pre-wrap text-xs text-slate-700">{quote.terms.customText}</pre>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default TermsConditions;
