import type {
  CampaignType,
  NotificationDisplayConfig,
  LandingPageDisplayConfig,
  ProductPageDisplayConfig,
  TimerDisplayConfig,
  EarlyAccessDisplayConfig,
  DiscountedProductDisplayConfig,
  TimerSaleDisplayConfig,
  CampaignDisplayConfig,
} from '../types/index.js';
import { createDefaultDisplayConfig } from './defaults.js';

function mergeNotification(
  base: NotificationDisplayConfig,
  override?: Partial<NotificationDisplayConfig>,
): NotificationDisplayConfig {
  if (!override) return base;
  return {
    ...base,
    ...override,
    visuals: {
      ...base.visuals,
      ...(override.visuals ?? {}),
    },
    behavior: {
      ...base.behavior,
      ...(override.behavior ?? {}),
    },
  };
}

function mergeLandingPage(
  base: LandingPageDisplayConfig,
  override?: Partial<LandingPageDisplayConfig>,
): LandingPageDisplayConfig {
  return { ...base, ...(override ?? {}) };
}

function mergeProductPage(
  base: ProductPageDisplayConfig,
  override?: Partial<ProductPageDisplayConfig>,
): ProductPageDisplayConfig {
  if (!override) return base;
  return {
    ...base,
    ...override,
    discountBadge: {
      ...base.discountBadge,
      ...(override.discountBadge ?? {}),
    },
    banner: override.banner ?? base.banner,
  };
}

function mergeTimer(
  base: TimerDisplayConfig,
  override?: Partial<TimerDisplayConfig>,
): TimerDisplayConfig {
  return { ...base, ...(override ?? {}) };
}

export function normalizeDisplayConfig(
  type: 'early_access',
  displayConfig?: EarlyAccessDisplayConfig,
): EarlyAccessDisplayConfig;
export function normalizeDisplayConfig(
  type: 'discounted_product',
  displayConfig?: DiscountedProductDisplayConfig,
): DiscountedProductDisplayConfig;
export function normalizeDisplayConfig(
  type: 'timer_sale',
  displayConfig?: TimerSaleDisplayConfig,
): TimerSaleDisplayConfig;
export function normalizeDisplayConfig(
  type: CampaignType,
  displayConfig?: CampaignDisplayConfig,
): CampaignDisplayConfig {
  switch (type) {
    case 'early_access': {
      const defaults = createDefaultDisplayConfig('early_access');
      if (!displayConfig) return defaults;
      const provided = displayConfig as Partial<EarlyAccessDisplayConfig>;
      return {
        notification: mergeNotification(
          defaults.notification,
          provided.notification,
        ),
        landingPage: mergeLandingPage(
          defaults.landingPage,
          provided.landingPage,
        ),
        theme: provided.theme,
      };
    }
    case 'discounted_product': {
      const defaults = createDefaultDisplayConfig('discounted_product');
      if (!displayConfig) return defaults;
      const provided = displayConfig as Partial<DiscountedProductDisplayConfig>;
      return {
        notification: mergeNotification(
          defaults.notification,
          provided.notification,
        ),
        landingPage: mergeLandingPage(
          defaults.landingPage,
          provided.landingPage,
        ),
        productPage: mergeProductPage(
          defaults.productPage,
          provided.productPage,
        ),
        theme: provided.theme,
      };
    }
    case 'timer_sale': {
      const defaults = createDefaultDisplayConfig('timer_sale');
      if (!displayConfig) return defaults;
      const provided = displayConfig as Partial<TimerSaleDisplayConfig>;
      return {
        notification: mergeNotification(
          defaults.notification,
          provided.notification,
        ),
        productPage: mergeProductPage(
          defaults.productPage,
          provided.productPage,
        ),
        timer: mergeTimer(defaults.timer, provided.timer),
        theme: provided.theme,
      };
    }
  }
}
