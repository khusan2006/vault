interface TabConfigOptions {
  productCount: number;
  ruleCount: number;
  extra?: {
    id: string;
    content: string;
    badge?: string;
  }[];
}

export const EDIT_FLOW_TAB_LABELS = {
  products: "Products",
  audience: "Audience",
  preview: "Preview",
  discount: "Discount",
  display: "Display",
  timer: "Timer & discount",
} as const;

export function buildEditFlowTabs({
  productCount,
  ruleCount,
  extra = [],
}: TabConfigOptions) {
  return [
    {
      id: "products",
      content: EDIT_FLOW_TAB_LABELS.products,
      badge: productCount > 0 ? String(productCount) : "All",
    },
    {
      id: "audience",
      content: EDIT_FLOW_TAB_LABELS.audience,
      badge: ruleCount > 0 ? String(ruleCount) : "All",
    },
    ...extra,
  ];
}

export const EDIT_FLOW_DESCRIPTIONS = {
  early_access:
    "Switch between products, audience rules, and display settings.",
  discounted_product:
    "Switch between products, audience rules, discount settings, and storefront display.",
  timer_sale:
    "Switch between products, audience rules, timer settings, and storefront display.",
} as const;
