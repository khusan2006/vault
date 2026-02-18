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

export function isVisibilityBenefit(
  benefit: Benefit,
): benefit is VisibilityBenefit {
  return benefit.type === 'visibility';
}

export function isDiscountBenefit(benefit: Benefit): benefit is DiscountBenefit {
  return benefit.type === 'discount';
}
