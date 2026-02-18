import type { Campaign, CampaignConfig } from "@/types";
import type { SelectedResource } from "@/hooks/useResourcePicker";

export function inferResourceLabel(id: string, prefix: string) {
  const parts = id.split("/");
  const tail = parts[parts.length - 1] ?? "";
  const suffix = tail ? ` ${tail}` : "";
  return `${prefix}${suffix}`;
}

export function mergeSelectedResources(
  ids: string[],
  existing: SelectedResource[],
  prefix: string,
) {
  const byId = new Map(existing.map((item) => [item.id, item]));
  return ids.map((id) => byId.get(id) ?? { id, title: inferResourceLabel(id, prefix) });
}

export function seedSelectedResourcesFromCampaign(
  campaign: Campaign,
  existing: {
    products: SelectedResource[];
    collections: SelectedResource[];
  },
) {
  const config = campaign.config as CampaignConfig;

  return {
    products: mergeSelectedResources(
      config.productIds ?? [],
      existing.products,
      "Product",
    ),
    collections: mergeSelectedResources(
      config.collectionIds ?? [],
      existing.collections,
      "Collection",
    ),
  };
}
