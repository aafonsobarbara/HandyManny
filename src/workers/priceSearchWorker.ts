export interface PriceSearchJob {
  requestId: string;
  query: string;
  store: 'Home Depot' | 'Tractor Supply';
}

export interface PriceSearchResult {
  requestId: string;
  success: boolean;
  store: PriceSearchJob['store'];
  unitPrice?: number;
  link?: string;
  title?: string;
  error?: string;
}

const fetchHomeDepot = async (query: string): Promise<{ price?: number; link?: string; title?: string }> => {
  const response = await fetch(`https://www.homedepot.com/federated-search/v2?keyword=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error(`Home Depot request failed: ${response.status}`);
  }
  const json = await response.json();
  const first = json?.products?.[0] ?? json?.data?.products?.[0];
  if (!first) return {};
  const price = Number(first?.price ?? first?.pricing?.finalPrice);
  const link = first?.productUrl ?? (first?.canonicalUrl ? `https://www.homedepot.com${first.canonicalUrl}` : undefined);
  const title = first?.productName ?? first?.title;
  return { price, link, title };
};

const fetchTractorSupply = async (query: string): Promise<{ price?: number; link?: string; title?: string }> => {
  const response = await fetch(`https://www.tractorsupply.com/api/search/v1/products?searchText=${encodeURIComponent(query)}&pageSize=1`);
  if (!response.ok) {
    throw new Error(`Tractor Supply request failed: ${response.status}`);
  }
  const json = await response.json();
  const first = json?.data?.products?.[0] ?? json?.products?.[0];
  if (!first) return {};
  const price = Number(first?.price ?? first?.minPrice);
  const link = first?.productSeoUrl ? `https://www.tractorsupply.com${first.productSeoUrl}` : undefined;
  const title = first?.productName ?? first?.name;
  return { price, link, title };
};

const handlers: Record<PriceSearchJob['store'], (query: string) => Promise<{ price?: number; link?: string; title?: string }>> = {
  'Home Depot': fetchHomeDepot,
  'Tractor Supply': fetchTractorSupply
};

self.addEventListener('message', async (event: MessageEvent<PriceSearchJob>) => {
  const { data } = event;
  try {
    const handler = handlers[data.store];
    const result = await handler(data.query);
    const payload: PriceSearchResult = {
      requestId: data.requestId,
      success: typeof result.price === 'number' && !Number.isNaN(result.price),
      store: data.store,
      unitPrice: result.price,
      link: result.link,
      title: result.title
    };
    (self as unknown as Worker).postMessage(payload);
  } catch (error) {
    const payload: PriceSearchResult = {
      requestId: data.requestId,
      success: false,
      store: data.store,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    (self as unknown as Worker).postMessage(payload);
  }
});
