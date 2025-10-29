interface CostInputs {
  materials: number;
  labor: number;
  helpers: number;
  fuel: number;
  marginPercent: number;
}

export const computeProfit = ({ materials, labor, helpers, fuel, marginPercent }: CostInputs) => {
  const totalCost = materials + labor + helpers + fuel;
  const clientPrice = totalCost * (1 + marginPercent / 100);
  const grossProfit = clientPrice - totalCost;
  return {
    totalCost,
    clientPrice,
    grossProfit
  };
};
