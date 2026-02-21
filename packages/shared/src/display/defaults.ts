import type {
  CampaignType,
  NotificationDisplayConfig,
  LandingPageDisplayConfig,
  ProductPageDisplayConfig,
  TimerDisplayConfig,
  TimerType,
  EarlyAccessDisplayConfig,
  DiscountedProductDisplayConfig,
  TimerSaleDisplayConfig,
  CampaignDisplayConfig,
  EarlyAccessStorefrontApproach,
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
    buttonUrl: '/collections/discounted',
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
    buttonUrl: '/collections/timer-sale',
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

export function defaultDiscountedLandingPage(): LandingPageDisplayConfig {
  return {
    ...defaultLandingPage(),
    heading: 'Member pricing',
    subheading: 'Exclusive discounted products for qualifying customers',
    badgeText: 'Member price',
    badgeColor: '#0f766e',
  };
}

export function defaultProductPage(): ProductPageDisplayConfig {
  return {
    showStrikethroughPricing: true,
    discountBadge: {
      enabled: true,
      text: 'Member price',
      color: '#0f766e',
    },
    banner: null,
  };
}

export function defaultTimerProductPage(): ProductPageDisplayConfig {
  return {
    showStrikethroughPricing: true,
    discountBadge: {
      enabled: true,
      text: 'Sale price',
      color: '#b91c1c',
    },
    banner: null,
  };
}

export function defaultTimer(timerType: TimerType = 'per_customer'): TimerDisplayConfig {
  return {
    timerType,
    position: 'above_add_to_cart',
    expiredMessage: 'This offer has expired',
    style: 'urgent',
  };
}

export function buildEarlyAccessDisplayConfig(
  approach: EarlyAccessStorefrontApproach,
): EarlyAccessDisplayConfig {
  const notification = { ...NOTIFICATION_DEFAULTS.early_access };
  const landingPage = defaultLandingPage();

  if (approach === 'modal') {
    notification.type = 'banner';
    notification.message =
      'You have exclusive early access! Browse products available only to you.';
    notification.buttonText = 'View Exclusive Products';
    notification.buttonUrl = '#vault-products-modal';
    notification.behavior = {
      ...notification.behavior,
      showFrequency: 'once_per_session',
    };
  } else if (approach === 'storefront_section') {
    notification.type = 'banner';
    notification.message =
      'Early access: Exclusive products are now available for you!';
    notification.visuals = {
      ...notification.visuals,
      position: 'top',
    };
  } else {
    notification.type = 'badge';
    notification.message = 'You have exclusive products available';
    notification.buttonText = 'View in My Account';
    notification.buttonUrl = '/account';
    landingPage.heading = 'Your Exclusive Products';
    landingPage.subheading =
      'These products are available only to you. Browse and shop before anyone else.';
  }

  return { notification, landingPage };
}

export function buildTimerSaleDisplayConfig(
  timerType: TimerType,
): TimerSaleDisplayConfig {
  return {
    notification: NOTIFICATION_DEFAULTS.timer_sale,
    productPage: defaultTimerProductPage(),
    timer: defaultTimer(timerType),
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
        landingPage: defaultDiscountedLandingPage(),
        productPage: defaultProductPage(),
      };
    case 'timer_sale':
      return {
        notification: NOTIFICATION_DEFAULTS.timer_sale,
        productPage: defaultTimerProductPage(),
        timer: defaultTimer(),
      };
  }
}
