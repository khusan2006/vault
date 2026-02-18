import { pickPrimaryBenefit } from '@vault/shared/benefits/resolve';
import { resolveSettings } from '@vault/shared/display/resolve-settings';
import { log, logErr } from './services/logger';
import { loadBenefits } from './services/api';
import { getCampaignIndex } from './services/bootstrap';
import { showNotification } from './features/notification';
import { initExclusivePage } from './features/exclusive-page';
import { initPricing } from './features/pricing';
import { initTimer } from './features/timer-feature';

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
      showNotification(notifCfg, primary.campaignId);

      initPricing(bens, campaignsIndex);
      initTimer(bens, campaignsIndex);
    })
    .catch((e) => logErr('init error', e));
}
