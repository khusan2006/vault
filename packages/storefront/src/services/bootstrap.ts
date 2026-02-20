import { cleanId } from '@vault/shared/utils/ids';
import type { CampaignIndex, CampaignIndexEntry } from '@vault/shared/benefits/resolve';
import { logErr } from './logger';

interface BootstrapData {
  benefits: unknown[] | null;
  campaigns: unknown | null;
  customerId: string | null;
  shop: string | null;
}

let BOOT_CACHE: BootstrapData | null = null;
let CAMPAIGN_INDEX: CampaignIndex | null = null;

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

function readBootstrap(): BootstrapData {
  const nodes = document.querySelectorAll('script[data-vault-bootstrap]');
  const data: BootstrapData = { benefits: null, campaigns: null, customerId: null, shop: null };

  for (let i = 0; i < nodes.length; i++) {
    try {
      const parsed = JSON.parse(nodes[i].textContent || '{}');
      if (parsed && typeof parsed === 'object') {
        if (parsed.customerId != null) data.customerId = parsed.customerId;
        if (parsed.benefits != null) data.benefits = parsed.benefits;
        if (parsed.campaigns != null) data.campaigns = parsed.campaigns;
        if (parsed.shop) data.shop = parsed.shop;
      }
    } catch (e) {
      logErr('bootstrap parse error', e);
    }
  }
  return data;
}

export function getBootstrap(): BootstrapData {
  if (!BOOT_CACHE) BOOT_CACHE = readBootstrap();
  return BOOT_CACHE;
}

export function getCampaignIndex(): CampaignIndex {
  if (CAMPAIGN_INDEX) return CAMPAIGN_INDEX;

  const boot = getBootstrap();
  const payload = parseMaybeJson(boot.campaigns) as Record<string, unknown> | unknown[] | null;
  const list: CampaignIndexEntry[] =
    payload && !Array.isArray(payload) && Array.isArray((payload as Record<string, unknown>).campaigns)
      ? (payload as Record<string, unknown>).campaigns as CampaignIndexEntry[]
      : Array.isArray(payload)
        ? payload as CampaignIndexEntry[]
        : [];

  const idx: CampaignIndex = {};
  for (const c of list) {
    if (c && c.id && (!c.status || c.status === 'active')) idx[cleanId(c.id)] = c;
  }
  CAMPAIGN_INDEX = idx;
  return idx;
}
