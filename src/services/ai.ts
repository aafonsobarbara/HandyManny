export interface ServiceSuggestion {
  name: string;
  estimatedHours: number;
}

export interface MaterialSuggestion {
  item: string;
  quantity: number;
  unit: string;
}

export interface QuoteAIResponse {
  services: ServiceSuggestion[];
  materials: MaterialSuggestion[];
  reasoning?: string;
}

export const AI_SYSTEM_PROMPT = {
  role: 'system',
  content: `You are Handymanny, an expert handyman estimator. Convert the user's description into a structured JSON object.
Respond with ONLY valid JSON matching this TypeScript interface:
{
  "services": {"name": string; "estimatedHours": number;}[];
  "materials": {"item": string; "quantity": number; "unit": string;}[];
  "reasoning"?: string;
}
All hour and quantity values must be numeric. Use concise service names and standard US customary units.`
};

export async function requestQuoteStructure(
  apiKey: string,
  userPrompt: string,
  previousMessages: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<QuoteAIResponse> {
  const messages = [AI_SYSTEM_PROMPT, ...previousMessages, { role: 'user', content: userPrompt }];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.2,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errorText = await response.text();
      if (errorText) {
        try {
          const errorJson = JSON.parse(errorText);
          errorDetail =
            typeof errorJson?.error?.message === 'string'
              ? errorJson.error.message
              : errorText;
        } catch {
          errorDetail = errorText;
        }
      }
    } catch {
      // Ignore parsing issues and fall back to generic messaging
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      const waitMessage = retryAfter
        ? `Please wait ${retryAfter} seconds and try again.`
        : 'Please wait a moment and try again.';
      throw new Error(`The AI service is currently rate limiting requests. ${waitMessage}`);
    }

    const detailSuffix = errorDetail ? `: ${errorDetail}` : '';
    throw new Error(`AI request failed with status ${response.status}${detailSuffix}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Missing AI response content');
  }

  try {
    const parsed = JSON.parse(content) as QuoteAIResponse;
    return parsed;
  } catch (error) {
    throw new Error('Failed to parse AI response JSON');
  }
}
