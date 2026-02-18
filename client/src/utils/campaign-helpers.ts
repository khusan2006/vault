import type {
  Campaign,
  CampaignType,
  Condition,
  ConditionGroup,
} from "@/types";

// =============================================================================
// Campaign type labels + descriptions
// =============================================================================

export const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  early_access: "Early Access",
  discounted_product: "Discounted Product",
  timer_sale: "Timer Sale",
};

export const CAMPAIGN_TYPE_DESCRIPTIONS: Record<CampaignType, string> = {
  early_access:
    "Control which customers can see specific products. Hide products from non-qualifying customers.",
  discounted_product:
    "Show special pricing to qualifying customers with strikethrough pricing.",
  timer_sale:
    "Run countdown sales for all or specific customers with configurable discounts.",
};

// =============================================================================
// Config summary (replaces legacy summarizeBenefits)
// =============================================================================

export function summarizeConfig(campaign: Campaign): string {
  const { type, config } = campaign;

  switch (type) {
    case "early_access": {
      const count =
        ("productIds" in config ? config.productIds.length : 0) +
        ("collectionIds" in config ? config.collectionIds.length : 0);
      return count > 0 ? `${count} product(s) hidden` : "No products selected";
    }

    case "discounted_product": {
      if (!("discount" in config)) return "No discount set";
      const { discount } = config;
      return discount.type === "percentage"
        ? `${discount.value}% off`
        : `$${discount.value} off`;
    }

    case "timer_sale": {
      if (!("discount" in config) || !("timerDurationMinutes" in config))
        return "Timer sale";
      const { discount, timerDurationMinutes } = config;
      const discountLabel =
        discount.type === "percentage"
          ? `${discount.value}% off`
          : `$${discount.value} off`;
      return `${discountLabel} · ${timerDurationMinutes}min`;
    }

    default:
      return "—";
  }
}

/**
 * @deprecated Use `summarizeConfig` instead. Kept for backward compatibility.
 */
export function summarizeBenefits(campaign: Campaign): string {
  // Use new config-based summary if available
  if (campaign.config && Object.keys(campaign.config).length > 0) {
    return summarizeConfig(campaign);
  }

  // Legacy fallback
  const benefits = campaign.benefits ?? [];
  if (benefits.length === 0) return "No benefits";

  return benefits
    .map((b) => {
      switch (b.type) {
        case "visibility":
          return "Exclusive access";
        case "discount":
          return b.discount.type === "percentage"
            ? `${b.discount.value}% off`
            : `$${b.discount.value} off`;
        case "free_product":
          return "Free product";
      }
    })
    .join(", ");
}

// =============================================================================
// Audience summary
// =============================================================================

/**
 * Returns a short summary of a campaign's audience conditions for display in tables/lists.
 */
export function summarizeAudience(campaign: Campaign): string {
  const { conditions } = campaign;
  const items = conditions.conditions;
  if (items.length === 0) return "No conditions";

  const first = items[0];
  if (isCondition(first)) {
    const label = formatConditionLabel(first);
    if (items.length === 1) return label;
    return `${label} +${items.length - 1} more`;
  }

  return `${items.length} condition groups`;
}

function isCondition(item: Condition | ConditionGroup): item is Condition {
  return "type" in item && !("conditions" in item);
}

function formatConditionLabel(condition: Condition): string {
  const operatorLabel = condition.operator.replace(/_/g, " ");

  switch (condition.type) {
    case "customer_tag":
      return `Tag ${operatorLabel} "${condition.value}"`;
    case "total_spent":
      return `Spent ${operatorLabel} ${condition.value}`;
    case "order_count":
      return `Orders ${operatorLabel} ${condition.value}`;
    case "account_age_days":
      return `Account age ${operatorLabel} ${condition.value}d`;
  }
}
