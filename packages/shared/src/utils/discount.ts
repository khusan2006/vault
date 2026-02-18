import type { DiscountConfig } from '../types/benefit.types.js';

/**
 * Apply a discount to a price value.
 * Returns the discounted price (never below 0).
 */
export function calculateDiscountedPrice(
  price: number,
  discount: DiscountConfig,
): number {
  if (!discount || !discount.value) return price;
  const result =
    discount.type === 'percentage'
      ? price * (1 - discount.value / 100)
      : price - discount.value;
  return Math.max(0, result);
}

/**
 * Format savings amount as a human-readable string.
 * E.g. "Save $5.00" or "Save 20%"
 */
export function getSavingsLabel(
  originalPrice: number,
  discountedPrice: number,
  discount: DiscountConfig,
  currency?: string,
): string {
  if (discount.type === 'percentage') {
    return `Save ${discount.value}%`;
  }
  const saved = originalPrice - discountedPrice;
  const cur = currency || 'USD';
  try {
    const formatted = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: cur,
    }).format(saved);
    return `Save ${formatted}`;
  } catch {
    return `Save $${saved.toFixed(2)}`;
  }
}

/**
 * Format a discount as badge text.
 * E.g. "20% OFF" or "$5 OFF"
 */
export function getBadgeText(discount: DiscountConfig): string {
  if (discount.type === 'percentage') {
    return `${discount.value}% OFF`;
  }
  return `$${discount.value} OFF`;
}
