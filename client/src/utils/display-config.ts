import type {
  DiscountedProductDisplayConfig,
  EarlyAccessDisplayConfig,
  EarlyAccessStorefrontApproach,
  ThemeConfig,
  TimerSaleDisplayConfig,
  TimerType,
} from "@/types";
import {
  buildEarlyAccessDisplayConfig,
  buildTimerSaleDisplayConfig,
  createDefaultDisplayConfig,
  normalizeDisplayConfig,
} from "@vault/shared/display";
import { resolveThemeConfig } from "@vault/shared/theme/tokens";

export function getThemeConfig(theme?: ThemeConfig): ThemeConfig {
  return resolveThemeConfig(theme);
}

export function getDefaultEarlyAccessDisplayConfig(
  approach: EarlyAccessStorefrontApproach,
): EarlyAccessDisplayConfig {
  return buildEarlyAccessDisplayConfig(approach);
}

export function getDefaultDiscountedDisplayConfig(): DiscountedProductDisplayConfig {
  return createDefaultDisplayConfig("discounted_product") as DiscountedProductDisplayConfig;
}

export function getDefaultTimerSaleDisplayConfig(
  timerType: TimerType,
): TimerSaleDisplayConfig {
  return buildTimerSaleDisplayConfig(timerType);
}

export function ensureEarlyAccessDisplayConfig(
  approach: EarlyAccessStorefrontApproach,
  displayConfig?: EarlyAccessDisplayConfig,
): EarlyAccessDisplayConfig {
  const defaults = buildEarlyAccessDisplayConfig(approach);
  return normalizeDisplayConfig(
    "early_access",
    displayConfig,
    defaults,
  ) as EarlyAccessDisplayConfig;
}

export function ensureDiscountedDisplayConfig(
  displayConfig?: DiscountedProductDisplayConfig,
): DiscountedProductDisplayConfig {
  return normalizeDisplayConfig(
    "discounted_product",
    displayConfig,
  ) as DiscountedProductDisplayConfig;
}

export function ensureTimerSaleDisplayConfig(
  timerType: TimerType,
  displayConfig?: TimerSaleDisplayConfig,
): TimerSaleDisplayConfig {
  const defaults = buildTimerSaleDisplayConfig(timerType);
  return normalizeDisplayConfig(
    "timer_sale",
    displayConfig,
    defaults,
  ) as TimerSaleDisplayConfig;
}
