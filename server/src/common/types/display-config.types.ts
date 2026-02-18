export {
  type DisplayType,
  type DisplayPosition,
  type ShowFrequency,
  type DisplayVisuals,
  type DisplayBehavior,
  type NotificationDisplayConfig,
  type ItemLayout,
  type LandingPageDisplayConfig,
  type ProductPageDisplayConfig,
  type TimerStyle,
  type TimerPosition,
  type TimerType,
  type TimerDisplayConfig,
  type EarlyAccessDisplayConfig,
  type DiscountedProductDisplayConfig,
  type TimerSaleDisplayConfig,
  type CampaignDisplayConfig,
  type CampaignDisplayConfigByType,
} from '@vault/shared/types/display-config.types.js';

export {
  createDefaultDisplayConfig,
  normalizeDisplayConfig,
} from '@vault/shared/display/index.js';
