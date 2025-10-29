import { Quote, ProfitSummary } from '../types/quote';

export const calculateProfitSummary = (quote: Quote): ProfitSummary => {
  const materialTotal = quote.materials.reduce((sum, item) => sum + (item.total ?? 0), 0);
  const laborTotal = quote.labor.reduce((sum, item) => sum + (item.total ?? item.rate * item.hours), 0);
  const helperTotal = quote.helperConfig.enabled
    ? quote.helperConfig.helpers * quote.helperConfig.days * quote.helperConfig.dailyRate
    : 0;
  const fuelTotal = (quote.travelConfig.miles ?? 0) * 2 * quote.travelConfig.fuelRate;
  const totalCost = materialTotal + laborTotal + helperTotal + fuelTotal;
  const clientPrice = totalCost * (1 + quote.margin / 100);
  const grossProfit = clientPrice - totalCost;

  return {
    materialTotal,
    laborTotal,
    helperTotal,
    fuelTotal,
    totalCost,
    clientPrice,
    grossProfit,
    margin: quote.margin
  };
};

export const computeLaborSubtotal = (rate: number, hours: number): number => {
  return Math.round(rate * hours * 100) / 100;
};

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
