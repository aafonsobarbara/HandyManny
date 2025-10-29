import { computeProfit } from '../utils/profit.js';

describe('computeProfit', () => {
  it('calculates total cost and profit with margin', () => {
    const result = computeProfit({
      materials: 500,
      labor: 400,
      helpers: 200,
      fuel: 50,
      marginPercent: 25
    });

    expect(result.totalCost).toBe(1150);
    expect(result.clientPrice).toBeCloseTo(1437.5);
    expect(result.grossProfit).toBeCloseTo(287.5);
  });
});
