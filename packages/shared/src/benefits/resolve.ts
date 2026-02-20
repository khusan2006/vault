import { cleanId } from '../utils/ids.js';
import type { CampaignType, CampaignConfig } from '../types/campaign-config.types.js';

/** Minimal campaign shape needed for benefit resolution. */
export interface CampaignIndexEntry {
  id: string;
  type: CampaignType;
  config?: CampaignConfig;
  priority?: number;
  status?: string;
}

/** Index of campaigns keyed by cleaned ID. */
export type CampaignIndex = Record<string, CampaignIndexEntry>;

/** Minimal benefit shape needed for resolution. */
export interface ResolvableBenefit {
  campaignId?: string;
  campaignType?: CampaignType;
  campaignConfig?: CampaignConfig;
  type?: string;
  productHandles?: string[];
  productIds?: string[];
  collectionIds?: string[];
  campaignEndsAt?: string;
  campaignName?: string;
  discount?: { type: string; value: number };
}

export interface ResolvedCampaign {
  type: CampaignType | null;
  config: CampaignConfig | null;
  campaign: CampaignIndexEntry | null;
}

/** Resolve the campaign for a given benefit using the campaign index. */
export function resolveCampaignForBenefit(
  benefit: ResolvableBenefit | null | undefined,
  campaignsIndex: CampaignIndex | null | undefined,
): ResolvedCampaign {
  const rawCid = benefit?.campaignId;
  const cid = cleanId(rawCid);

  const campaign = cid && campaignsIndex ? campaignsIndex[cid] ?? null : null;
  return {
    type: campaign?.type ?? benefit?.campaignType ?? null,
    config: campaign?.config ?? benefit?.campaignConfig ?? null,
    campaign,
  };
}

/** Get the priority of a benefit's campaign. */
export function priorityForBenefit(
  benefit: ResolvableBenefit | null | undefined,
  campaignsIndex: CampaignIndex | null | undefined,
): number {
  if (!benefit?.campaignId || !campaignsIndex) return 0;
  const cid = cleanId(benefit.campaignId);
  const c = campaignsIndex[cid];
  return c && typeof c.priority === 'number' ? c.priority : 0;
}

/** Pick the highest-priority benefit from a list. */
export function pickPrimaryBenefit<T extends ResolvableBenefit>(
  benefits: T[],
  campaignsIndex: CampaignIndex | null | undefined,
): T | null {
  if (!benefits || !benefits.length) return null;
  let best = benefits[0];
  let bestPriority = priorityForBenefit(best, campaignsIndex);
  for (let i = 1; i < benefits.length; i++) {
    const p = priorityForBenefit(benefits[i], campaignsIndex);
    if (p > bestPriority) {
      best = benefits[i];
      bestPriority = p;
    }
  }
  return best;
}
