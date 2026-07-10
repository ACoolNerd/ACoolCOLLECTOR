import axios from 'axios';

const API_TOKEN = process.env.SPORTSCARDSPRO_API_TOKEN;
const BASE_URL = (process.env.SPORTSCARDSPRO_BASE_URL || 'https://www.sportscardspro.com').replace(/\/$/, '');
const CACHE_TTL_MS = Number(process.env.ACOOL_PRICE_CACHE_HOURS || 24) * 60 * 60 * 1000;
const MIN_REQUEST_DELAY_MS = Math.max(1000, Number(process.env.ACOOL_API_DELAY_SECONDS || 1.1) * 1000);

export type CurrentGuideRecord = {
  status: 'success';
  source: 'SportsCardsPro';
  source_kind: 'current_guide';
  historical_sales_supported: false;
  id: string;
  product_name: string | null;
  set_name: string | null;
  genre: string | null;
  release_date: string | null;
  sales_volume_yearly: number | null;
  prices_cents: {
    ungraded: number | null;
    grade_7_75: number | null;
    grade_8_85: number | null;
    grade_9: number | null;
    grade_95: number | null;
    psa_10: number | null;
    bgs_10: number | null;
    cgc_10: number | null;
    sgc_10: number | null;
    retail_ungraded_buy: number | null;
    retail_ungraded_sell: number | null;
    retail_grade_7_buy: number | null;
    retail_grade_7_sell: number | null;
    retail_grade_8_buy: number | null;
    retail_grade_8_sell: number | null;
  };
  fetched_at: string;
  cache_status: 'LIVE' | 'CACHED';
};

type CacheEntry<T> = { value: T; storedAt: number };
const productCache = new Map<string, CacheEntry<CurrentGuideRecord>>();
const searchCache = new Map<string, CacheEntry<unknown>>();

let requestQueue: Promise<void> = Promise.resolve();
let lastRequestAt = 0;

const asCents = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
};

const asInteger = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
};

const requireConfiguration = () => {
  if (!API_TOKEN) throw new Error('SPORTSCARDSPRO_API_TOKEN is not configured');
};

const scheduleProviderCall = async <T>(operation: () => Promise<T>): Promise<T> => {
  let resolveResult!: (value: T) => void;
  let rejectResult!: (reason?: unknown) => void;
  const result = new Promise<T>((resolve, reject) => {
    resolveResult = resolve;
    rejectResult = reject;
  });

  requestQueue = requestQueue.then(async () => {
    const waitMs = Math.max(0, lastRequestAt + MIN_REQUEST_DELAY_MS - Date.now());
    if (waitMs > 0) await new Promise((resolve) => setTimeout(resolve, waitMs));
    lastRequestAt = Date.now();
    try {
      resolveResult(await operation());
    } catch (error) {
      rejectResult(error);
    }
  });

  return result;
};

const normalizeProduct = (data: Record<string, unknown>, cacheStatus: 'LIVE' | 'CACHED'): CurrentGuideRecord => ({
  status: 'success',
  source: 'SportsCardsPro',
  source_kind: 'current_guide',
  historical_sales_supported: false,
  id: String(data.id ?? ''),
  product_name: typeof data['product-name'] === 'string' ? data['product-name'] : null,
  set_name: typeof data['console-name'] === 'string' ? data['console-name'] : null,
  genre: typeof data.genre === 'string' ? data.genre : null,
  release_date: typeof data['release-date'] === 'string' ? data['release-date'] : null,
  sales_volume_yearly: asInteger(data['sales-volume']),
  prices_cents: {
    ungraded: asCents(data['loose-price']),
    grade_7_75: asCents(data['cib-price']),
    grade_8_85: asCents(data['new-price']),
    grade_9: asCents(data['graded-price']),
    grade_95: asCents(data['box-only-price']),
    psa_10: asCents(data['manual-only-price']),
    bgs_10: asCents(data['bgs-10-price']),
    cgc_10: asCents(data['condition-17-price']),
    sgc_10: asCents(data['condition-18-price']),
    retail_ungraded_buy: asCents(data['retail-loose-buy']),
    retail_ungraded_sell: asCents(data['retail-loose-sell']),
    retail_grade_7_buy: asCents(data['retail-cib-buy']),
    retail_grade_7_sell: asCents(data['retail-cib-sell']),
    retail_grade_8_buy: asCents(data['retail-new-buy']),
    retail_grade_8_sell: asCents(data['retail-new-sell']),
  },
  fetched_at: new Date().toISOString(),
  cache_status: cacheStatus,
});

export const lookupPrice = async (id: string): Promise<CurrentGuideRecord> => {
  requireConfiguration();
  if (!/^\d{1,20}$/.test(id)) throw new Error('invalid_product_id');

  const cached = productCache.get(id);
  if (cached && Date.now() - cached.storedAt < CACHE_TTL_MS) {
    return { ...cached.value, cache_status: 'CACHED' };
  }

  return scheduleProviderCall(async () => {
    const response = await axios.get(`${BASE_URL}/api/product`, {
      params: { id, t: API_TOKEN },
      timeout: 15000,
      validateStatus: () => true,
    });
    const data = response.data as Record<string, unknown>;
    if (response.status !== 200 || data.status !== 'success') {
      const providerMessage = typeof data['error-message'] === 'string'
        ? data['error-message']
        : `provider_http_${response.status}`;
      throw new Error(providerMessage);
    }

    const normalized = normalizeProduct(data, 'LIVE');
    productCache.set(id, { value: normalized, storedAt: Date.now() });
    return normalized;
  });
};

export const searchProducts = async (query: string) => {
  requireConfiguration();
  const normalizedQuery = query.trim().replace(/\s+/g, ' ');
  if (normalizedQuery.length < 2 || normalizedQuery.length > 160) {
    throw new Error('invalid_search_query');
  }

  const cacheKey = normalizedQuery.toLowerCase();
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.storedAt < CACHE_TTL_MS) {
    return { ...cached.value as object, cache_status: 'CACHED' };
  }

  return scheduleProviderCall(async () => {
    const response = await axios.get(`${BASE_URL}/api/products`, {
      params: { q: normalizedQuery, t: API_TOKEN },
      timeout: 15000,
      validateStatus: () => true,
    });
    const data = response.data as Record<string, unknown>;
    if (response.status !== 200 || data.status !== 'success') {
      const providerMessage = typeof data['error-message'] === 'string'
        ? data['error-message']
        : `provider_http_${response.status}`;
      throw new Error(providerMessage);
    }

    const result = {
      status: 'success',
      source: 'SportsCardsPro',
      source_kind: 'current_catalog_match',
      products: Array.isArray(data.products) ? data.products : [],
      fetched_at: new Date().toISOString(),
      cache_status: 'LIVE',
    };
    searchCache.set(cacheKey, { value: result, storedAt: Date.now() });
    return result;
  });
};
