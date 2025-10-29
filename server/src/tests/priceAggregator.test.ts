import { aggregateBestOffers } from '../utils/priceAggregator.js';

describe('aggregateBestOffers', () => {
  it('selects the lowest price offer', () => {
    const result = aggregateBestOffers([
      {
        item: 'Paint',
        qty: 2,
        unit: 'gal',
        offers: [
          { store: 'Home Depot', unitPrice: 35, link: 'https://example.com/hd' },
          { store: 'Tractor Supply', unitPrice: 32, link: 'https://example.com/ts' }
        ]
      }
    ]);

    expect(result[0]).toMatchObject({
      store: 'Tractor Supply',
      unitPrice: 32,
      total: 64
    });
  });

  it('handles missing offers gracefully', () => {
    const result = aggregateBestOffers([
      {
        item: 'Unknown',
        qty: 1,
        offers: []
      }
    ]);

    expect(result[0]).toMatchObject({
      item: 'Unknown',
      store: undefined
    });
  });
});
