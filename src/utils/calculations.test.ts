import { describe, expect, it } from 'vitest';
import { calculateFuel, calculateFinancials } from './calculations';
import type { QuoteDraft } from '../types/quote';

const createQuote = (): QuoteDraft => ({
  id: 'test',
  clientName: 'Client',
  clientPhone: '123',
  quoteDate: '2024-01-01',
  status: 'Draft',
  materials: [
    { id: 'm1', item: 'Paint', quantity: 2, unit: 'gal', unitPrice: 30, totalPrice: 60 },
    { id: 'm2', item: 'Brush', quantity: 3, unit: 'ea', unitPrice: 5, totalPrice: 15 }
  ],
  services: [
    { id: 's1', name: 'Painting', hours: 8, rate: 75, subtotal: 600 }
  ],
  helperConfig: {
    mode: 'helpers',
    helpersCount: 1,
    days: 2,
    dailyRate: 150
  },
  distanceMiles: 50,
  gasRate: 0.2,
  financials: {
    materialsTotal: 0,
    laborTotal: 0,
    helpersTotal: 0,
    fuelTotal: 0,
    totalCost: 0,
    marginPercent: 25,
    clientPrice: 0,
    grossProfit: 0
  },
  terms: {
    useCustom: false,
    customText: ''
  },
  locked: true,
  priceResearchCompleted: true
});

describe('calculateFuel', () => {
  it('returns distance multiplied by gas rate', () => {
    const quote = createQuote();
    expect(calculateFuel(quote)).toBeCloseTo(10);
  });
});

describe('calculateFinancials', () => {
  it('aggregates totals and applies margin', () => {
    const quote = createQuote();
    const result = calculateFinancials(quote);
    expect(result.materialsTotal).toBe(75);
    expect(result.laborTotal).toBe(600);
    expect(result.helpersTotal).toBe(300);
    expect(result.fuelTotal).toBe(10);
    expect(result.totalCost).toBe(985);
    expect(result.marginPercent).toBe(25);
    expect(result.clientPrice).toBeCloseTo(1231.25);
    expect(result.grossProfit).toBeCloseTo(246.25);
  });

  it('handles zero margin gracefully', () => {
    const quote = createQuote();
    quote.financials.marginPercent = 0;
    const result = calculateFinancials(quote);
    expect(result.clientPrice).toBeCloseTo(result.totalCost);
  });
});
