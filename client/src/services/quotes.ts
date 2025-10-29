import axios from 'axios';
import { Quote } from '../types/quote';

const client = axios.create({
  baseURL: '/api'
});

export const fetchQuotes = async (): Promise<Quote[]> => {
  const response = await client.get<Quote[]>('/quotes');
  return response.data;
};

export const saveQuote = async (quote: Quote): Promise<Quote> => {
  if (quote.id) {
    const response = await client.put<Quote>(`/quotes/${quote.id}`, quote);
    return response.data;
  }
  const response = await client.post<Quote>('/quotes', quote);
  return response.data;
};

export const markQuoteApproved = async (id: number): Promise<Quote> => {
  const response = await client.post<Quote>(`/quotes/${id}/approve`);
  return response.data;
};

export const requestPriceResearch = async (quoteId: number): Promise<void> => {
  await client.post(`/price-search`, { quoteId });
};

export const requestDistance = async (origin: string, destination: string): Promise<number> => {
  const response = await client.post<{ miles: number }>(`/distance`, { origin, destination });
  return response.data.miles;
};

export const requestPdf = async (quoteId: number): Promise<Blob> => {
  const response = await client.get(`/pdf/${quoteId}`, {
    responseType: 'blob'
  });
  return response.data;
};
