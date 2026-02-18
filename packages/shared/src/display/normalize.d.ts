import type { EarlyAccessDisplayConfig, DiscountedProductDisplayConfig, TimerSaleDisplayConfig } from '../types/index.js';
export declare function normalizeDisplayConfig(type: 'early_access', displayConfig?: EarlyAccessDisplayConfig): EarlyAccessDisplayConfig;
export declare function normalizeDisplayConfig(type: 'discounted_product', displayConfig?: DiscountedProductDisplayConfig): DiscountedProductDisplayConfig;
export declare function normalizeDisplayConfig(type: 'timer_sale', displayConfig?: TimerSaleDisplayConfig): TimerSaleDisplayConfig;
