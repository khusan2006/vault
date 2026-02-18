import type { Campaign } from "@/types";

export interface CampaignStats {
  activeCampaigns: number;
  totalCampaigns: number;
  draftCampaigns: number;
}

/**
 * Computes aggregate stats from a list of campaigns.
 */
export function computeCampaignStats(campaigns: Campaign[]): CampaignStats {
  return {
    activeCampaigns: campaigns.filter((c) => c.status === "active").length,
    totalCampaigns: campaigns.length,
    draftCampaigns: campaigns.filter((c) => c.status === "draft").length,
  };
}
