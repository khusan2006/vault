import { Badge } from "@shopify/polaris";
import type { CampaignType } from "@/types";

interface CampaignTypeBadgeProps {
  type?: CampaignType;
}

export function CampaignTypeBadge({ type }: CampaignTypeBadgeProps) {
  switch (type) {
    case "early_access":
      return <Badge tone="info">Early Access</Badge>;
    case "discounted_product":
      return <Badge tone="success">Discount</Badge>;
    case "timer_sale":
      return <Badge tone="attention">Timer</Badge>;
    default:
      return null;
  }
}
