import type { Campaign } from "@/types";
import { formatOptionalDate, formatDate } from "./format-date";

export function getCampaignItemCount(campaign: Campaign): number {
  const config = campaign.config;
  const products = "productIds" in config ? config.productIds.length : 0;
  const collections = "collectionIds" in config ? config.collectionIds.length : 0;
  return products + collections;
}

export function getCampaignScheduleDisplay(campaign: Campaign): {
  label: string;
  value: string;
} {
  const start = formatOptionalDate(campaign.startsAt);
  const end = formatOptionalDate(campaign.endsAt);
  const dateRange =
    start || end ? [start, end].filter(Boolean).join(" → ") : null;

  return {
    label: dateRange ? "Schedule" : "Created",
    value: dateRange || formatDate(campaign.createdAt),
  };
}
