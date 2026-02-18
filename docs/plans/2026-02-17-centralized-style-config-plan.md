# Centralized Style Configuration — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace all hardcoded style values with CSS custom properties driven by a centralized `ThemeConfig` (preset + overrides), fix the loading bug, and add a "Theme & Styles" admin UI section.

**Architecture:** A `StyleTokens` type defines every customizable value. Four presets (`rounded`/`sharp`/`soft`/`minimal`) provide complete token sets. `resolveTokens()` merges preset + overrides. `tokensToCSS()` converts tokens to `--vault-*` CSS vars. Applied identically on storefront (via JS on container) and admin preview (via inline styles). All `.styles.ts` and `vault.css` files consume `var(--vault-*, fallback)`.

**Tech Stack:** TypeScript, CSS Custom Properties, Polaris (admin UI), Vite (storefront build), Next.js 16 (client)

**Design doc:** `docs/plans/2026-02-17-centralized-style-config-design.md`

---

## Task 1: Fix Loading Indicator Bug

**Files:**
- Modify: `packages/storefront/src/features/exclusive-page.ts:122`

**Step 1: Fix the bug**

At line 122 in `exclusive-page.ts`, inside the `Promise.all(handles.map(loadProduct)).then((prods) => {` callback, add `grid.innerHTML = '';` as the first line before the product card loop. This removes the loading indicator and any stale content before appending fresh cards.

```typescript
// Line 122-123, change:
Promise.all(handles.map(loadProduct)).then((prods) => {
  let html = '';

// To:
Promise.all(handles.map(loadProduct)).then((prods) => {
  grid.innerHTML = '';
```

Also remove the now-unused `let html = '';` variable (it was declared but never used).

**Step 2: Build storefront**

Run: `npm run build:storefront`
Expected: Build succeeds, no errors.

**Step 3: Commit**

```bash
git add packages/storefront/src/features/exclusive-page.ts
git commit -m "fix: remove loading indicator when exclusive products finish loading"
```

---

## Task 2: Add Theme Types to `@vault/shared`

**Files:**
- Modify: `packages/shared/src/types/display-config.types.ts`

**Step 1: Add `ThemePreset`, `StyleTokens`, and `ThemeConfig` types**

At the end of the "Shared building blocks" section (after line 26, before `NotificationDisplayConfig`), add:

```typescript
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
}

export interface ThemeConfig {
  preset: ThemePreset;
  overrides: Partial<StyleTokens>;
}
```

**Step 2: Add `theme?` to each per-campaign display config**

Modify the three campaign display config interfaces (lines 90-105):

```typescript
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
```

**Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: Passes (optional field, backward compatible).

**Step 4: Commit**

```bash
git add packages/shared/src/types/display-config.types.ts
git commit -m "feat: add ThemeConfig, StyleTokens, ThemePreset types to display config"
```

---

## Task 3: Create Theme Token Presets & Utilities

**Files:**
- Create: `packages/shared/src/theme/presets.ts`
- Create: `packages/shared/src/theme/tokens.ts`
- Create: `packages/shared/src/theme/index.ts`
- Modify: `packages/shared/src/index.ts` (add re-export)

**Step 1: Create `presets.ts`** with all four preset definitions

Create `packages/shared/src/theme/presets.ts`. This file defines the full `StyleTokens` object for each of the four presets. Use the exact values from the design doc's preset table (Section 4).

```typescript
import type { StyleTokens, ThemePreset } from '../types/display-config.types.js';

export const PRESETS: Record<ThemePreset, StyleTokens> = {
  rounded: {
    cardBorderRadius: '16px',
    cardShadow: '0 10px 20px -16px rgba(15, 23, 42, 0.4)',
    cardBackground: '#fff',
    cardBorderColor: '#e2e8f0',
    cardHoverShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
    cardHoverLift: '-2px',
    cardImageAspectRatio: '3/4',
    cardInfoPadding: '12px 16px',
    cardTitleSize: '14px',
    cardTitleColor: '#0f172a',
    cardPriceSize: '14px',
    cardPriceColor: '#0f172a',
    cardButtonBg: '#0f172a',
    cardButtonColor: '#fff',
    cardButtonRadius: '8px',
    gridGap: '24px',
    gridMobileGap: '12px',
    pageMaxWidth: '1200px',
    pagePadding: '40px 20px',
    headerSpacing: '40px',
    titleSize: '28px',
    titleColor: '#18181b',
    subtitleSize: '16px',
    subtitleColor: '#6b7280',
    notifBorderRadius: '12px',
    notifFontSize: '14px',
    notifButtonRadius: '6px',
    timerBorderRadius: '10px',
    timerNumSize: '28px',
  },
  sharp: {
    cardBorderRadius: '4px',
    cardShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    cardBackground: '#fff',
    cardBorderColor: '#d1d5db',
    cardHoverShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
    cardHoverLift: '-1px',
    cardImageAspectRatio: '1/1',
    cardInfoPadding: '10px 12px',
    cardTitleSize: '13px',
    cardTitleColor: '#111827',
    cardPriceSize: '13px',
    cardPriceColor: '#111827',
    cardButtonBg: '#111827',
    cardButtonColor: '#fff',
    cardButtonRadius: '2px',
    gridGap: '16px',
    gridMobileGap: '8px',
    pageMaxWidth: '1200px',
    pagePadding: '32px 16px',
    headerSpacing: '32px',
    titleSize: '24px',
    titleColor: '#111827',
    subtitleSize: '14px',
    subtitleColor: '#6b7280',
    notifBorderRadius: '4px',
    notifFontSize: '13px',
    notifButtonRadius: '2px',
    timerBorderRadius: '4px',
    timerNumSize: '24px',
  },
  soft: {
    cardBorderRadius: '24px',
    cardShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
    cardBackground: '#fff',
    cardBorderColor: '#f1f5f9',
    cardHoverShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
    cardHoverLift: '-3px',
    cardImageAspectRatio: '3/4',
    cardInfoPadding: '16px 20px',
    cardTitleSize: '15px',
    cardTitleColor: '#1e293b',
    cardPriceSize: '15px',
    cardPriceColor: '#1e293b',
    cardButtonBg: '#1e293b',
    cardButtonColor: '#fff',
    cardButtonRadius: '999px',
    gridGap: '32px',
    gridMobileGap: '16px',
    pageMaxWidth: '1200px',
    pagePadding: '48px 24px',
    headerSpacing: '48px',
    titleSize: '32px',
    titleColor: '#1e293b',
    subtitleSize: '18px',
    subtitleColor: '#94a3b8',
    notifBorderRadius: '20px',
    notifFontSize: '15px',
    notifButtonRadius: '999px',
    timerBorderRadius: '16px',
    timerNumSize: '32px',
  },
  minimal: {
    cardBorderRadius: '0px',
    cardShadow: 'none',
    cardBackground: 'transparent',
    cardBorderColor: '#e5e7eb',
    cardHoverShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    cardHoverLift: '0px',
    cardImageAspectRatio: '4/5',
    cardInfoPadding: '8px 0',
    cardTitleSize: '14px',
    cardTitleColor: '#18181b',
    cardPriceSize: '14px',
    cardPriceColor: '#18181b',
    cardButtonBg: '#18181b',
    cardButtonColor: '#fff',
    cardButtonRadius: '0px',
    gridGap: '20px',
    gridMobileGap: '12px',
    pageMaxWidth: '1200px',
    pagePadding: '40px 20px',
    headerSpacing: '40px',
    titleSize: '28px',
    titleColor: '#18181b',
    subtitleSize: '16px',
    subtitleColor: '#6b7280',
    notifBorderRadius: '0px',
    notifFontSize: '14px',
    notifButtonRadius: '0px',
    timerBorderRadius: '0px',
    timerNumSize: '28px',
  },
};
```

**Step 2: Create `tokens.ts`** with `resolveTokens()` and `tokensToCSS()` utilities

Create `packages/shared/src/theme/tokens.ts`:

```typescript
import type { ThemeConfig, StyleTokens } from '../types/display-config.types.js';
import { PRESETS } from './presets.js';

/**
 * Resolves a ThemeConfig into a complete StyleTokens object
 * by merging the preset base with any overrides.
 */
export function resolveTokens(theme?: ThemeConfig): StyleTokens {
  const base = PRESETS[theme?.preset ?? 'rounded'];
  if (!theme?.overrides) return base;
  return { ...base, ...theme.overrides };
}

/**
 * Converts camelCase token key to kebab-case CSS var name.
 * e.g. "cardBorderRadius" → "--vault-card-border-radius"
 */
function toVarName(key: string): string {
  const kebab = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
  return `--vault-${kebab}`;
}

/**
 * Converts a StyleTokens object into CSS custom property key-value pairs.
 * e.g. { cardBorderRadius: '16px' } → { '--vault-card-border-radius': '16px' }
 */
export function tokensToCSS(tokens: StyleTokens): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(tokens)) {
    vars[toVarName(key)] = value;
  }
  return vars;
}

/**
 * Returns the default (rounded) preset tokens.
 */
export function defaultTokens(): StyleTokens {
  return { ...PRESETS.rounded };
}
```

**Step 3: Create `index.ts`** barrel export

Create `packages/shared/src/theme/index.ts`:

```typescript
export { PRESETS } from './presets.js';
export { resolveTokens, tokensToCSS, defaultTokens } from './tokens.js';
```

**Step 4: Add re-export from shared root**

In `packages/shared/src/index.ts`, add:

```typescript
export * from './theme/index.js';
```

**Step 5: Run typecheck**

Run: `npm run typecheck`
Expected: Passes.

**Step 6: Commit**

```bash
git add packages/shared/src/theme/ packages/shared/src/index.ts
git commit -m "feat: add theme preset definitions and resolveTokens/tokensToCSS utilities"
```

---

## Task 4: Migrate Product Card Styles to CSS Variables

**Files:**
- Modify: `packages/storefront/src/components/vault-product-card.styles.ts`

**Step 1: Replace hardcoded values with CSS var() references**

Replace every hardcoded value with `var(--vault-*, fallback)` where fallback matches the current (rounded) value. Key replacements:

| Selector | Property | Before | After |
|---|---|---|---|
| `.v-card` | `border-radius` | `16px` | `var(--vault-card-border-radius, 16px)` |
| `.v-card` | `background` | `#fff` | `var(--vault-card-background, #fff)` |
| `.v-card` | `border` | `1px solid #e2e8f0` | `1px solid var(--vault-card-border-color, #e2e8f0)` |
| `.v-card` | `box-shadow` | `0 10px 20px -16px rgba(15, 23, 42, 0.4)` | `var(--vault-card-shadow, 0 10px 20px -16px rgba(15, 23, 42, 0.4))` |
| `.v-card:hover` | `box-shadow` | `0 8px 24px rgba(0, 0, 0, 0.08)` | `var(--vault-card-hover-shadow, 0 8px 24px rgba(0, 0, 0, 0.08))` |
| `.v-card:hover` | `transform` | `translateY(-2px)` | `translateY(var(--vault-card-hover-lift, -2px))` |
| `.v-card__imgwrap` | `aspect-ratio` | `3/4` | `var(--vault-card-image-aspect-ratio, 3/4)` |
| `.v-card__info` | `padding` | `12px 16px` | `var(--vault-card-info-padding, 12px 16px)` |
| `.v-card__title` | `font-size` | `14px` | `var(--vault-card-title-size, 14px)` |
| `.v-card__title` | `color` | `#0f172a` | `var(--vault-card-title-color, #0f172a)` |
| `.v-card__price` | `font-size` | `14px` | `var(--vault-card-price-size, 14px)` |
| `.v-card__price` | `color` | `#0f172a` | `var(--vault-card-price-color, #0f172a)` |
| `.v-card__cart` | `background` | `#0f172a` | `var(--vault-card-button-bg, #0f172a)` |
| `.v-card__cart` | `color` | `#fff` | `var(--vault-card-button-color, #fff)` |
| `.v-card__cart` | `border-radius` | `8px` | `var(--vault-card-button-radius, 8px)` |

Also apply the same changes to `.v-card--row` and `.v-card--minimal` layout variants where they override these values.

**Step 2: Build storefront**

Run: `npm run build:storefront`
Expected: Build succeeds. Visual output identical (defaults match current values).

**Step 3: Commit**

```bash
git add packages/storefront/src/components/vault-product-card.styles.ts
git commit -m "refactor: migrate product card styles to CSS custom properties"
```

---

## Task 5: Migrate Notification Styles to CSS Variables

**Files:**
- Modify: `packages/storefront/src/components/vault-banner.styles.ts`
- Modify: `packages/storefront/src/components/vault-modal.styles.ts`
- Modify: `packages/storefront/src/components/vault-toast.styles.ts`
- Modify: `packages/storefront/src/components/vault-badge.styles.ts`

**Step 1: Replace hardcoded values in all four notification `.styles.ts` files**

For each file, replace `border-radius`, `font-size` (message text), and button `border-radius` with:
- `var(--vault-notif-border-radius, <current>)`
- `var(--vault-notif-font-size, <current>)`
- `var(--vault-notif-button-radius, <current>)`

**Banner** (`vault-banner.styles.ts`):
- `.v-banner__msg` font-size: `14px` → `var(--vault-notif-font-size, 14px)`
- `.v-banner__btn` border-radius: `6px` → `var(--vault-notif-button-radius, 6px)`

**Modal** (`vault-modal.styles.ts`):
- `.v-modal__box` border-radius: `16px` → `var(--vault-notif-border-radius, 16px)`
- `.v-modal__title` font-size: `18px` → `var(--vault-notif-font-size, 18px)` (Note: modal title is larger — keep as-is or use a separate token. For consistency use the notif token but keep the 18px fallback)
- `.v-modal__btn` border-radius: `8px` → `var(--vault-notif-button-radius, 8px)`

**Toast** (`vault-toast.styles.ts`):
- `.v-toast` border-radius: `12px` → `var(--vault-notif-border-radius, 12px)`
- `.v-toast__msg` font-size: `14px` → `var(--vault-notif-font-size, 14px)`
- `.v-toast__btn` border-radius: `6px` → `var(--vault-notif-button-radius, 6px)`

**Badge** (`vault-badge.styles.ts`):
- `.v-badge__panel` border-radius: `12px` → `var(--vault-notif-border-radius, 12px)`
- `.v-badge__msg` font-size: `14px` → `var(--vault-notif-font-size, 14px)`
- `.v-badge__btn` border-radius: `6px` → `var(--vault-notif-button-radius, 6px)`

**Step 2: Build storefront**

Run: `npm run build:storefront`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add packages/storefront/src/components/vault-banner.styles.ts packages/storefront/src/components/vault-modal.styles.ts packages/storefront/src/components/vault-toast.styles.ts packages/storefront/src/components/vault-badge.styles.ts
git commit -m "refactor: migrate notification component styles to CSS custom properties"
```

---

## Task 6: Migrate Timer Styles to CSS Variables

**Files:**
- Modify: `packages/storefront/src/components/vault-timer.styles.ts`

**Step 1: Replace hardcoded values**

- `.v-timer__inner` border-radius: `10px` → `var(--vault-timer-border-radius, 10px)`
- `.v-timer__num` font-size: `28px` → `var(--vault-timer-num-size, 28px)`
- `.v-timer--minimal .v-timer__inner` border-radius → also use `var(--vault-timer-border-radius, 10px)`
- `.v-timer--urgent .v-timer__inner` → also use `var(--vault-timer-border-radius, 10px)`

**Step 2: Build storefront**

Run: `npm run build:storefront`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add packages/storefront/src/components/vault-timer.styles.ts
git commit -m "refactor: migrate timer styles to CSS custom properties"
```

---

## Task 7: Migrate `vault.css` (Exclusive Page Styles) to CSS Variables

**Files:**
- Modify: `extensions/theme-extension/assets/vault.css`

**Step 1: Replace hardcoded values**

Key replacements in the `.v-excl` section:

| Selector | Property | Before | After |
|---|---|---|---|
| `.v-excl` | `max-width` | `1200px` | `var(--vault-page-max-width, 1200px)` |
| `.v-excl` | `padding` | `40px 20px` | `var(--vault-page-padding, 40px 20px)` |
| `.v-excl__header` | `margin-bottom` | `40px` | `var(--vault-header-spacing, 40px)` |
| `.v-excl__title` | `font-size` | `28px` | `var(--vault-title-size, 28px)` |
| `.v-excl__title` | `color` | `#18181b` | `var(--vault-title-color, #18181b)` |
| `.v-excl__sub` | `font-size` | `16px` | `var(--vault-subtitle-size, 16px)` |
| `.v-excl__sub` | `color` | `#6b7280` | `var(--vault-subtitle-color, #6b7280)` |
| `.v-excl__grid` | `gap` | `24px` | `var(--vault-grid-gap, 24px)` |
| Mobile `.v-excl__grid` | `gap` | `12px` | `var(--vault-grid-mobile-gap, 12px)` |

**Step 2: Commit**

```bash
git add extensions/theme-extension/assets/vault.css
git commit -m "refactor: migrate exclusive page CSS to custom properties"
```

---

## Task 8: Apply Theme CSS Variables on Storefront

**Files:**
- Modify: `packages/storefront/src/features/exclusive-page.ts`

**Step 1: Import theme utilities and apply CSS vars**

At the top of the file, add import:
```typescript
import { resolveTokens, tokensToCSS } from '@vault/shared/theme/tokens';
```

In the `initExclusivePage()` function, after the `findLandingConfig()` call (around line 83-100), extract the theme config from the resolved campaign and apply CSS vars to the `.v-excl` section container (the parent of the grid):

```typescript
// After: const lp = findLandingConfig(bens, campaignsIndex);
// Add theme application:
const section = grid.closest('[data-vault-section]') || grid.parentElement;
if (section instanceof HTMLElement) {
  const theme = findThemeConfig(bens, campaignsIndex); // new helper, same pattern as findLandingConfig
  const cssVars = tokensToCSS(resolveTokens(theme ?? undefined));
  Object.entries(cssVars).forEach(([prop, val]) =>
    section.style.setProperty(prop, val)
  );
}
```

Also add a `findThemeConfig()` helper function that extracts the `theme` field from the display config, following the same pattern as `findLandingConfig()`.

**Step 2: Build storefront**

Run: `npm run build:storefront`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add packages/storefront/src/features/exclusive-page.ts
git commit -m "feat: apply theme CSS variables on storefront exclusive page"
```

---

## Task 9: Apply Theme CSS Variables in Admin Preview

**Files:**
- Modify: `client/src/components/campaigns/preview/StorefrontPreview.tsx`

**Step 1: Import theme utilities**

Add import at the top:
```typescript
import { resolveTokens, tokensToCSS } from '@vault/shared/theme/tokens';
```

**Step 2: Update `StorefrontPreviewProps` to accept theme**

The config already contains the campaign's display config. Add the theme from there. In the main component body, compute CSS vars:

```typescript
const theme = config.theme;
const themeVars = tokensToCSS(resolveTokens(theme));
```

**Step 3: Apply CSS vars on the preview content wrapper**

On the main content wrapper div (the one with `mx-auto max-w-[1200px]`), add the theme CSS vars as inline style:

```tsx
<div
  className={`mx-auto ${isMobile ? "px-4 py-6" : "px-8 py-12"}`}
  style={{
    ...themeVars,
    maxWidth: 'var(--vault-page-max-width, 1200px)',
  }}
>
```

**Step 4: Update the landing page header to use CSS var references**

Replace the hardcoded inline styles on the header h2 and p with references to the CSS vars. Since these are now set on the container, the child elements will inherit them:

```tsx
<h2 style={{
  fontSize: 'var(--vault-title-size, 28px)',
  fontWeight: 700,
  color: 'var(--vault-title-color, #18181b)',
  margin: '0 0 8px',
  lineHeight: 1.3,
}}>
```

```tsx
<p style={{
  fontSize: 'var(--vault-subtitle-size, 16px)',
  color: 'var(--vault-subtitle-color, #6b7280)',
  margin: 0,
}}>
```

And the grid gap:
```tsx
<div style={{
  display: 'grid',
  gridTemplateColumns: `repeat(${isMobile ? 2 : resolvedLanding.gridColumns}, 1fr)`,
  gap: isMobile
    ? 'var(--vault-grid-mobile-gap, 12px)'
    : 'var(--vault-grid-gap, 24px)',
}}>
```

**Step 5: Update `StorefrontPreviewProps` config type**

Add `theme?: ThemeConfig` to the config prop interface, matching the display config types.

**Step 6: Typecheck and build**

Run: `cd client && npx tsc --noEmit`
Expected: Passes.

**Step 7: Commit**

```bash
git add client/src/components/campaigns/preview/StorefrontPreview.tsx
git commit -m "feat: apply theme CSS variables in admin storefront preview"
```

---

## Task 10: Create ThemeConfigEditor Admin UI Component

**Files:**
- Create: `client/src/components/campaigns/display/ThemeConfigEditor.tsx`
- Modify: `client/src/components/campaigns/display/index.ts`

**Step 1: Create `ThemeConfigEditor.tsx`**

This component renders:
1. A preset picker (4 visual options)
2. Collapsible override sections with individual fields

Props interface:
```typescript
interface ThemeConfigEditorProps {
  value: ThemeConfig;
  onChange: (value: ThemeConfig) => void;
}
```

Use Polaris components: `Card`, `BlockStack`, `InlineStack`, `Select`, `TextField`, `Text`, `Button`, `Divider`, `Collapsible`.

The preset picker renders 4 option cards (styled buttons). When selected, it updates `value.preset` and clears overrides.

Override sections are collapsible accordions (same pattern as `LandingPageConfig.tsx`'s `AccordionSection`):
- **Card Appearance**: cardBorderRadius, cardShadow, cardBackground, cardBorderColor, cardButtonBg, cardButtonColor, cardButtonRadius
- **Grid & Layout**: gridGap, gridMobileGap, pageMaxWidth, pagePadding, headerSpacing
- **Typography**: titleSize, titleColor, subtitleSize, subtitleColor, cardTitleSize, cardTitleColor, cardPriceSize, cardPriceColor
- **Notifications**: notifBorderRadius, notifFontSize, notifButtonRadius
- **Timer**: timerBorderRadius, timerNumSize

Each field is a `TextField` with `placeholder` set to the preset's default value (from `PRESETS[value.preset]`). Only non-empty values are stored in overrides.

**Step 2: Export from index**

In `client/src/components/campaigns/display/index.ts`, add:
```typescript
export { ThemeConfigEditor } from './ThemeConfigEditor';
```

**Step 3: Typecheck**

Run: `cd client && npx tsc --noEmit`
Expected: Passes.

**Step 4: Commit**

```bash
git add client/src/components/campaigns/display/ThemeConfigEditor.tsx client/src/components/campaigns/display/index.ts
git commit -m "feat: add ThemeConfigEditor admin UI component with presets and overrides"
```

---

## Task 11: Wire Theme Config into Customizer Modals

**Files:**
- Modify: `client/src/components/campaigns/discounted-product-wizard/DiscountedProductCustomizerModal.tsx`
- Modify: `client/src/components/campaigns/early-access-wizard/DisplayCustomizerModal.tsx`
- Modify: `client/src/components/campaigns/timer-sale-wizard/TimerSaleCustomizerModal.tsx`

**Step 1: Add "Theme & Styles" as first menu item in each modal**

For each modal file, follow the existing pattern:

1. Add `"theme"` to the panel union type
2. Add a new `CustomizerMenuButton` as the first item in the menu section (before existing items):
   ```tsx
   <CustomizerMenuButton
     label="Theme & styles"
     active={panel === "theme"}
     onClick={() => setPanel("theme")}
   />
   ```
3. Add a content pane for `panel === "theme"`:
   ```tsx
   {panel === "theme" && (
     <ThemeConfigEditor
       value={draftConfig.theme ?? { preset: 'rounded', overrides: {} }}
       onChange={(theme) => {
         const next = { ...draftConfig, theme };
         setDraftConfig(next);
         onDisplayConfigChange(next);
       }}
     />
   )}
   ```

Do this identically in all three modal files.

**Step 2: Pass theme to StorefrontPreview**

In each modal, ensure the `StorefrontPreview` component receives the theme config from `draftConfig`. This should already work if the `config` prop passes through the full display config which now includes `theme`.

**Step 3: Typecheck**

Run: `cd client && npx tsc --noEmit`
Expected: Passes.

**Step 4: Commit**

```bash
git add client/src/components/campaigns/discounted-product-wizard/DiscountedProductCustomizerModal.tsx client/src/components/campaigns/early-access-wizard/DisplayCustomizerModal.tsx client/src/components/campaigns/timer-sale-wizard/TimerSaleCustomizerModal.tsx
git commit -m "feat: wire ThemeConfigEditor into all three customizer modals"
```

---

## Task 12: Final Verification

**Step 1: Run full typecheck**

Run: `npm run typecheck && cd client && npx tsc --noEmit`
Expected: All pass.

**Step 2: Build storefront**

Run: `npm run build:storefront`
Expected: Builds successfully. Note the bundle size.

**Step 3: Manual smoke test**

1. Run `npm run dev` in client
2. Create or edit a campaign
3. Open the customizer modal
4. Verify "Theme & styles" appears as first menu item
5. Select different presets — verify preview updates live
6. Override a value (e.g. card border-radius) — verify preview reflects it
7. Visit the storefront exclusive page — verify loading indicator disappears when products load
8. Verify existing campaigns without theme config render identically to before

**Step 4: Commit any fixes**

If any issues found, fix and commit individually.

---

## Task Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Fix loading indicator bug | 1 file |
| 2 | Add theme types to shared | 1 file |
| 3 | Create preset definitions & utilities | 4 files (3 new) |
| 4 | Migrate product card styles to CSS vars | 1 file |
| 5 | Migrate notification styles to CSS vars | 4 files |
| 6 | Migrate timer styles to CSS vars | 1 file |
| 7 | Migrate vault.css to CSS vars | 1 file |
| 8 | Apply theme vars on storefront | 1 file |
| 9 | Apply theme vars in admin preview | 1 file |
| 10 | Create ThemeConfigEditor UI | 2 files (1 new) |
| 11 | Wire into customizer modals | 3 files |
| 12 | Final verification | 0 files |

**Total: ~20 files touched, 4 new files created, 12 commits**
