"use client";

import { Badge } from "@shopify/polaris";
import type { CampaignStatus } from "@/types";
import { CAMPAIGN_STATUS_TONE_MAP } from "@/features/campaigns/constants";

interface StatusBadgeProps {
  status: CampaignStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge tone={CAMPAIGN_STATUS_TONE_MAP[status]}>{status}</Badge>;
}
