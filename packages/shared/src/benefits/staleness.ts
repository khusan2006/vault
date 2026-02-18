import { cleanId, normalizeIds, toSet, setsEqual } from '../utils/ids.js';
import type { CampaignIndex, ResolvableBenefit } from './resolve.js';

/** Check if a single benefit is stale compared to its campaign's current config. */
export function isBenefitStale(
  benefit: ResolvableBenefit | null | undefined,
  campaignsIndex: CampaignIndex | null | undefined,
): boolean {
  if (!benefit?.campaignId || !campaignsIndex) return false;
  const cid = cleanId(benefit.campaignId);
  const campaign = campaignsIndex[cid];
  if (!campaign) return true;
  if (!campaign.config) return false;

  const cfg = campaign.config;
  const cfgProducts = normalizeIds(
    cfg.productIds || [],
    'gid://shopify/Product/',
  );
  const benProducts = normalizeIds(
    benefit.productIds || [],
    'gid://shopify/Product/',
  );

  if (cfgProducts.length || benProducts.length) {
    if (!setsEqual(toSet(cfgProducts), toSet(benProducts))) return true;
  }

  const cfgCollections = normalizeIds(
    cfg.collectionIds || [],
    'gid://shopify/Collection/',
  );
  const benCollections = normalizeIds(
    benefit.collectionIds || [],
    'gid://shopify/Collection/',
  );
  if (cfgCollections.length || benCollections.length) {
    if (!setsEqual(toSet(cfgCollections), toSet(benCollections))) return true;
  }

  return false;
}

/** Check if any benefit in the list is stale. */
export function needsBenefitRefresh(
  benefits: ResolvableBenefit[] | null | undefined,
  campaignsIndex: CampaignIndex | null | undefined,
): boolean {
  if (!benefits?.length) return false;
  if (!campaignsIndex || Object.keys(campaignsIndex).length === 0) return false;
  return benefits.some((b) => isBenefitStale(b, campaignsIndex));
}
