import type { CampaignType, NotificationDisplayConfig, LandingPageDisplayConfig, ProductPageDisplayConfig, TimerDisplayConfig, EarlyAccessDisplayConfig, DiscountedProductDisplayConfig, TimerSaleDisplayConfig } from '../types/index.js';
export declare const NOTIFICATION_DEFAULTS: Record<CampaignType, NotificationDisplayConfig>;
export declare function defaultLandingPage(): LandingPageDisplayConfig;
export declare function defaultProductPage(): ProductPageDisplayConfig;
export declare function defaultTimer(): TimerDisplayConfig;
export declare function createDefaultDisplayConfig(type: 'early_access'): EarlyAccessDisplayConfig;
export declare function createDefaultDisplayConfig(type: 'discounted_product'): DiscountedProductDisplayConfig;
export declare function createDefaultDisplayConfig(type: 'timer_sale'): TimerSaleDisplayConfig;
