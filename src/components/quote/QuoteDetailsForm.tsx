import React from 'react';
import type { QuoteDraft } from '../../types/quote';

interface QuoteDetailsFormProps {
  quote: QuoteDraft;
  onClientNameChange: (value: string) => void;
  onClientPhoneChange: (value: string) => void;
  onStartChat: () => void;
}

const QuoteDetailsForm: React.FC<QuoteDetailsFormProps> = ({
  quote,
  onClientNameChange,
  onClientPhoneChange,
  onStartChat
}) => {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Client Details</h3>
          <p className="text-sm text-slate-500">Collect contact info before starting the AI scoping chat.</p>
        </div>
        <button
          type="button"
          onClick={onStartChat}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark"
        >
          Start Service Chat
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
          Client Name
          <input
            required
            value={quote.clientName}
            onChange={(event) => onClientNameChange(event.target.value)}
            placeholder="Enter full name"
            className="rounded-md border border-slate-300 px-3 py-2 text-base text-slate-900 focus:border-primary"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
          Client Phone
          <input
            required
            value={quote.clientPhone}
            onChange={(event) => onClientPhoneChange(event.target.value)}
            placeholder="(555) 123-4567"
            className="rounded-md border border-slate-300 px-3 py-2 text-base text-slate-900 focus:border-primary"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
          Quote Date
          <input
            readOnly
            value={quote.quoteDate}
            className="rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-base text-slate-500"
          />
        </label>
      </div>
    </section>
  );
};

export default QuoteDetailsForm;
