"use client";

import { Badge } from "@shopify/polaris";
import type { CampaignStatus } from "@/types";

const STATUS_TONE_MAP: Record<CampaignStatus, "success" | "info" | "warning" | "new"> = {
  active: "success",
  draft: "info",
  paused: "warning",
  archived: "new",
};

interface StatusBadgeProps {
  status: CampaignStatus;
}

/**
 * Renders a Polaris Badge with the appropriate tone for a campaign status.
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge tone={STATUS_TONE_MAP[status]}>{status}</Badge>;
}
