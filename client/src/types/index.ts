// =============================================================================
// Re-export shared types from @vault/shared
// =============================================================================

export {
  type ConditionOperator,
  type ConditionType,
  type ComparisonOperator,
  type Condition,
  type ConditionGroup,
} from '@vault/shared/types/condition.types';

export {
  type BenefitType,
  type DiscountType,
  type DiscountConfig,
  type BaseBenefit,
  type VisibilityBenefit,
  type DiscountBenefit,
  type FreeProductBenefit,
  type Benefit,
} from '@vault/shared/types/benefit.types';

export {
  type CampaignType,
  type DiscountMethod,
  type EarlyAccessStorefrontApproach,
  type EarlyAccessConfig,
  type DiscountedProductConfig,
  type TimerSaleConfig,
  type CampaignConfig,
  DEFAULT_CONFIGS,
} from '@vault/shared/types/campaign-config.types';

export {
  type CampaignStatus,
  type Campaign,
  type CampaignListResponse,
  type SetupStatus,
} from '@vault/shared/types/campaign.types';

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
  type ThemePreset,
  type StyleTokens,
  type ThemeConfig,
} from '@vault/shared/types/display-config.types';

// =============================================================================
// Client-only types
// =============================================================================

import type { DisplayType, DisplayPosition, ShowFrequency } from '@vault/shared/types/display-config.types';

export interface SetupTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: {
    label: string;
    url: string;
    external?: boolean;
  };
  secondaryAction?: {
    label: string;
    onAction: () => void;
  };
}

export interface DisplayFormState {
  displayType: DisplayType;
  messageText: string;
  buttonText: string;
  buttonUrl: string;
  primaryColor: string;
  textColor: string;
  position: DisplayPosition;
  showFrequency: ShowFrequency;
  autoDismissSeconds: string;
}
