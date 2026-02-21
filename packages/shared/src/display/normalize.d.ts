import type { EarlyAccessDisplayConfig, DiscountedProductDisplayConfig, TimerSaleDisplayConfig } from '../types/index.js';
export declare function normalizeDisplayConfig(type: 'early_access', displayConfig?: EarlyAccessDisplayConfig, defaultsOverride?: EarlyAccessDisplayConfig): EarlyAccessDisplayConfig;
export declare function normalizeDisplayConfig(type: 'discounted_product', displayConfig?: DiscountedProductDisplayConfig, defaultsOverride?: DiscountedProductDisplayConfig): DiscountedProductDisplayConfig;
export declare function normalizeDisplayConfig(type: 'timer_sale', displayConfig?: TimerSaleDisplayConfig, defaultsOverride?: TimerSaleDisplayConfig): TimerSaleDisplayConfig;
