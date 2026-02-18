import { FREQ_TTL } from '../constants/defaults.js';

const DISMISS_PREFIX = 'vault_dismissed_';

/** Adapter interface for storage backends. */
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/**
 * Check if a notification should be shown based on frequency gating.
 * Returns true if the notification should be displayed.
 */
export function shouldShow(
  freq: string,
  cid: string | undefined,
  localStore: StorageAdapter,
  sessionStore: StorageAdapter,
): boolean {
  const ttl = FREQ_TTL[freq as keyof typeof FREQ_TTL];
  if (ttl === undefined || ttl === 0) return true;
  const key = DISMISS_PREFIX + (cid || freq);
  if (ttl === -1) return !sessionStore.getItem(key);
  const ts = localStore.getItem(key);
  return !(ts && Date.now() - parseInt(ts, 10) < ttl);
}

/**
 * Mark a notification as dismissed for frequency gating.
 */
export function markDismissed(
  freq: string,
  cid: string | undefined,
  localStore: StorageAdapter,
  sessionStore: StorageAdapter,
): void {
  const key = DISMISS_PREFIX + (cid || freq);
  if (FREQ_TTL[freq as keyof typeof FREQ_TTL] === -1) {
    sessionStore.setItem(key, '1');
  } else {
    localStore.setItem(key, String(Date.now()));
  }
}
