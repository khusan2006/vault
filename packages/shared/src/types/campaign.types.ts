import type { CampaignType, CampaignConfig } from './campaign-config.types.js';
import type { ConditionGroup } from './condition.types.js';
import type { Benefit } from './benefit.types.js';

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'archived';

export interface Campaign {
  id: string;
  shopId: string;
  type: CampaignType;
  name: string;
  description: string | null;
  conditions: ConditionGroup;
  config: CampaignConfig;
  /** @deprecated Use `config` instead. Kept for backward compatibility. */
  benefits: Benefit[] | null;
  priority: number;
  status: CampaignStatus;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignListResponse {
  campaigns: Campaign[];
  total: number;
}

export interface SetupStatus {
  themeEmbedEnabled: boolean;
  hasCampaign: boolean;
  hasBenefits: boolean;
  hasActiveCampaign: boolean;
}
