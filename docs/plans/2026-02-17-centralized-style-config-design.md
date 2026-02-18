# Centralized Style Configuration System

**Date**: 2026-02-17
**Status**: Approved

## Problem

1. **Bug**: The storefront loading indicator (`#vault-loading`) is never removed when products load — it persists alongside rendered product cards.
2. **Hardcoded styles**: ~50+ style values (border-radius, gap, shadows, font sizes, colors) are hardcoded across `.styles.ts` files, `vault.css`, and component JS. Merchants cannot customize the look of their storefront components.
3. **No centralized control**: Display settings are scattered across multiple files with no single source of truth for style values.

## Solution

### 1. Bug Fix

Clear the grid before appending product cards in `exclusive-page.ts`:
```typescript
grid.innerHTML = '';
```

### 2. CSS Custom Properties Architecture

All hardcoded style values become CSS custom properties (`--vault-*`) with sensible defaults. A `ThemeConfig` stored in each campaign's `displayConfig` drives the values at runtime.

**Data flow:**
```
Admin UI (preset + overrides)
  → Campaign displayConfig.theme (ThemeConfig)
  → Storefront JS sets --vault-* on .v-excl container
  → CSS rules consume var(--vault-*, fallback)
  → Admin preview applies same vars on preview wrapper
```

### 3. Type Definitions (in `@vault/shared`)

```typescript
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
}

export interface ThemeConfig {
  preset: ThemePreset;
  overrides: Partial<StyleTokens>;
}
```

### 4. Theme Presets

| Token | `rounded` (default) | `sharp` | `soft` | `minimal` |
|-------|---------------------|---------|--------|-----------|
| cardBorderRadius | 16px | 4px | 24px | 0px |
| cardShadow | 0 10px 20px -16px rgba(15,23,42,0.4) | 0 1px 3px rgba(0,0,0,0.1) | 0 4px 24px rgba(0,0,0,0.06) | none |
| cardBorderColor | #e2e8f0 | #d1d5db | #f1f5f9 | #e5e7eb |
| cardBackground | #fff | #fff | #fff | transparent |
| cardHoverShadow | 0 8px 24px rgba(0,0,0,0.08) | 0 2px 6px rgba(0,0,0,0.12) | 0 8px 32px rgba(0,0,0,0.06) | 0 1px 3px rgba(0,0,0,0.08) |
| cardHoverLift | -2px | -1px | -3px | 0px |
| cardImageAspectRatio | 3/4 | 1/1 | 3/4 | 4/5 |
| cardInfoPadding | 12px 16px | 10px 12px | 16px 20px | 8px 0 |
| cardTitleSize | 14px | 13px | 15px | 14px |
| cardTitleColor | #0f172a | #111827 | #1e293b | #18181b |
| cardPriceSize | 14px | 13px | 15px | 14px |
| cardPriceColor | #0f172a | #111827 | #1e293b | #18181b |
| cardButtonBg | #0f172a | #111827 | #1e293b | #18181b |
| cardButtonColor | #fff | #fff | #fff | #fff |
| cardButtonRadius | 8px | 2px | 999px | 0px |
| gridGap | 24px | 16px | 32px | 20px |
| gridMobileGap | 12px | 8px | 16px | 12px |
| pageMaxWidth | 1200px | 1200px | 1200px | 1200px |
| pagePadding | 40px 20px | 32px 16px | 48px 24px | 40px 20px |
| headerSpacing | 40px | 32px | 48px | 40px |
| titleSize | 28px | 24px | 32px | 28px |
| titleColor | #18181b | #111827 | #1e293b | #18181b |
| subtitleSize | 16px | 14px | 18px | 16px |
| subtitleColor | #6b7280 | #6b7280 | #94a3b8 | #6b7280 |
| notifBorderRadius | 12px | 4px | 20px | 0px |
| notifFontSize | 14px | 13px | 15px | 14px |
| notifButtonRadius | 6px | 2px | 999px | 0px |
| timerBorderRadius | 10px | 4px | 16px | 0px |
| timerNumSize | 28px | 24px | 32px | 28px |

### 5. Shared Utility: `resolveTokens()`

Located in `@vault/shared/theme/tokens.ts`:

```typescript
export function resolveTokens(theme?: ThemeConfig): StyleTokens {
  const base = PRESETS[theme?.preset ?? 'rounded'];
  return { ...base, ...theme?.overrides };
}

export function tokensToCSS(tokens: StyleTokens): Record<string, string> {
  // Converts { cardBorderRadius: '16px' } to { '--vault-card-border-radius': '16px' }
}
```

Used by both storefront JS and admin preview — single source of truth.

### 6. CSS Migration

Every hardcoded value in `.styles.ts` files and `vault.css` becomes a CSS var:

```css
/* Before */
.v-card { border-radius: 16px; }

/* After */
.v-card { border-radius: var(--vault-card-border-radius, 16px); }
```

The fallback value matches the `rounded` preset, so components work even without JS setting the vars.

### 7. Storefront Application

In `exclusive-page.ts`, after loading the campaign config:

```typescript
import { resolveTokens, tokensToCSS } from '@vault/shared/theme/tokens';

const theme = displayConfig?.theme;
const cssVars = tokensToCSS(resolveTokens(theme));
Object.entries(cssVars).forEach(([prop, val]) =>
  container.style.setProperty(prop, val)
);
```

For notification/timer components (Shadow DOM), CSS vars inherit through the shadow boundary when set on an ancestor.

### 8. Admin Preview

In `StorefrontPreview.tsx`, apply the same CSS vars on the preview wrapper:

```tsx
const theme = config.theme;
const cssVars = tokensToCSS(resolveTokens(theme));
<div style={cssVars}>
  {/* preview content */}
</div>
```

### 9. Admin UI — Theme & Styles Section

Added to each customizer modal as the first menu item:

1. **Preset picker** — 4 visual cards with preview swatches
2. **Override sections** (collapsible):
   - Card Appearance — border-radius, shadow, background, border, button styles
   - Grid & Layout — gap, mobile gap, columns, max-width, padding
   - Typography — title/subtitle/price sizes and colors
   - Notifications — border-radius, font size, button radius
   - Timer — border-radius, number size

Each field shows the preset default as placeholder. Only changed values stored in `overrides`.

### 10. Display Config Changes

```typescript
// Add theme to each campaign display config type:
export interface EarlyAccessDisplayConfig {
  notification: NotificationDisplayConfig;
  landingPage: LandingPageDisplayConfig;
  theme?: ThemeConfig;  // ← NEW
}

export interface DiscountedProductDisplayConfig {
  notification: NotificationDisplayConfig;
  landingPage: LandingPageDisplayConfig;
  productPage: ProductPageDisplayConfig;
  theme?: ThemeConfig;  // ← NEW
}

export interface TimerSaleDisplayConfig {
  notification: NotificationDisplayConfig;
  productPage: ProductPageDisplayConfig;
  timer: TimerDisplayConfig;
  theme?: ThemeConfig;  // ← NEW
}
```

### 11. Files Changed

**Shared package** (`packages/shared/src/`):
- `types/display-config.types.ts` — Add `ThemeConfig`, `StyleTokens`, `ThemePreset` types; add `theme?` to display configs
- NEW `theme/tokens.ts` — Preset definitions, `resolveTokens()`, `tokensToCSS()` utility
- NEW `theme/index.ts` — Re-export

**Storefront package** (`packages/storefront/src/`):
- `features/exclusive-page.ts` — Fix loading bug; apply theme CSS vars
- `components/vault-product-card.styles.ts` — Replace hardcoded values with CSS vars
- `components/vault-banner.styles.ts` — Replace hardcoded values with CSS vars
- `components/vault-modal.styles.ts` — Replace hardcoded values with CSS vars
- `components/vault-toast.styles.ts` — Replace hardcoded values with CSS vars
- `components/vault-badge.styles.ts` — Replace hardcoded values with CSS vars
- `components/vault-timer.styles.ts` — Replace hardcoded values with CSS vars

**Theme extension** (`extensions/theme-extension/`):
- `assets/vault.css` — Replace hardcoded values with CSS vars

**Client** (`client/src/`):
- `components/campaigns/preview/StorefrontPreview.tsx` — Apply theme CSS vars on preview container
- NEW `components/campaigns/display/ThemeConfig.tsx` — Preset picker + override sections
- `components/campaigns/display/LandingPageConfig.tsx` — Import ThemeConfig section
- `components/campaigns/discounted-product-wizard/DiscountedProductCustomizerModal.tsx` — Add Theme menu item
- `components/campaigns/early-access-wizard/DisplayCustomizerModal.tsx` — Add Theme menu item
- `components/campaigns/timer-sale-wizard/TimerSaleCustomizerModal.tsx` — Add Theme menu item
- `hooks/useCampaignForm.ts` — Handle theme in form state

### 12. Backward Compatibility

- All CSS vars have fallback values matching current hardcoded values (`rounded` preset)
- `theme` field is optional — existing campaigns without it render identically to today
- No migration needed for existing data
