export interface MaterialQuote {
  item: string;
  qty: number;
  unit?: string;
  offers: Array<{
    store: string;
    unitPrice: number;
    link: string;
  }>;
}

export interface AggregatedMaterial {
  item: string;
  qty: number;
  unit?: string;
  store?: string;
  unitPrice?: number;
  total?: number;
  link?: string;
}

export const aggregateBestOffers = (materials: MaterialQuote[]): AggregatedMaterial[] => {
  return materials.map((material) => {
    if (!material.offers.length) {
      return {
        item: material.item,
        qty: material.qty,
        unit: material.unit
      };
    }
    const best = material.offers.reduce((lowest, offer) => (offer.unitPrice < lowest.unitPrice ? offer : lowest));
    return {
      item: material.item,
      qty: material.qty,
      unit: material.unit,
      store: best.store,
      unitPrice: best.unitPrice,
      total: best.unitPrice * material.qty,
      link: best.link
    };
  });
};
