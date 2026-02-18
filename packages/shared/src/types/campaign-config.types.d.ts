import type { DiscountConfig } from './benefit.types.js';
import type { EarlyAccessDisplayConfig, DiscountedProductDisplayConfig, TimerSaleDisplayConfig, TimerType } from './display-config.types.js';
export type CampaignType = 'early_access' | 'discounted_product' | 'timer_sale';
export type DiscountMethod = 'price_change' | 'discount_code';
export type EarlyAccessStorefrontApproach = 'customer_page' | 'storefront_section' | 'modal';
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
export type CampaignConfig = EarlyAccessConfig | DiscountedProductConfig | TimerSaleConfig;
export declare function isEarlyAccessConfig(type: CampaignType, _config: CampaignConfig): _config is EarlyAccessConfig;
export declare function isDiscountedProductConfig(type: CampaignType, _config: CampaignConfig): _config is DiscountedProductConfig;
export declare function isTimerSaleConfig(type: CampaignType, _config: CampaignConfig): _config is TimerSaleConfig;
export declare const DEFAULT_CONFIGS: Record<CampaignType, CampaignConfig>;
