import { shouldShow, markDismissed, type StorageAdapter } from '@vault/shared/frequency/gating';
import type { NotificationSettings } from '@vault/shared/display/resolve-settings';
import type { VaultBanner } from '../components/vault-banner';
import type { VaultModal } from '../components/vault-modal';
import type { VaultToast } from '../components/vault-toast';
import { log } from '../services/logger';

const PRODUCTS_MODAL_HASH = '#vault-products-modal';

const localStore: StorageAdapter = {
  getItem(k) { try { return localStorage.getItem(k); } catch { return null; } },
  setItem(k, v) { try { localStorage.setItem(k, v); } catch { /* noop */ } },
};

const sessionStore: StorageAdapter = {
  getItem(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
  setItem(k, v) { try { sessionStorage.setItem(k, v); } catch { /* noop */ } },
};

const TAG_MAP: Record<string, string> = {
  banner: 'vault-banner',
  modal: 'vault-modal',
  toast: 'vault-toast',
  badge: 'vault-badge',
};

/** Callback invoked when the notification CTA targets the products modal. */
let _onOpenProductsModal: (() => void) | null = null;

/** Register a callback for opening the products modal from notification CTA. */
export function onProductsModalRequest(cb: () => void): void {
  _onOpenProductsModal = cb;
}

export function showNotification(cfg: NotificationSettings, cid: string | undefined): void {
  const freq = cfg.behavior.showFrequency;
  log('showNotification type=' + cfg.displayType, 'freq=' + freq, 'cid=' + cid);

  if (!shouldShow(freq, cid, localStore, sessionStore)) {
    log('blocked by frequency gating');
    return;
  }

  const tagName = TAG_MAP[cfg.displayType] || 'vault-banner';
  const el = document.createElement(tagName) as VaultBanner | VaultModal | VaultToast;

  el.setAttribute('message', cfg.messageText);
  if (cfg.buttonText) el.setAttribute('button-text', cfg.buttonText);
  if (cfg.buttonUrl) el.setAttribute('button-url', cfg.buttonUrl);
  el.setAttribute('primary-color', cfg.visuals.primaryColor);
  el.setAttribute('text-color', cfg.visuals.textColor);

  if (cfg.displayType === 'banner' || cfg.displayType === 'toast' || cfg.displayType === 'badge') {
    el.setAttribute('position', cfg.visuals.position);
  }

  if ('onDismiss' in el) {
    (el as VaultBanner | VaultModal | VaultToast).onDismiss = () => {
      markDismissed(freq, cid, localStore, sessionStore);
    };
  }

  const auto = cfg.behavior.autoDismissSeconds;
  if (auto && auto > 0 && 'onDismiss' in el) {
    setTimeout(() => {
      if (el.isConnected) {
        markDismissed(freq, cid, localStore, sessionStore);
        el.remove();
      }
    }, auto * 1000);
  }

  const isTopBanner = cfg.displayType === 'banner' && cfg.visuals.position !== 'bottom';
  if (isTopBanner) {
    document.body.insertBefore(el, document.body.firstChild);
  } else {
    document.body.appendChild(el);
  }

  // Intercept CTA clicks that target the products modal
  if (cfg.buttonUrl === PRODUCTS_MODAL_HASH && _onOpenProductsModal) {
    interceptProductsModalLinks(el);
  }
}

/** Intercept anchor clicks inside the notification that point to #vault-products-modal. */
function interceptProductsModalLinks(el: HTMLElement): void {
  const attachHandler = (root: ShadowRoot | HTMLElement) => {
    root.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest?.('a[href]') as HTMLAnchorElement | null;
      if (anchor && anchor.getAttribute('href') === PRODUCTS_MODAL_HASH) {
        e.preventDefault();
        e.stopPropagation();
        _onOpenProductsModal?.();
      }
    });
  };

  // Web Components use Shadow DOM — wait for render, then attach
  requestAnimationFrame(() => {
    if (el.shadowRoot) {
      attachHandler(el.shadowRoot);
    } else {
      attachHandler(el);
    }
  });
}
