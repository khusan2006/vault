import { needsBenefitRefresh } from '@vault/shared/benefits/staleness';
import type { ResolvableBenefit } from '@vault/shared/benefits/resolve';
import { log, logErr } from './logger';
import { getBootstrap, getCampaignIndex } from './bootstrap';

function parseMaybeJson(value: unknown): unknown {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value;
}

export function api<T = unknown>(url: string): Promise<T | null> {
  log('fetch', url);
  return fetch(url, { method: 'GET', credentials: 'same-origin' })
    .then((r) => {
      log('response', url, r.status);
      return r.ok ? (r.json() as Promise<T>) : null;
    })
    .catch((e) => {
      logErr('fetch error', url, e);
      return null;
    });
}

export function loadBenefits(): Promise<ResolvableBenefit[]> {
  const boot = getBootstrap();

  if (!boot.customerId) {
    log('no customer — skipping benefits fetch');
    return Promise.resolve([]);
  }

  if (boot.benefits != null) {
    const parsed = parseMaybeJson(boot.benefits);
    const fromBoot: ResolvableBenefit[] = Array.isArray(parsed) ? parsed : [];
    const campaignsIndex = getCampaignIndex();

    if (needsBenefitRefresh(fromBoot, campaignsIndex)) {
      log('benefits stale — refreshing from proxy');
      return api<{ benefits: ResolvableBenefit[] }>('/apps/vault/customer-benefits').then((d) => {
        const b = d ? d.benefits || [] : [];
        log('benefits (proxy):', b.length, b);
        return b;
      });
    }

    log('benefits (bootstrap):', fromBoot.length, fromBoot);
    return Promise.resolve(fromBoot);
  }

  return api<{ benefits: ResolvableBenefit[] }>('/apps/vault/customer-benefits').then((d) => {
    const b = d ? d.benefits || [] : [];
    log('benefits (proxy):', b.length, b);
    return b;
  });
}

interface ShopifyProduct {
  title: string;
  handle: string;
  product_type?: string;
  featured_image?: string;
  image?: { src: string };
  images?: Array<string | { src: string }>;
  variants?: Array<{
    price: string;
    compare_at_price?: string | null;
  }>;
}

export function loadProduct(handle: string): Promise<ShopifyProduct | null> {
  return api<{ product: ShopifyProduct }>('/products/' + encodeURIComponent(handle) + '.json').then(
    (d) => (d ? d.product : null),
  );
}

export type { ShopifyProduct };
