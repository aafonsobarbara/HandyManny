import { useState } from 'react';
import useQuoteStore from '../store/quoteStore';
import { DEFAULT_TERMS } from '../constants/terms';

const TermsConditions: React.FC = () => {
  const { activeQuote, setTerms } = useQuoteStore();
  const [useSpecial, setUseSpecial] = useState(false);
  const [specialText, setSpecialText] = useState('');

  const handleToggle = (checked: boolean) => {
    setUseSpecial(checked);
    if (!checked) {
      setTerms(DEFAULT_TERMS);
    }
  };

  const handleApply = () => {
    if (useSpecial) {
      const combined = `${DEFAULT_TERMS}\n\n${specialText}`;
      setTerms(combined);
    } else {
      setTerms(DEFAULT_TERMS);
    }
  };

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <h3 className="text-lg font-semibold text-slate-800">Terms & Conditions</h3>
      <div className="mt-3 space-y-3 text-sm text-slate-600">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={useSpecial} onChange={(event) => handleToggle(event.target.checked)} />
          Add special conditions?
        </label>
        {useSpecial && (
          <textarea
            value={specialText}
            onChange={(event) => setSpecialText(event.target.value)}
            rows={4}
            className="w-full rounded border border-slate-300 p-2 focus:border-primary focus:outline-none"
            placeholder="Include payment schedules, premium material instructions, etc."
          />
        )}
        <button
          type="button"
          onClick={handleApply}
          className="inline-flex items-center rounded bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Apply Terms
        </button>
        <div className="rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
          <pre className="whitespace-pre-wrap">{activeQuote?.terms || DEFAULT_TERMS}</pre>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
