import axios from 'axios';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ParsedService {
  service: string;
  hours: number;
  rate?: number;
  materials: Array<{ item: string; quantity: number; unit?: string }>;
}

export interface ChatResponse {
  summary: string;
  services: ParsedService[];
}

export const sendChatMessage = async (quoteId: number | undefined, messages: ChatMessage[]): Promise<ChatResponse> => {
  const response = await axios.post<ChatResponse>('/api/quotes/chat', { quoteId, messages });
  return response.data;
};
