/**
 * Format a price in cents as a localized currency string.
 * Falls back to basic $X.XX format if Intl is unavailable.
 */
export function formatMoney(cents: number, currency?: string): string {
  const cur = currency || 'USD';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: cur,
    }).format(cents / 100);
  } catch {
    return '$' + (cents / 100).toFixed(2);
  }
}
