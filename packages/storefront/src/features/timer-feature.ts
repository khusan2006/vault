import { resolveCampaignForBenefit } from '@vault/shared/benefits/resolve';
import type { CampaignIndex, ResolvableBenefit } from '@vault/shared/benefits/resolve';
import { log } from '../services/logger';
import { onProductPage, productHandle } from '../services/page-detect';

const TIMER_PREFIX = 'vault_timer_';

function sGet(store: Storage, k: string): string | null {
  try { return store.getItem(k); } catch { return null; }
}

function sSet(store: Storage, k: string, v: string): void {
  try { store.setItem(k, v); } catch { /* noop */ }
}

export function initTimer(bens: ResolvableBenefit[], campaignsIndex: CampaignIndex): void {
  if (!onProductPage()) return;
  const handle = productHandle();

  for (const b of bens) {
    const resolved = resolveCampaignForBenefit(b, campaignsIndex);
    if (resolved.type !== 'timer_sale') continue;

    const cfg = resolved.config as Record<string, unknown> | null;
    if (!cfg?.showCountdown || !cfg.timerDurationMinutes) continue;
    if (handle && b.productHandles?.length && b.productHandles.indexOf(handle) === -1) continue;

    const isGlobal = cfg.timerType === 'global';
    let remaining: number;

    if (isGlobal && b.campaignEndsAt) {
      remaining = new Date(b.campaignEndsAt).getTime() - Date.now();
    } else {
      const key = TIMER_PREFIX + b.campaignId;
      let started = sGet(sessionStorage, key);
      if (!started) {
        started = String(Date.now());
        sSet(sessionStorage, key, started);
      }
      remaining = ((cfg.timerDurationMinutes as number) * 60000) - (Date.now() - parseInt(started, 10));
    }

    if (remaining <= 0) continue;
    log('rendering timer for', b.campaignName, remaining + 'ms left');

    const dc = cfg.displayConfig as Record<string, unknown> | undefined;
    const tc = dc?.timer as Record<string, unknown> | undefined;
    const style = (tc?.style as string) || 'urgent';
    const position = (tc?.position as string) || 'above_add_to_cart';
    const expired = (tc?.expiredMessage as string) || 'This offer has expired';

    const discount = cfg.discount as { type: string; value: number } | undefined;
    const dLabel = discount
      ? (discount.type === 'percentage' ? discount.value + '% off' : '$' + discount.value + ' off')
      : 'Special offer';

    const timerEl = document.createElement('vault-timer');
    timerEl.setAttribute('style-variant', style);
    timerEl.setAttribute('label', dLabel + ' — Hurry!');
    timerEl.setAttribute('expired-message', expired);
    timerEl.setAttribute('duration', String(remaining));

    let inserted = false;
    if (position === 'above_title') {
      const t = document.querySelector('.product__title,.product-single__title,h1.title,[data-product-title]');
      if (t?.parentNode) {
        t.parentNode.insertBefore(timerEl, t);
        inserted = true;
      }
    }
    if (position === 'below_price' && !inserted) {
      const p = document.querySelector('.price,.product__price,[data-product-price]');
      if (p?.parentNode) {
        p.parentNode.insertBefore(timerEl, p.nextSibling);
        inserted = true;
      }
    }
    if (!inserted) {
      const f = document.querySelector('form[action*="/cart/add"],.product-form,.product__form');
      if (f?.parentNode) {
        f.parentNode.insertBefore(timerEl, f);
      } else {
        const p2 = document.querySelector('.price,.product__price,[data-product-price]');
        if (p2?.parentNode) p2.parentNode.insertBefore(timerEl, p2.nextSibling);
      }
    }

    break;
  }
}
