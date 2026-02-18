import type { CampaignType } from './campaign-config.types.js';

// -----------------------------------------------------------------------------
// Shared building blocks
// -----------------------------------------------------------------------------

export type DisplayType = 'banner' | 'modal' | 'toast' | 'badge';

export type DisplayPosition = 'top' | 'bottom' | 'bottom-right' | 'bottom-left';

export type ShowFrequency =
  | 'every_visit'
  | 'once_per_session'
  | 'once_per_day'
  | 'once_per_week';

export interface DisplayVisuals {
  primaryColor: string;
  textColor: string;
  position: DisplayPosition;
}

export interface DisplayBehavior {
  autoDismissSeconds: number | null;
  showFrequency: ShowFrequency;
}

// Theme configuration
export type ThemePreset = 'rounded' | 'sharp' | 'soft' | 'minimal';

export interface StyleTokens {
  // Card
  cardBorderRadius: string;
  cardShadow: string;
  cardBackground: string;
  cardBorderColor: string;
  cardHoverShadow: string;
  cardHoverLift: string;
  cardImageAspectRatio: string;
  cardInfoPadding: string;
  cardTitleSize: string;
  cardTitleColor: string;
  cardPriceSize: string;
  cardPriceColor: string;
  cardButtonBg: string;
  cardButtonColor: string;
  cardButtonRadius: string;

  // Grid
  gridGap: string;
  gridMobileGap: string;

  // Page
  pageMaxWidth: string;
  pagePadding: string;
  headerSpacing: string;
  titleSize: string;
  titleColor: string;
  subtitleSize: string;
  subtitleColor: string;

  // Notifications
  notifBorderRadius: string;
  notifFontSize: string;
  notifButtonRadius: string;

  // Timer
  timerBorderRadius: string;
  timerNumSize: string;

  // Font weights
  titleWeight: string;
  subtitleWeight: string;
  cardTitleWeight: string;
  cardPriceWeight: string;
}

export interface ThemeConfig {
  preset: ThemePreset;
  overrides: Partial<StyleTokens>;
}

export interface NotificationDisplayConfig {
  type: DisplayType;
  message: string;
  buttonText: string;
  buttonUrl: string;
  visuals: {
    primaryColor: string;
    textColor: string;
    position: DisplayPosition;
  };
  behavior: {
    autoDismissSeconds: number | null;
    showFrequency: ShowFrequency;
  };
}

export type ItemLayout = 'card' | 'row' | 'minimal';

export interface LandingPageDisplayConfig {
  enabled: boolean;
  heading: string;
  subheading: string;
  gridColumns: 2 | 3 | 4;
  badgeText: string;
  badgeColor: string;
  itemLayout: ItemLayout;
  showAddToCart: boolean;
  showCategory: boolean;
  showCompareAt: boolean;
  showRatings: boolean;
}

export interface ProductPageDisplayConfig {
  showStrikethroughPricing: boolean;
  discountBadge: {
    enabled: boolean;
    text: string;
    color: string;
  };
  banner: {
    enabled: boolean;
    message: string;
    bgColor: string;
    textColor: string;
  } | null;
}

export type TimerStyle = 'default' | 'minimal' | 'urgent';
export type TimerPosition = 'above_add_to_cart' | 'below_price' | 'above_title';
export type TimerType = 'per_customer' | 'global';

export interface TimerDisplayConfig {
  timerType: TimerType;
  position: TimerPosition;
  expiredMessage: string;
  style: TimerStyle;
}

// -----------------------------------------------------------------------------
// Per-campaign-type display configs
// -----------------------------------------------------------------------------

export interface EarlyAccessDisplayConfig {
  notification: NotificationDisplayConfig;
  landingPage: LandingPageDisplayConfig;
  theme?: ThemeConfig;
}

export interface DiscountedProductDisplayConfig {
  notification: NotificationDisplayConfig;
  landingPage: LandingPageDisplayConfig;
  productPage: ProductPageDisplayConfig;
  theme?: ThemeConfig;
}

export interface TimerSaleDisplayConfig {
  notification: NotificationDisplayConfig;
  productPage: ProductPageDisplayConfig;
  timer: TimerDisplayConfig;
  theme?: ThemeConfig;
}

export type CampaignDisplayConfig =
  | EarlyAccessDisplayConfig
  | DiscountedProductDisplayConfig
  | TimerSaleDisplayConfig;

export type CampaignDisplayConfigByType = {
  early_access: EarlyAccessDisplayConfig;
  discounted_product: DiscountedProductDisplayConfig;
  timer_sale: TimerSaleDisplayConfig;
};
