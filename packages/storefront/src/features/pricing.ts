import { escapeHtml } from '@vault/shared/utils/escape';
import { iconTag, iconStar } from '@vault/shared/constants/svg-icons';
import { resolveCampaignForBenefit } from '@vault/shared/benefits/resolve';
import type { CampaignIndex, ResolvableBenefit } from '@vault/shared/benefits/resolve';
import { log } from '../services/logger';
import { onProductPage, productHandle } from '../services/page-detect';

interface DiscountInfo {
  type: string;
  value: number;
}

function matchBenefit(bens: ResolvableBenefit[], handle: string): ResolvableBenefit | null {
  for (const b of bens) {
    if (b.campaignType !== 'discounted_product' && b.campaignType !== 'timer_sale') continue;
    if (b.type !== 'discount') continue;
    if (b.productHandles?.indexOf(handle) !== -1) return b;
  }
  return null;
}

export function initPricing(bens: ResolvableBenefit[], campaignsIndex: CampaignIndex): void {
  if (!onProductPage()) return;
  const handle = productHandle();
  if (!handle) return;

  const b = matchBenefit(bens, handle);
  if (!b) {
    log('no discount benefit for', handle);
    return;
  }

  const resolved = resolveCampaignForBenefit(b, campaignsIndex);
  const cfgAny = resolved.config as unknown as Record<string, unknown> | null;
  const discount: DiscountInfo | undefined =
    b.discount || (cfgAny?.discount as DiscountInfo | undefined);

  if (!discount?.value) return;
  log('applying pricing for', handle, discount);

  const dc = cfgAny?.displayConfig as Record<string, unknown> | undefined;
  const pp = dc?.productPage as Record<string, unknown> | undefined;

  if (!pp || pp.showStrikethroughPricing !== false) {
    const els = document.querySelectorAll(
      '.price__regular .price-item--regular,[data-product-price],.product__price,.product-price',
    );
    for (let j = 0; j < els.length; j++) {
      const el = els[j] as HTMLElement;
      if (el.getAttribute('data-vault')) continue;
      el.setAttribute('data-vault', '1');

      const txt = el.textContent?.trim() || '';
      const num = parseFloat(txt.replace(/[^0-9.]/g, ''));
      if (isNaN(num) || num <= 0) continue;

      let disc = discount.type === 'percentage' ? num * (1 - discount.value / 100) : num - discount.value;
      if (disc < 0) disc = 0;

      const cur = txt.replace(/[0-9.,\s]/g, '').trim() || '$';
      el.innerHTML = `<span class="v-price-old">${cur}${num.toFixed(2)}</span> <span class="v-price-new">${cur}${disc.toFixed(2)}</span>`;
    }
  }

  const badge = pp?.discountBadge as Record<string, unknown> | undefined;
  if ((!badge && !pp) || (badge && badge.enabled !== false)) {
    if (!document.querySelector('.v-disc-badge')) {
      const text = (badge?.text as string) || (b.campaignType === 'timer_sale' ? 'Sale Price' : 'Member Price');
      const color = (badge?.color as string) || (b.campaignType === 'timer_sale' ? '#b91c1c' : '#0f766e');
      const label = discount.type === 'percentage' ? discount.value + '% off' : '$' + discount.value + ' off';

      const el2 = document.createElement('div');
      el2.className = 'v-disc-badge';
      el2.style.setProperty('--badge-color', color);
      el2.innerHTML =
        `<div class="v-disc-badge__inner">${iconTag(16, 16)}` +
        `<span class="v-disc-badge__text">${escapeHtml(text)}</span>` +
        `<span class="v-disc-badge__val">${escapeHtml(label)}</span></div>`;

      const target = document.querySelector(
        '.product__title,.product-single__title,h1.title,[data-product-title],.product-info__title',
      );
      if (target?.parentNode) target.parentNode.insertBefore(el2, target.nextSibling);
    }
  }

  const banner = pp?.banner as Record<string, unknown> | undefined;
  if (banner?.enabled) {
    if (!document.querySelector('.v-prod-banner')) {
      const el3 = document.createElement('div');
      el3.className = 'v-prod-banner';
      el3.style.background = (banner.bgColor as string) || '#f5f3ff';
      el3.style.color = (banner.textColor as string) || '#5b21b6';
      el3.innerHTML =
        `<div class="v-prod-banner__inner">${iconStar(20, 20)}` +
        `<span>${escapeHtml((banner.message as string) || 'You qualify for a special discount!')}</span></div>`;

      const form = document.querySelector('form[action*="/cart/add"],.product-form,.product__form');
      if (form?.parentNode) form.parentNode.insertBefore(el3, form);
    }
  }
}
