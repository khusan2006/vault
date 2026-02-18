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

export const NOTIFICATION_DEFAULTS: Record<CampaignType, NotificationDisplayConfig> = {
  early_access: {
    type: 'banner',
    message: 'You have access to exclusive products!',
    buttonText: 'View Exclusive Products',
    buttonUrl: '/apps/vault/exclusive',
    visuals: {
      primaryColor: '#7c3aed',
      textColor: '#ffffff',
      position: 'top',
    },
    behavior: {
      autoDismissSeconds: null,
      showFrequency: 'once_per_day',
    },
  },
  discounted_product: {
    type: 'banner',
    message: 'Member pricing unlocked just for you!',
    buttonText: 'Shop discounted items',
    buttonUrl: '/apps/vault/exclusive',
    visuals: {
      primaryColor: '#0f766e',
      textColor: '#ffffff',
      position: 'top',
    },
    behavior: {
      autoDismissSeconds: null,
      showFrequency: 'once_per_day',
    },
  },
  timer_sale: {
    type: 'banner',
    message: 'Limited-time price for qualifying customers!',
    buttonText: 'Shop the sale',
    buttonUrl: '/apps/vault/exclusive',
    visuals: {
      primaryColor: '#b91c1c',
      textColor: '#ffffff',
      position: 'top',
    },
    behavior: {
      autoDismissSeconds: null,
      showFrequency: 'once_per_day',
    },
  },
};

export function defaultLandingPage(): LandingPageDisplayConfig {
  return {
    enabled: true,
    heading: 'Exclusive Products',
    subheading: 'Products available just for you',
    gridColumns: 3,
    badgeText: 'Exclusive',
    badgeColor: '#7c3aed',
    itemLayout: 'card',
    showAddToCart: true,
    showCategory: true,
    showCompareAt: true,
    showRatings: true,
  };
}

export function defaultProductPage(): ProductPageDisplayConfig {
  return {
    showStrikethroughPricing: true,
    discountBadge: {
      enabled: true,
      text: 'Member Price',
      color: '#7c3aed',
    },
    banner: null,
  };
}

export function defaultTimer(): TimerDisplayConfig {
  return {
    timerType: 'per_customer',
    position: 'above_add_to_cart',
    expiredMessage: 'This offer has expired',
    style: 'default',
  };
}

export function createDefaultDisplayConfig(
  type: 'early_access',
): EarlyAccessDisplayConfig;
export function createDefaultDisplayConfig(
  type: 'discounted_product',
): DiscountedProductDisplayConfig;
export function createDefaultDisplayConfig(
  type: 'timer_sale',
): TimerSaleDisplayConfig;
export function createDefaultDisplayConfig(
  type: CampaignType,
): CampaignDisplayConfig {
  switch (type) {
    case 'early_access':
      return {
        notification: NOTIFICATION_DEFAULTS.early_access,
        landingPage: defaultLandingPage(),
      };
    case 'discounted_product':
      return {
        notification: NOTIFICATION_DEFAULTS.discounted_product,
        landingPage: {
          ...defaultLandingPage(),
          badgeText: 'VIP Price',
        },
        productPage: defaultProductPage(),
      };
    case 'timer_sale':
      return {
        notification: NOTIFICATION_DEFAULTS.timer_sale,
        productPage: defaultProductPage(),
        timer: defaultTimer(),
      };
  }
}
