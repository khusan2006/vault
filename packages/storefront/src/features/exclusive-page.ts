import { escapeHtml } from '@vault/shared/utils/escape';
import { resolveCampaignForBenefit, priorityForBenefit } from '@vault/shared/benefits/resolve';
import type { CampaignIndex, ResolvableBenefit } from '@vault/shared/benefits/resolve';
import { log } from '../services/logger';
import { loadBenefits, loadProduct } from '../services/api';
import { getCampaignIndex } from '../services/bootstrap';

const EMPTY_MSG = 'No exclusive products available right now. Check back later!';

function val<T>(v: T | undefined | null, def: T): T {
  return v !== undefined && v !== null ? v : def;
}

interface LandingConfig {
  enabled?: boolean;
  heading?: string;
  subheading?: string;
  gridColumns?: number;
  itemLayout?: string;
  badgeText?: string;
  badgeColor?: string;
  showAddToCart?: boolean;
  showCategory?: boolean;
  showCompareAt?: boolean;
  showRatings?: boolean;
}

function findLandingConfig(
  bens: ResolvableBenefit[],
  campaignsIndex: CampaignIndex,
): LandingConfig | null {
  let best: LandingConfig | null = null;
  let bestPriority = -1;

  for (const b of bens) {
    const resolved = resolveCampaignForBenefit(b, campaignsIndex);
    if (
      (resolved.type === 'early_access' || b.type === 'visibility') &&
      resolved.config?.displayConfig
    ) {
      const dc = resolved.config.displayConfig as unknown as Record<string, unknown>;
      const lp = dc.landingPage as LandingConfig | undefined;
      if (lp) {
        const p = priorityForBenefit(b, campaignsIndex);
        if (p > bestPriority) {
          bestPriority = p;
          best = lp;
        }
      }
    }
  }
  return best;
}

export function initExclusivePage(): void {
  const grids = document.querySelectorAll<HTMLElement>('#vault-products-grid,[data-vault-grid]');
  if (!grids.length) return;

  log('exclusive page detected');
  const campaignsIndex = getCampaignIndex();

  loadBenefits().then((bens) => {
    grids.forEach((grid) => {
      if (!bens.length) {
        grid.innerHTML = `<p class="v-excl__empty">${escapeHtml(EMPTY_MSG)}</p>`;
        return;
      }

      let headerTitle: HTMLElement | null = null;
      let headerSub: HTMLElement | null = null;

      if (grid.id === 'vault-products-grid') {
        headerTitle = document.getElementById('vault-excl-title');
        headerSub = document.getElementById('vault-excl-subtitle');
      }

      if (!headerTitle) {
        const scope = grid.closest('[data-vault-section]') || grid.parentElement;
        headerTitle = scope?.querySelector('[data-vault-title]') ?? null;
        headerSub = scope?.querySelector('[data-vault-subtitle]') ?? null;
      }

      const lp = findLandingConfig(bens, campaignsIndex);
      log('landing page config:', lp);

      if (lp?.enabled === false) {
        grid.innerHTML = '';
        if (headerTitle) headerTitle.style.display = 'none';
        if (headerSub) headerSub.style.display = 'none';
        return;
      }

      if (lp) {
        if (headerTitle) headerTitle.textContent = val(lp.heading, 'Exclusive Products');
        if (headerSub) headerSub.textContent = val(lp.subheading, 'Products available just for you');
        grid.style.setProperty('--vault-cols', String(lp.gridColumns || 3));
      }
      if (lp?.badgeColor) {
        grid.style.setProperty('--vault-badge-color', lp.badgeColor);
      }

      const handles: string[] = [];
      const seen: Record<string, boolean> = {};

      for (const b of bens) {
        const resolved = resolveCampaignForBenefit(b, campaignsIndex);
        if ((resolved.type === 'early_access' || b.type === 'visibility') && b.productHandles) {
          for (const h of b.productHandles) {
            if (!seen[h]) {
              seen[h] = true;
              handles.push(h);
            }
          }
        }
      }

      if (!handles.length) {
        grid.innerHTML = `<p class="v-excl__empty">${escapeHtml(EMPTY_MSG)}</p>`;
        return;
      }

      Promise.all(handles.map(loadProduct)).then((prods) => {
        grid.innerHTML = '';
        for (const p of prods) {
          if (!p) continue;
          const cardEl = document.createElement('vault-product-card');
          cardEl.setAttribute('product-data', JSON.stringify(p));
          cardEl.setAttribute('layout', lp?.itemLayout || 'card');
          cardEl.setAttribute('badge-text', val(lp?.badgeText, 'Exclusive'));
          cardEl.setAttribute('badge-color', val(lp?.badgeColor, '#7c3aed'));
          cardEl.setAttribute('show-cart', String(lp ? lp.showAddToCart !== false : true));
          cardEl.setAttribute('show-category', String(lp ? lp.showCategory === true : false));
          cardEl.setAttribute('show-compare-at', String(lp ? lp.showCompareAt === true : false));
          cardEl.setAttribute('show-ratings', String(lp ? lp.showRatings === true : false));
          grid.appendChild(cardEl);
        }
        if (!grid.children.length) {
          grid.innerHTML = `<p class="v-excl__empty">${escapeHtml(EMPTY_MSG)}</p>`;
        }
      });
    });
  });
}
