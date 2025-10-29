import { PRICE_CACHE_KEY, PRICE_CACHE_TTL_HOURS } from '../constants/terms';
import { nanoid } from '../utils/nanoid';
import type { MaterialRow } from '../types/quote';
import type { PriceSearchJob, PriceSearchResult } from '../workers/priceSearchWorker';

interface CachedResult {
  timestamp: number;
  data: Record<string, PriceSearchResult>;
}

const readCache = (): CachedResult | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PRICE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedResult;
    const ageHours = (Date.now() - parsed.timestamp) / (1000 * 60 * 60);
    if (ageHours > PRICE_CACHE_TTL_HOURS) {
      window.localStorage.removeItem(PRICE_CACHE_KEY);
      return null;
    }
    return parsed;
  } catch (error) {
    console.warn('Price cache parse error', error);
    return null;
  }
};

const writeCache = (data: Record<string, PriceSearchResult>) => {
  if (typeof window === 'undefined') return;
  const payload: CachedResult = {
    timestamp: Date.now(),
    data
  };
  window.localStorage.setItem(PRICE_CACHE_KEY, JSON.stringify(payload));
};

const ensureWorker = () => {
  if (typeof window === 'undefined') return null;
  const worker = new Worker(new URL('../workers/priceSearchWorker.ts', import.meta.url), { type: 'module' });
  return worker;
};

export interface MaterialPriceQuote {
  materialId: string;
  store: PriceSearchJob['store'];
  unitPrice?: number;
  link?: string;
  error?: string;
}

export const searchMaterialPrices = async (
  material: MaterialRow
): Promise<MaterialPriceQuote[]> => {
  const cache = readCache();
  const cacheKeyHd = `${material.item}|Home Depot`;
  const cacheKeyTs = `${material.item}|Tractor Supply`;
  const cachedResults: Record<string, PriceSearchResult> = cache?.data ?? {};
  const results: MaterialPriceQuote[] = [];
  const requests: PriceSearchJob[] = [];

  if (cachedResults[cacheKeyHd]) {
    const cached = cachedResults[cacheKeyHd];
    results.push({
      materialId: material.id,
      store: 'Home Depot',
      unitPrice: cached.unitPrice,
      link: cached.link,
      error: cached.error
    });
  } else {
    requests.push({ requestId: nanoid(), query: material.item, store: 'Home Depot' });
  }

  if (cachedResults[cacheKeyTs]) {
    const cached = cachedResults[cacheKeyTs];
    results.push({
      materialId: material.id,
      store: 'Tractor Supply',
      unitPrice: cached.unitPrice,
      link: cached.link,
      error: cached.error
    });
  } else {
    requests.push({ requestId: nanoid(), query: material.item, store: 'Tractor Supply' });
  }

  if (requests.length === 0) {
    return results;
  }

  const worker = ensureWorker();
  if (!worker) {
    throw new Error('Web workers unavailable in this environment');
  }

  const pending = new Map<string, PriceSearchJob>();
  const collected: PriceSearchResult[] = [];

  const responsePromise = new Promise<void>((resolve) => {
    worker.addEventListener('message', (event: MessageEvent<PriceSearchResult>) => {
      collected.push(event.data);
      if (collected.length === requests.length) {
        resolve();
      }
    });
  });

  requests.forEach((job) => {
    pending.set(job.requestId, job);
    worker.postMessage(job);
  });

  await responsePromise;
  worker.terminate();

  const updatedCache = { ...cachedResults };

  collected.forEach((item) => {
    const key = `${material.item}|${item.store}`;
    updatedCache[key] = item;
    results.push({
      materialId: material.id,
      store: item.store,
      unitPrice: item.unitPrice,
      link: item.link,
      error: item.success ? undefined : item.error ?? 'Unknown error'
    });
  });

  writeCache(updatedCache);

  return results;
};
