'use client';

/**
 * Lightweight in-memory cache for axios GET requests.
 *
 * Every page in this app fetches its data with `axios.get` inside a
 * `useEffect`, so navigating away and back re-downloads the same data. This
 * interceptor reuses a recent response for a short window and clears the whole
 * cache whenever a mutation (POST/PUT/PATCH/DELETE) happens.
 *
 * It is deliberately in-memory and short-lived: a page reload or logout wipes
 * it, so it cannot leak data between sessions on a shared device.
 */

import axios from 'axios';

const TTL_MS = 30_000;
const MAX_ENTRIES = 100;

type CacheEntry = { at: number; data: unknown };

const cache = new Map<string, CacheEntry>();

function cacheKey(config: any): string {
  const base = config.baseURL || '';
  const url = config.url || '';
  const params = config.params ? JSON.stringify(config.params) : '';
  return `${config.method || 'get'} ${base}${url} ${params}`;
}

function isCacheable(config: any): boolean {
  const method = (config.method || 'get').toLowerCase();
  if (method !== 'get') return false;

  const url = config.url || '';
  // Auth/session responses must never be reused.
  if (url.includes('/api/auth')) return false;

  return true;
}

axios.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase();

  // Any mutation invalidates everything: simpler and safer than tracking
  // which individual keys a mutation may have affected. AI chat requests are
  // read-only, so they don't need to flush the cache.
  if (method !== 'get') {
    if (!(config.url || '').includes('/api/ai/')) {
      cache.clear();
    }
    return config;
  }

  if (!isCacheable(config)) return config;

  const key = cacheKey(config);
  const entry = cache.get(key);
  if (entry && Date.now() - entry.at < TTL_MS) {
    config.adapter = async () => ({
      data: entry.data,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      request: {},
    });
  } else if (entry) {
    cache.delete(key);
  }

  return config;
});

axios.interceptors.response.use(
  (response) => {
    if (isCacheable(response.config) && response.status === 200) {
      if (cache.size >= MAX_ENTRIES) {
        const oldest = cache.keys().next().value;
        if (oldest) cache.delete(oldest);
      }
      cache.set(cacheKey(response.config), {
        at: Date.now(),
        data: response.data,
      });
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export {};
