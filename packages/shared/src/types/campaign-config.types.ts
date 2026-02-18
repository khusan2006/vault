import type { DiscountConfig } from './benefit.types.js';
import type {
  EarlyAccessDisplayConfig,
  DiscountedProductDisplayConfig,
  TimerSaleDisplayConfig,
  TimerType,
} from './display-config.types.js';

export type CampaignType = 'early_access' | 'discounted_product' | 'timer_sale';

export type DiscountMethod = 'price_change' | 'discount_code';

// -----------------------------------------------------------------------------
// Per-type configuration
// -----------------------------------------------------------------------------

export type EarlyAccessStorefrontApproach =
  | 'customer_page'
  | 'storefront_section'
  | 'modal';

export interface EarlyAccessConfig {
  productIds: string[];
  collectionIds: string[];
  storefrontApproach?: EarlyAccessStorefrontApproach;
  displayConfig?: EarlyAccessDisplayConfig;
}

export interface DiscountedProductConfig {
  productIds: string[];
  collectionIds: string[];
  discount: DiscountConfig;
  displayConfig?: DiscountedProductDisplayConfig;
}

export interface TimerSaleConfig {
  productIds: string[];
  collectionIds: string[];
  discount: DiscountConfig;
  discountMethod: DiscountMethod;
  timerDurationMinutes: number;
  showCountdown: boolean;
  timerType: TimerType;
  displayConfig?: TimerSaleDisplayConfig;
}

// -----------------------------------------------------------------------------
// Discriminated union
// -----------------------------------------------------------------------------

export type CampaignConfig =
  | EarlyAccessConfig
  | DiscountedProductConfig
  | TimerSaleConfig;

// -----------------------------------------------------------------------------
// Type guards
// -----------------------------------------------------------------------------

export function isEarlyAccessConfig(
  type: CampaignType,
  _config: CampaignConfig,
): _config is EarlyAccessConfig {
  return type === 'early_access';
}

export function isDiscountedProductConfig(
  type: CampaignType,
  _config: CampaignConfig,
): _config is DiscountedProductConfig {
  return type === 'discounted_product';
}

export function isTimerSaleConfig(
  type: CampaignType,
  _config: CampaignConfig,
): _config is TimerSaleConfig {
  return type === 'timer_sale';
}

// -----------------------------------------------------------------------------
// Factory defaults
// -----------------------------------------------------------------------------

export const DEFAULT_CONFIGS: Record<CampaignType, CampaignConfig> = {
  early_access: {
    productIds: [],
    collectionIds: [],
  },
  discounted_product: {
    productIds: [],
    collectionIds: [],
    discount: { type: 'percentage', value: 0 },
  },
  timer_sale: {
    productIds: [],
    collectionIds: [],
    discount: { type: 'percentage', value: 0 },
    discountMethod: 'price_change',
    timerDurationMinutes: 60,
    showCountdown: true,
    timerType: 'per_customer',
  },
};
