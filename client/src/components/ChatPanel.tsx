import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import useQuoteStore from '../store/quoteStore';
import { sendChatMessage, ChatResponse } from '../services/chat';
import { computeLaborSubtotal } from '../utils/calculations';
import { MaterialItem, LaborItem } from '../types/quote';

const messageSchema = z.object({
  prompt: z.string().min(3, 'Describe the scope to receive AI assistance')
});

type MessageForm = z.infer<typeof messageSchema>;

interface ChatPanelProps {
  quoteId?: number;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ quoteId }) => {
  const { setMaterials, setLabor, toggleChatLocked, chatLocked } = useQuoteStore();
  const [history, setHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<MessageForm>({ resolver: zodResolver(messageSchema) });

  const applyResponse = (response: ChatResponse) => {
    const materials: MaterialItem[] = response.services.flatMap((service) =>
      service.materials.map((material) => ({
        item: material.item,
        qty: material.quantity,
        unit: material.unit || 'ea'
      }))
    );
    const labor: LaborItem[] = response.services.map((service) => ({
      description: service.service,
      hours: service.hours,
      rate: service.rate ?? 75,
      total: computeLaborSubtotal(service.rate ?? 75, service.hours)
    }));
    setMaterials(materials);
    setLabor(labor);
  };

  const onSubmit = async ({ prompt }: MessageForm) => {
    setLoading(true);
    const userMessage = { role: 'user' as const, content: prompt };
    try {
      const response = await sendChatMessage(quoteId, [userMessage]);
      setHistory((prev) => [...prev, userMessage, { role: 'assistant', content: response.summary }]);
      applyResponse(response);
    } catch (error) {
      console.error('Chat error', error);
    } finally {
      setLoading(false);
      reset();
    }
  };

  const handleLock = () => {
    toggleChatLocked(true);
  };

  return (
    <aside className="h-full border-l border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Service Chat</h2>
        <button
          onClick={handleLock}
          disabled={chatLocked}
          className="rounded bg-primary px-3 py-1 text-white shadow hover:bg-blue-700"
        >
          Lock Services & Materials
        </button>
      </div>
      <div className="mt-4 flex h-[60vh] flex-col gap-3 overflow-y-auto rounded border border-slate-200 bg-slate-50 p-3">
        {history.length === 0 && <p className="text-sm text-slate-500">Describe the job to generate services and materials.</p>}
        {history.map((message, index) => (
          <div key={`${message.role}-${index}`} className="rounded-lg bg-white p-2 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-400">{message.role === 'assistant' ? 'AI' : 'You'}</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{message.content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-2">
        <textarea
          rows={3}
          className="w-full rounded border border-slate-300 p-2 text-sm focus:border-primary focus:outline-none"
          placeholder="e.g., Install 3 ceiling fans, patch drywall 2 sq ft, paint 150 sq ft"
          {...register('prompt')}
        />
        {errors.prompt && <p className="text-xs text-red-500">{errors.prompt.message}</p>}
        <button
          type="submit"
          className="w-full rounded bg-primary py-2 text-white shadow hover:bg-blue-700"
          disabled={loading || chatLocked}
        >
          {chatLocked ? 'Locked' : loading ? 'Thinking...' : 'Send to AI'}
        </button>
      </form>
    </aside>
  );
};

export default ChatPanel;
