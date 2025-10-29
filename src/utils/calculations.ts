import { QuoteDraft, QuoteFinancials } from '../types/quote';

export interface LaborSummaryLine {
  description: string;
  rateLabel: string;
  quantityLabel: string;
  total: number;
}

export const sumMaterials = (quote: QuoteDraft): number =>
  quote.materials.reduce((acc, row) => acc + (row.totalPrice ?? 0), 0);

export const sumLabor = (quote: QuoteDraft): number =>
  quote.services.reduce((acc, service) => acc + service.subtotal, 0);

export const sumHelpers = (quote: QuoteDraft): number =>
  quote.helperConfig.mode === 'helpers'
    ? quote.helperConfig.helpersCount * quote.helperConfig.days * quote.helperConfig.dailyRate
    : 0;

export const calculateFuel = (quote: QuoteDraft): number =>
  quote.distanceMiles * quote.gasRate;

export const calculateFinancials = (quote: QuoteDraft): QuoteFinancials => {
  const materialsTotal = sumMaterials(quote);
  const laborTotal = sumLabor(quote);
  const helpersTotal = sumHelpers(quote);
  const fuelTotal = calculateFuel(quote);
  const totalCost = materialsTotal + laborTotal + helpersTotal + fuelTotal;
  const marginPercent = quote.financials?.marginPercent ?? 0;
  const clientPrice = totalCost * (1 + marginPercent / 100);
  const grossProfit = clientPrice - totalCost;

  return {
    materialsTotal,
    laborTotal,
    helpersTotal,
    fuelTotal,
    totalCost,
    marginPercent,
    clientPrice,
    grossProfit
  };
};

export const computeLaborSummary = (quote: QuoteDraft): LaborSummaryLine[] => {
  const serviceLines = quote.services.map((service) => ({
    description: service.name,
    rateLabel: `$${service.rate.toFixed(2)}/h`,
    quantityLabel: `${service.hours} h`,
    total: service.subtotal
  }));

  const helperLine = quote.helperConfig.mode === 'helpers' &&
    quote.helperConfig.helpersCount > 0 &&
    quote.helperConfig.days > 0
      ? [{
          description: 'Helpers',
          rateLabel: `$${quote.helperConfig.dailyRate.toFixed(2)}/day`,
          quantityLabel: `${quote.helperConfig.helpersCount} helpers × ${quote.helperConfig.days} days`,
          total: sumHelpers(quote)
        }]
      : [];

  const fuelLine = quote.distanceMiles > 0
    ? [{
        description: 'Fuel',
        rateLabel: `$${quote.gasRate.toFixed(2)}/mi`,
        quantityLabel: `${quote.distanceMiles} mi`,
        total: calculateFuel(quote)
      }]
    : [];

  return [...serviceLines, ...helperLine, ...fuelLine];
};
