import type { ShowFrequency, LandingPageDisplayConfig } from '../types/display-config.types.js';

/** Time-to-live values for frequency gating (in milliseconds). */
export const FREQ_TTL: Record<ShowFrequency, number> = {
  every_visit: 0,
  once_per_session: -1, // -1 signals sessionStorage
  once_per_day: 86400000,
  once_per_week: 604800000,
};

/** Default landing page display configuration. */
export const DEFAULT_LANDING: LandingPageDisplayConfig = {
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
