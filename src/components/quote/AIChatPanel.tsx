import React, { useMemo, useState } from 'react';
import { Send, Lock, RefreshCw, X } from 'lucide-react';
import { requestQuoteStructure } from '../../services/ai';
import type { QuoteDraft, MaterialRow, ServiceRow } from '../../types/quote';
import { useQuoteStore } from '../../store/QuoteStoreProvider';
import { nanoid } from '../../utils/nanoid';

interface AIChatPanelProps {
  quote: QuoteDraft;
  open: boolean;
  onClose: () => void;
  onLock: (materials: MaterialRow[], services: ServiceRow[]) => void;
}

const AIChatPanel: React.FC<AIChatPanelProps> = ({ quote, open, onClose, onLock }) => {
  const settings = useQuoteStore((state) => state.settings);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<{
    materials: MaterialRow[];
    services: ServiceRow[];
  } | null>(null);

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;

  const disabled = !open;

  const canLock = useMemo(() => Boolean(suggestions && suggestions.materials.length > 0), [suggestions]);

  const handleSend = async () => {
    if (!input.trim() || !apiKey) {
      setError(apiKey ? 'Please describe the work to scope.' : 'Missing OpenAI API key. Add VITE_OPENAI_API_KEY to your .env file.');
      return;
    }

    setLoading(true);
    setError(null);
    const nextMessages = [...messages, { role: 'user', content: input.trim() }] as typeof messages;
    setMessages(nextMessages);
    try {
      const result = await requestQuoteStructure(apiKey, input.trim(), messages);
      const materials: MaterialRow[] = result.materials.map((material) => ({
        id: nanoid(),
        item: material.item,
        quantity: Number(material.quantity) || 0,
        unit: material.unit || 'ea'
      }));
      const services: ServiceRow[] = result.services.map((service) => {
        const hours = Number(service.estimatedHours) || 0;
        const rate = settings.defaultRate;
        return {
          id: nanoid(),
          name: service.name,
          hours,
          rate,
          subtotal: rate * hours
        };
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: JSON.stringify(result, null, 2) }]);
      setSuggestions({ materials, services });
      setInput('');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to contact AI service.');
    } finally {
      setLoading(false);
    }
  };

  const handleLock = () => {
    if (suggestions) {
      onLock(suggestions.materials, suggestions.services);
    }
  };

  if (!open) {
    return (
      <aside className="hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:block">
        <div className="text-sm text-slate-500">Start the service chat to scope services and materials.</div>
      </aside>
    );
  }

  return (
    <aside className="flex h-full flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <h3 className="text-base font-semibold">Service Chat</h3>
          <p className="text-xs text-slate-500">Powered by gpt-4o-mini</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100">
          <X className="h-4 w-4" />
        </button>
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm">
        {messages.length === 0 && (
          <p className="text-slate-500">
            Describe the job in natural language. The AI will suggest services, labor hours, and materials.
          </p>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`whitespace-pre-wrap rounded-md px-3 py-2 ${
              message.role === 'user' ? 'bg-orange-50 text-slate-800' : 'bg-slate-900 text-slate-100'
            }`}
          >
            {message.content}
          </div>
        ))}
        {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-600">{error}</div>}
      </div>
      <div className="border-t border-slate-200 p-4">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="e.g. Paint a 200 sq ft bedroom and patch two holes"
          rows={3}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary"
        />
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setMessages([]);
              setSuggestions(null);
              setError(null);
            }}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reset
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLock}
              disabled={!canLock || quote.locked}
              className="inline-flex items-center gap-2 rounded-md border border-primary px-3 py-1.5 text-xs font-semibold text-primary hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Lock className="h-3.5 w-3.5" /> Lock Services &amp; Materials
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={loading || disabled}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span>Thinking…</span>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" /> Send
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AIChatPanel;
