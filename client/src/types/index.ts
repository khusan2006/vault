// Condition types
export type ConditionOperator = 'AND' | 'OR';

export type ConditionType =
  | 'customer_tag'
  | 'account_age_days'
  | 'total_spent'
  | 'order_count';

export type ComparisonOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal';

export interface Condition {
  type: ConditionType;
  operator: ComparisonOperator;
  value: string | number;
}

export interface ConditionGroup {
  operator: ConditionOperator;
  conditions: (Condition | ConditionGroup)[];
}

// Benefit types
export type BenefitType = 'visibility' | 'discount' | 'free_product';

export type DiscountType = 'percentage' | 'fixed_amount';

export interface DiscountConfig {
  type: DiscountType;
  value: number;
}

export interface BaseBenefit {
  type: BenefitType;
  productIds?: string[];
  collectionIds?: string[];
}

export interface VisibilityBenefit extends BaseBenefit {
  type: 'visibility';
}

export interface DiscountBenefit extends BaseBenefit {
  type: 'discount';
  discount: DiscountConfig;
}

export interface FreeProductBenefit extends BaseBenefit {
  type: 'free_product';
  maxClaimsPerCustomer: number;
}

export type Benefit = VisibilityBenefit | DiscountBenefit | FreeProductBenefit;

// Campaign types
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'archived';

export interface Campaign {
  id: string;
  shopId: string;
  name: string;
  description: string | null;
  conditions: ConditionGroup;
  benefits: Benefit[];
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
