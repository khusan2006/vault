import { shouldShow, markDismissed, type StorageAdapter } from '@vault/shared/frequency/gating';
import type { NotificationSettings } from '@vault/shared/display/resolve-settings';
import type { VaultBanner } from '../components/vault-banner';
import type { VaultModal } from '../components/vault-modal';
import type { VaultToast } from '../components/vault-toast';
import { log } from '../services/logger';

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
}
