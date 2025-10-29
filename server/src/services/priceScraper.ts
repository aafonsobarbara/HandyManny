import { chromium } from 'playwright';
import NodeCache from 'node-cache';
import { aggregateBestOffers, AggregatedMaterial } from '../utils/priceAggregator.js';

const cache = new NodeCache({ stdTTL: 60 * 60 * 6 });

interface MaterialInput {
  item: string;
  qty: number;
  unit?: string;
}

const searchStore = async (store: 'homedepot' | 'tractorsupply', query: string) => {
  const cacheKey = `${store}:${query}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached as { title: string; price: number; url: string }[];

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    if (store === 'homedepot') {
      await page.goto(`https://www.homedepot.com/s/${encodeURIComponent(query)}`);
      await page.waitForTimeout(2000);
      const items = await page.$$eval('[data-testid="product-pod"]', (elements) =>
        elements.slice(0, 3).map((el) => {
          const title = (el.querySelector('a[data-pod-type="pr"] span')?.textContent || '').trim();
          const priceRaw = (el.querySelector('.price__dollars')?.textContent || '0').replace(/[^\d.]/g, '');
          const cents = (el.querySelector('.price__cents')?.textContent || '0').replace(/[^\d]/g, '');
          const price = parseFloat(`${priceRaw}.${cents}`);
          const url = (el.querySelector('a[data-pod-type="pr"]') as any)?.href || '';
          return { title, price, url };
        })
      );
      cache.set(cacheKey, items);
      return items;
    }
    await page.goto(`https://www.tractorsupply.com/tsc/search/${encodeURIComponent(query)}`);
    await page.waitForTimeout(2000);
    const items = await page.$$eval('.product-list__product', (elements) =>
      elements.slice(0, 3).map((el) => {
        const title = (el.querySelector('.product-title__name')?.textContent || '').trim();
        const priceRaw = (el.querySelector('.price__value')?.textContent || '0').replace(/[^\d.]/g, '');
        const price = parseFloat(priceRaw);
        const url = (el.querySelector('a') as any)?.href || '';
        return { title, price, url };
      })
    );
    cache.set(cacheKey, items);
    return items;
  } catch (error) {
    console.error(`Failed to scrape ${store} for ${query}`, error);
    return [];
  } finally {
    await browser.close();
  }
};

export const researchMaterialPrices = async (materials: MaterialInput[]): Promise<AggregatedMaterial[]> => {
  const materialQuotes = await Promise.all(
    materials.map(async (material) => {
      const hd = await searchStore('homedepot', material.item);
      const ts = await searchStore('tractorsupply', material.item);
      const offers = [...hd, ...ts]
        .filter((item) => item.price > 0)
        .map((item) => ({ store: item.title.includes('Tractor') ? 'Tractor Supply' : 'Home Depot', unitPrice: item.price, link: item.url }));
      return {
        item: material.item,
        qty: material.qty,
        unit: material.unit,
        offers
      };
    })
  );

  return aggregateBestOffers(materialQuotes);
};
