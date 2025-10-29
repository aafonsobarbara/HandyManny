import { Configuration, OpenAIApi } from 'openai';

interface ParsedMaterial {
  item: string;
  quantity: number;
  unit?: string;
}

interface ParsedService {
  service: string;
  hours: number;
  rate?: number;
  materials: ParsedMaterial[];
}

export interface ChatResult {
  summary: string;
  services: ParsedService[];
}

const systemPrompt = `You are a handyman estimator. Parse job description into services, hours, materials. Respond in JSON with fields {"summary": string, "services": [{"service": string, "hours": number, "rate"?: number, "materials": [{"item": string, "quantity": number, "unit"?: string}]}]}. Estimate hours realistically for residential work.`;

const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY);

const openai = hasOpenAIKey
  ? new OpenAIApi(
      new Configuration({
        apiKey: process.env.OPENAI_API_KEY
      })
    )
  : null;

const fallbackParser = (prompt: string): ChatResult => {
  const lines = prompt.split(/,|\n/).map((line) => line.trim()).filter(Boolean);
  const services = lines.map((line) => {
    const quantityMatch = line.match(/(\d+(?:\.\d+)?)\s*(sq\s*ft|square feet|ft|fans|outlets|items|lights|rooms)?/i);
    const quantity = quantityMatch ? parseFloat(quantityMatch[1]) : 1;
    const unit = quantityMatch?.[2]?.trim();
    const hours = Math.max(1, Math.round(quantity / 2));
    return {
      service: line.replace(/\d+(?:\.\d+)?\s*(sq\s*ft|square feet|ft|fans|outlets|items|lights|rooms)?/i, '').trim() || line,
      hours,
      rate: 75,
      materials: [
        {
          item: line,
          quantity,
          unit: unit || 'ea'
        }
      ]
    };
  });
  return {
    summary: `Parsed ${services.length} services using fallback parser.`,
    services
  };
};

export const parseServiceChat = async (messages: { role: string; content: string }[]): Promise<ChatResult> => {
  if (!messages.length) {
    throw new Error('No messages provided');
  }

  if (openai) {
    const completion = await openai.createChatCompletion({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ]
    });
    const content = completion.data.choices[0].message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }
    try {
      return JSON.parse(content);
    } catch (error) {
      console.warn('Failed to parse OpenAI response. Falling back.', error);
      return fallbackParser(messages[messages.length - 1].content);
    }
  }

  return fallbackParser(messages[messages.length - 1].content);
};
