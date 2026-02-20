import { pickPrimaryBenefit, resolveCampaignForBenefit } from '@vault/shared/benefits/resolve';
import type { CampaignIndex, ResolvableBenefit } from '@vault/shared/benefits/resolve';
import { resolveSettings } from '@vault/shared/display/resolve-settings';
import { resolveTokens, tokensToCSS } from '@vault/shared/theme/tokens';
import type { ThemeConfig } from '@vault/shared/types/display-config.types';
import { log, logErr } from './services/logger';
import { loadBenefits, loadProduct } from './services/api';
import { getCampaignIndex } from './services/bootstrap';
import { showNotification, onProductsModalRequest } from './features/notification';
import { initExclusivePage } from './features/exclusive-page';
import { initPricing } from './features/pricing';
import { initTimer } from './features/timer-feature';
import type { VaultProductsModal } from './components/vault-products-modal';

export function init(): void {
  log('init, readyState=' + document.readyState, 'path=' + location.pathname);

  if (document.getElementById('vault-products-grid') || document.querySelector('[data-vault-grid]')) {
    initExclusivePage();
  }

  loadBenefits()
    .then((bens) => {
      log('loaded', bens.length, 'benefits');
      if (!bens.length) {
        log('no benefits — done');
        return;
      }

      const campaignsIndex = getCampaignIndex();

      const primary = pickPrimaryBenefit(bens, campaignsIndex) || bens[0];
      const notifCfg = resolveSettings(primary, campaignsIndex);

      // If modal approach, register the products modal opener before showing notification
      if (notifCfg.storefrontApproach === 'modal') {
        setupProductsModal(bens, campaignsIndex);
      }

      showNotification(notifCfg, primary.campaignId);

      initPricing(bens, campaignsIndex);
      initTimer(bens, campaignsIndex);
    })
    .catch((e) => logErr('init error', e));
}

/**
 * Set up the products modal for the modal storefront approach.
 * When the notification CTA is clicked, opens a full product gallery.
 */
function setupProductsModal(
  bens: ResolvableBenefit[],
  campaignsIndex: CampaignIndex,
): void {
  // Collect product handles and landing config from early_access benefits
  const handles: string[] = [];
  const seen: Record<string, boolean> = {};
  let heading = 'Exclusive Products';
  let subheading = '';
  let primaryColor = '#7c3aed';
  let landingConfig: Record<string, unknown> | null = null;
  let themeConfig: ThemeConfig | undefined;

  for (const b of bens) {
    const resolved = resolveCampaignForBenefit(b, campaignsIndex);
    if ((resolved.type === 'early_access' || b.type === 'visibility') && b.productHandles) {
      for (const h of b.productHandles) {
        if (!seen[h]) {
          seen[h] = true;
          handles.push(h);
        }
      }

      // Pick landing config from highest-priority campaign
      if (resolved.config?.displayConfig && !landingConfig) {
        const dc = resolved.config.displayConfig as unknown as Record<string, unknown>;
        landingConfig = (dc.landingPage as Record<string, unknown>) ?? null;
        themeConfig = (dc.theme as ThemeConfig) ?? undefined;
        if (dc.notification) {
          const n = dc.notification as Record<string, unknown>;
          const vis = n.visuals as Record<string, string> | undefined;
          if (vis?.primaryColor) primaryColor = vis.primaryColor;
        }
      }
    }
  }

  if (landingConfig) {
    heading = (landingConfig.heading as string) || heading;
    subheading = (landingConfig.subheading as string) || subheading;
  }

  onProductsModalRequest(() => {
    log('opening products modal, handles:', handles.length);

    const modal = document.createElement('vault-products-modal') as VaultProductsModal;
    modal.setAttribute('heading', heading);
    if (subheading) modal.setAttribute('subheading', subheading);
    modal.setAttribute('primary-color', primaryColor);

    // Apply theme tokens
    if (themeConfig) {
      const cssVars = tokensToCSS(resolveTokens(themeConfig));
      Object.entries(cssVars).forEach(([prop, val]) =>
        modal.style.setProperty(prop, val),
      );
    }

    if (landingConfig?.gridColumns) {
      modal.style.setProperty('--vault-cols', String(landingConfig.gridColumns));
    }

    document.body.appendChild(modal);

    // Load products into the modal
    Promise.all(handles.map(loadProduct)).then((prods) => {
      const cards: HTMLElement[] = [];
      const layout = (landingConfig?.itemLayout as string) || 'card';
      const badgeText = (landingConfig?.badgeText as string) || 'Exclusive';
      const badgeColor = (landingConfig?.badgeColor as string) || '#7c3aed';

      for (const p of prods) {
        if (!p) continue;
        const card = document.createElement('vault-product-card');
        card.setAttribute('product-data', JSON.stringify(p));
        card.setAttribute('layout', layout);
        card.setAttribute('badge-text', badgeText);
        card.setAttribute('badge-color', badgeColor);
        card.setAttribute('show-cart', String(landingConfig?.showAddToCart !== false));
        card.setAttribute('show-category', String(landingConfig?.showCategory === true));
        card.setAttribute('show-compare-at', String(landingConfig?.showCompareAt === true));
        card.setAttribute('show-ratings', String(landingConfig?.showRatings === true));
        cards.push(card);
      }

      modal.setProducts(cards);
    });
  });
}
