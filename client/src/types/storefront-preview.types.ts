import type { RefObject } from "react";
import type {
  DiscountConfig,
  EarlyAccessStorefrontApproach,
  LandingPageDisplayConfig,
  NotificationDisplayConfig,
  ProductPageDisplayConfig,
  ThemeConfig,
  TimerDisplayConfig,
} from "@/types";
import type { SelectedResource } from "@/hooks/useResourcePicker";

export interface PreviewProduct {
  id: string;
  title: string;
  category?: string;
  price?: string;
  compareAt?: string;
  imageUrl?: string;
  imageColor?: string;
  imageGradient?: string;
}

export interface StorefrontPreviewProps {
  config: {
    notification: NotificationDisplayConfig;
    landingPage?: LandingPageDisplayConfig;
    productPage?: ProductPageDisplayConfig;
    timer?: TimerDisplayConfig;
    theme?: ThemeConfig;
  };
  device: "desktop" | "mobile";
  products?: SelectedResource[];
  view?: "landing" | "product";
  discount?: DiscountConfig;
  forceSampleProducts?: boolean;
  /** Ref to the preview container for highlight zone CSS data attribute */
  previewRef?: RefObject<HTMLDivElement | null>;
  approach?: EarlyAccessStorefrontApproach;
}

