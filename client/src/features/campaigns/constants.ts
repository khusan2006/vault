import type { CampaignStatus } from "@/types";

export const CAMPAIGN_STATUS_TONE_MAP: Record<CampaignStatus, "success" | "info" | "warning" | "new"> = {
  active: "success",
  draft: "info",
  paused: "warning",
  archived: "new",
};

export const CAMPAIGN_STATUS_TONE_MAP_EXTENDED: Record<CampaignStatus, "success" | "info" | "attention" | "warning"> = {
  active: "success",
  draft: "info",
  paused: "attention",
  archived: "warning",
};
