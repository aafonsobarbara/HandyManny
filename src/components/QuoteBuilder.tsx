import React, { useState } from 'react';
import { useQuoteStore } from '../store/QuoteStoreProvider';
import type { QuoteDraft, MaterialRow, ServiceRow } from '../types/quote';
import QuoteDetailsForm from './quote/QuoteDetailsForm';
import AIChatPanel from './quote/AIChatPanel';
import LockedTables from './quote/LockedTables';
import PriceResearch from './quote/PriceResearch';
import LaborAndTravel from './quote/LaborAndTravel';
import ProfitMargin from './quote/ProfitMargin';
import TermsConditions from './quote/TermsConditions';
import QuotePreview from './quote/QuotePreview';

interface QuoteBuilderProps {
  quote: QuoteDraft;
}

const QuoteBuilder: React.FC<QuoteBuilderProps> = ({ quote }) => {
  const patchQuote = useQuoteStore((state) => state.patchQuote);
  const updateQuote = useQuoteStore((state) => state.updateQuote);
  const markApproved = useQuoteStore((state) => state.markApproved);
  const [chatOpen, setChatOpen] = useState(false);

  const handleClientChange = (field: 'clientName' | 'clientPhone') => (value: string) => {
    patchQuote(quote.id, {
      [field]: value
    } as Partial<QuoteDraft>);
  };

  const handleLock = (materials: MaterialRow[], services: ServiceRow[]) => {
    updateQuote(quote.id, (draft) => ({
      ...draft,
      materials,
      services,
      locked: true
    }));
    patchQuote(quote.id, { materials, services, locked: true });
  };

  const handleUnlock = () => {
    updateQuote(quote.id, (draft) => ({
      ...draft,
      locked: false
    }));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="flex flex-col gap-6">
        <QuoteDetailsForm
          quote={quote}
          onClientNameChange={handleClientChange('clientName')}
          onClientPhoneChange={handleClientChange('clientPhone')}
          onStartChat={() => setChatOpen(true)}
        />
        <LockedTables quote={quote} onUnlock={handleUnlock} />
        <PriceResearch quote={quote} />
        <LaborAndTravel quote={quote} />
        <ProfitMargin quote={quote} />
        <TermsConditions quote={quote} />
        <QuotePreview quote={quote} onMarkApproved={() => markApproved(quote.id)} />
      </div>
      <AIChatPanel
        quote={quote}
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        onLock={handleLock}
      />
    </div>
  );
};

export default QuoteBuilder;
