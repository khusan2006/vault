import { BadRequestException } from '@nestjs/common';
import type { CampaignConfig, CampaignType, DiscountConfig } from '../common/types/index.js';
import {
  isDiscountedProductConfig,
  isEarlyAccessConfig,
  isTimerSaleConfig,
} from '../common/types/index.js';

const DISPLAY_TYPES = ['banner', 'modal', 'toast', 'badge'] as const;
const DISPLAY_POSITIONS = [
  'top',
  'bottom',
  'bottom-right',
  'bottom-left',
] as const;
const SHOW_FREQUENCIES = [
  'every_visit',
  'once_per_session',
  'once_per_day',
  'once_per_week',
] as const;
const ITEM_LAYOUTS = ['card', 'row', 'minimal'] as const;
const TIMER_POSITIONS = [
  'above_add_to_cart',
  'below_price',
  'above_title',
] as const;
const TIMER_STYLES = ['default', 'minimal', 'urgent'] as const;
const TIMER_TYPES = ['per_customer', 'global'] as const;
const DISCOUNT_METHODS = ['price_change', 'discount_code'] as const;
const DISCOUNT_TYPES = ['percentage', 'fixed_amount'] as const;
const STOREFRONT_APPROACHES = [
  'customer_page',
  'storefront_section',
  'modal',
] as const;

type RecordLike = Record<string, unknown>;

function fail(message: string): never {
  throw new BadRequestException(message);
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) fail(message);
}

function isRecord(value: unknown): value is RecordLike {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function expectRecord(value: unknown, message: string): RecordLike {
  assert(isRecord(value), message);
  return value;
}

function validateTargets(
  config: { productIds: unknown; collectionIds: unknown },
  context: string,
): void {
  assert(
    isStringArray(config.productIds),
    `${context}: productIds must be an array of strings`,
  );
  assert(
    isStringArray(config.collectionIds),
    `${context}: collectionIds must be an array of strings`,
  );
}

function validateDiscount(discount: unknown, context: string): void {
  const discountRecord = expectRecord(
    discount,
    `${context}: discount must be an object`,
  );
  const discountType = discountRecord.type;
  const discountValue = discountRecord.value;
  assert(
    typeof discountType === 'string',
    `${context}: discount.type must be a string`,
  );
  assert(
    DISCOUNT_TYPES.includes(discountType as any),
    `${context}: discount.type must be one of ${DISCOUNT_TYPES.join(', ')}`,
  );
  assert(isNumber(discountValue), `${context}: discount.value must be a number`);
  if (discountType === 'percentage') {
    assert(
      discountValue >= 0 && discountValue <= 100,
      `${context}: discount.value must be between 0 and 100`,
    );
  } else {
    assert(
      discountValue >= 0,
      `${context}: discount.value must be >= 0`,
    );
  }
}

function validateNotification(config: unknown, context: string): void {
  const notification = expectRecord(
    config,
    `${context}: notification must be an object`,
  );
  assert(
    DISPLAY_TYPES.includes(notification.type as any),
    `${context}: notification.type must be one of ${DISPLAY_TYPES.join(', ')}`,
  );
  assert(
    typeof notification.message === 'string',
    `${context}: notification.message must be a string`,
  );
  assert(
    typeof notification.buttonText === 'string',
    `${context}: notification.buttonText must be a string`,
  );
  assert(
    typeof notification.buttonUrl === 'string',
    `${context}: notification.buttonUrl must be a string`,
  );

  const visuals = expectRecord(
    notification.visuals,
    `${context}: notification.visuals must be an object`,
  );
  assert(
    typeof visuals.primaryColor === 'string',
    `${context}: notification.visuals.primaryColor must be a string`,
  );
  assert(
    typeof visuals.textColor === 'string',
    `${context}: notification.visuals.textColor must be a string`,
  );
  assert(
    DISPLAY_POSITIONS.includes(visuals.position as any),
    `${context}: notification.visuals.position must be one of ${DISPLAY_POSITIONS.join(', ')}`,
  );

  const behavior = expectRecord(
    notification.behavior,
    `${context}: notification.behavior must be an object`,
  );
  assert(
    behavior.autoDismissSeconds === null ||
      isNumber(behavior.autoDismissSeconds),
    `${context}: notification.behavior.autoDismissSeconds must be a number or null`,
  );
  assert(
    SHOW_FREQUENCIES.includes(behavior.showFrequency as any),
    `${context}: notification.behavior.showFrequency must be one of ${SHOW_FREQUENCIES.join(', ')}`,
  );
}

function validateLandingPage(config: unknown, context: string): void {
  const landingPage = expectRecord(
    config,
    `${context}: landingPage must be an object`,
  );
  assert(
    isBoolean(landingPage.enabled),
    `${context}: landingPage.enabled must be a boolean`,
  );
  assert(
    typeof landingPage.heading === 'string',
    `${context}: landingPage.heading must be a string`,
  );
  assert(
    typeof landingPage.subheading === 'string',
    `${context}: landingPage.subheading must be a string`,
  );
  assert(
    landingPage.gridColumns === 2 ||
      landingPage.gridColumns === 3 ||
      landingPage.gridColumns === 4,
    `${context}: landingPage.gridColumns must be 2, 3, or 4`,
  );
  assert(
    typeof landingPage.badgeText === 'string',
    `${context}: landingPage.badgeText must be a string`,
  );
  assert(
    typeof landingPage.badgeColor === 'string',
    `${context}: landingPage.badgeColor must be a string`,
  );
  assert(
    ITEM_LAYOUTS.includes(landingPage.itemLayout as any),
    `${context}: landingPage.itemLayout must be one of ${ITEM_LAYOUTS.join(', ')}`,
  );
  assert(
    isBoolean(landingPage.showAddToCart),
    `${context}: landingPage.showAddToCart must be a boolean`,
  );
  assert(
    isBoolean(landingPage.showCategory),
    `${context}: landingPage.showCategory must be a boolean`,
  );
  assert(
    isBoolean(landingPage.showCompareAt),
    `${context}: landingPage.showCompareAt must be a boolean`,
  );
  assert(
    isBoolean(landingPage.showRatings),
    `${context}: landingPage.showRatings must be a boolean`,
  );
}

function validateProductPage(config: unknown, context: string): void {
  const productPage = expectRecord(
    config,
    `${context}: productPage must be an object`,
  );
  assert(
    isBoolean(productPage.showStrikethroughPricing),
    `${context}: productPage.showStrikethroughPricing must be a boolean`,
  );

  const discountBadge = expectRecord(
    productPage.discountBadge,
    `${context}: productPage.discountBadge must be an object`,
  );
  assert(
    isBoolean(discountBadge.enabled),
    `${context}: productPage.discountBadge.enabled must be a boolean`,
  );
  assert(
    typeof discountBadge.text === 'string',
    `${context}: productPage.discountBadge.text must be a string`,
  );
  assert(
    typeof discountBadge.color === 'string',
    `${context}: productPage.discountBadge.color must be a string`,
  );

  const bannerValue = productPage.banner;
  if (bannerValue === null) {
    return;
  }

  const banner = expectRecord(
    bannerValue,
    `${context}: productPage.banner must be an object or null`,
  );
  assert(
    isBoolean(banner.enabled),
    `${context}: productPage.banner.enabled must be a boolean`,
  );
  assert(
    typeof banner.message === 'string',
    `${context}: productPage.banner.message must be a string`,
  );
  assert(
    typeof banner.bgColor === 'string',
    `${context}: productPage.banner.bgColor must be a string`,
  );
  assert(
    typeof banner.textColor === 'string',
    `${context}: productPage.banner.textColor must be a string`,
  );
}

function validateTimer(config: unknown, context: string): void {
  const timer = expectRecord(config, `${context}: timer must be an object`);
  assert(
    TIMER_TYPES.includes(timer.timerType as any),
    `${context}: timer.timerType must be one of ${TIMER_TYPES.join(', ')}`,
  );
  assert(
    TIMER_POSITIONS.includes(timer.position as any),
    `${context}: timer.position must be one of ${TIMER_POSITIONS.join(', ')}`,
  );
  assert(
    typeof timer.expiredMessage === 'string',
    `${context}: timer.expiredMessage must be a string`,
  );
  assert(
    TIMER_STYLES.includes(timer.style as any),
    `${context}: timer.style must be one of ${TIMER_STYLES.join(', ')}`,
  );
}

function validateDisplayConfig(
  type: CampaignType,
  displayConfig: unknown,
): void {
  const cfg = expectRecord(
    displayConfig,
    'displayConfig must be an object if provided',
  );

  switch (type) {
    case 'early_access': {
      assert(
        isRecord(cfg.notification),
        'displayConfig.notification must be an object',
      );
      assert(
        isRecord(cfg.landingPage),
        'displayConfig.landingPage must be an object',
      );
      validateNotification(cfg.notification, 'early_access');
      validateLandingPage(cfg.landingPage, 'early_access');
      break;
    }
    case 'discounted_product': {
      assert(
        isRecord(cfg.notification),
        'displayConfig.notification must be an object',
      );
      assert(
        isRecord(cfg.landingPage),
        'displayConfig.landingPage must be an object',
      );
      assert(
        isRecord(cfg.productPage),
        'displayConfig.productPage must be an object',
      );
      validateNotification(cfg.notification, 'discounted_product');
      validateLandingPage(cfg.landingPage, 'discounted_product');
      validateProductPage(cfg.productPage, 'discounted_product');
      break;
    }
    case 'timer_sale': {
      assert(
        isRecord(cfg.notification),
        'displayConfig.notification must be an object',
      );
      assert(
        isRecord(cfg.productPage),
        'displayConfig.productPage must be an object',
      );
      assert(
        isRecord(cfg.timer),
        'displayConfig.timer must be an object',
      );
      validateNotification(cfg.notification, 'timer_sale');
      validateProductPage(cfg.productPage, 'timer_sale');
      validateTimer(cfg.timer, 'timer_sale');
      break;
    }
  }
}

export function validateCampaignConfig(
  type: CampaignType,
  config: CampaignConfig,
): void {
  assert(isRecord(config), 'config must be an object');

  if (isEarlyAccessConfig(type, config)) {
    validateTargets(config, 'early_access');
    if (config.storefrontApproach !== undefined) {
      assert(
        STOREFRONT_APPROACHES.includes(config.storefrontApproach as any),
        `early_access: storefrontApproach must be one of ${STOREFRONT_APPROACHES.join(', ')}`,
      );
    }
    if (config.displayConfig) {
      validateDisplayConfig(type, config.displayConfig);
    }
    return;
  }

  if (isDiscountedProductConfig(type, config)) {
    validateTargets(config, 'discounted_product');
    validateDiscount(config.discount as DiscountConfig, 'discounted_product');
    if (config.displayConfig) {
      validateDisplayConfig(type, config.displayConfig);
    }
    return;
  }

  if (isTimerSaleConfig(type, config)) {
    validateTargets(config, 'timer_sale');
    validateDiscount(config.discount as DiscountConfig, 'timer_sale');
    assert(
      DISCOUNT_METHODS.includes(config.discountMethod as any),
      `timer_sale: discountMethod must be one of ${DISCOUNT_METHODS.join(', ')}`,
    );
    assert(
      isNumber(config.timerDurationMinutes),
      'timer_sale: timerDurationMinutes must be a number',
    );
    assert(
      config.timerDurationMinutes > 0,
      'timer_sale: timerDurationMinutes must be greater than 0',
    );
    assert(
      isBoolean(config.showCountdown),
      'timer_sale: showCountdown must be a boolean',
    );
    assert(
      TIMER_TYPES.includes(config.timerType as any),
      `timer_sale: timerType must be one of ${TIMER_TYPES.join(', ')}`,
    );
    if (config.displayConfig) {
      validateDisplayConfig(type, config.displayConfig);
    }
  }
}
