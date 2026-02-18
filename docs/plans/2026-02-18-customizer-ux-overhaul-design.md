# Customizer UX Overhaul Design

**Date:** 2026-02-18
**Status:** Approved

## Goals

1. Sidebar menu matches Shopify theme settings sidebar (clean rows, dividers, right chevron)
2. All color inputs use a swatch + popover color picker (no manual hex typing required)
3. All size/spacing inputs use slider + number input (no manual "px" typing)
4. Text settings get compound controls: color + size + weight per element
5. Settings reorganized with smart defaults; rarely-used fields behind "Advanced" toggle
6. Live preview highlight zones on setting hover
7. Delete unused ThemeSettingsPanel.tsx

## Approach

Build shared form primitives, restyle the sidebar, reorganize ThemeConfigEditor, upgrade all display editors.

## New Shared Primitives

### `display/controls/ColorInput.tsx`

Clickable color swatch (32x32) + hex TextField. Swatch click opens Polaris `Popover` containing Polaris `ColorPicker` (hue/saturation/brightness). Bidirectional sync between picker and text field.

**Props:** `{ label, value, onChange, placeholder? }`

### `display/controls/SizeSlider.tsx`

Polaris `RangeSlider` + small number `TextField` (60px wide) + unit suffix label. Empty value shows placeholder at grayed slider position.

**Props:** `{ label, value, onChange, min?, max?, step?, unit?, placeholder? }`

### `display/controls/TextStyleGroup.tsx`

Compound control for one text element: ColorInput + SizeSlider + weight Select. Replaces 3 separate fields with one cohesive group.

**Props:** `{ label, color: { value, onChange, placeholder? }, size: { value, onChange, placeholder?, min?, max? }, weight: { value, onChange, placeholder? } }`

### `display/controls/SettingsSection.tsx`

Replaces `AccordionSection` inside the customizer. Shopify-style collapsible: full-width row, border-bottom divider, chevron rotates right→down on expand. Height transition animation (~200ms ease).

**Props:** `{ title, description?, open, onToggle, children }`

## Sidebar Menu Redesign

Restyle `CustomizerMenuButton`:
- Remove rounded border/container box
- Full-width row, padding `12px 0`
- Bottom border divider between items
- Label left, `ChevronRightIcon` subdued right
- Hover: `var(--p-color-bg-surface-hover)` background

Sub-panel "Back" button: keep `ChevronLeftIcon` + text, add bottom divider below.

## ThemeConfigEditor Reorganization

Preset picker stays (2x2 grid).

### Section 1: Cards (~6 settings)

| Setting | Control | Range |
|---------|---------|-------|
| Border radius | SizeSlider | 0-24px |
| Shadow | Select | none/subtle/medium/strong |
| Background | ColorInput | hex |
| Border color | ColorInput | hex |
| Button background | ColorInput | hex |
| Button radius | SizeSlider | 0-24px |

**Advanced (hidden by default):** cardHoverShadow, cardHoverLift, cardImageAspectRatio, cardInfoPadding, cardButtonColor

### Section 2: Layout (~4 settings)

| Setting | Control | Range |
|---------|---------|-------|
| Grid gap | SizeSlider | 8-48px |
| Page max width | SizeSlider | 800-1400px step 50 |
| Page padding | SizeSlider | 0-48px |
| Header spacing | SizeSlider | 0-48px |

**Advanced (hidden by default):** gridMobileGap

### Section 3: Typography (4 TextStyleGroups)

| Element | Controls |
|---------|----------|
| Heading | Color + Size (16-48px) + Weight |
| Subheading | Color + Size (12-24px) + Weight |
| Card title | Color + Size (12-24px) + Weight |
| Card price | Color + Size (12-24px) + Weight |

### Section 4: Notifications & Timer (5 settings)

| Setting | Control | Range |
|---------|---------|-------|
| Notification radius | SizeSlider | 0-24px |
| Notification font size | SizeSlider | 12-20px |
| Notification button radius | SizeSlider | 0-16px |
| Timer radius | SizeSlider | 0-24px |
| Timer number size | SizeSlider | 16-48px |

## Other Display Editor Upgrades

### NotificationConfig
- Primary color, text color: TextField+swatch → ColorInput
- Auto-dismiss seconds: TextField → SizeSlider (0-30, unit "s")

### LandingPageConfig
- Badge color: TextField+swatch → ColorInput

### ProductPageConfig
- Badge color: plain TextField → ColorInput
- Banner background: plain TextField → ColorInput
- Banner text color: plain TextField → ColorInput

### TimerDisplayConfigEditor
- No changes needed

## Type Changes

### New StyleTokens fields

```typescript
// Weight tokens (new)
titleWeight?: string;       // '400' | '500' | '700'
subtitleWeight?: string;
cardTitleWeight?: string;
cardPriceWeight?: string;

// Shadow preset (replaces free-text cardShadow)
cardShadowPreset?: 'none' | 'subtle' | 'medium' | 'strong';
```

### tokensToCSS() updates

- Map `cardShadowPreset` → CSS box-shadow values
- Map weight tokens → `--vault-title-weight` etc. CSS custom properties
- Keep backward compat: if `cardShadow` string exists, use it directly

## Preview Highlight Zones

When user hovers a setting in the sidebar, the corresponding zone in StorefrontPreview gets a subtle blue outline pulse.

**Implementation:**
- Add `highlightZone?: string` state to customizer modals
- Pass to `StorefrontPreview` as prop
- Preview applies `[data-zone="cards"].highlighted { outline: 2px solid var(--p-color-border-interactive); }` CSS
- Zones: `cards`, `layout`, `typography`, `notifications`, `timer`
- Highlight on section hover in sidebar, clear on mouse leave

## File Changes Summary

**New files:**
- `display/controls/ColorInput.tsx`
- `display/controls/SizeSlider.tsx`
- `display/controls/TextStyleGroup.tsx`
- `display/controls/SettingsSection.tsx`
- `display/controls/index.ts`

**Major refactors:**
- `display/ThemeConfigEditor.tsx`
- `display/NotificationConfig.tsx`
- `display/LandingPageConfig.tsx`
- `display/ProductPageConfig.tsx`
- `customizer/CustomizerMenuButton.tsx`

**Type changes:**
- `packages/shared/src/types/display-config.types.ts`
- `packages/shared/src/theme/presets.ts`
- `packages/shared/src/theme/tokens.ts`

**Deleted:**
- `customizer/ThemeSettingsPanel.tsx`

## What Does NOT Change

- Navigation pattern (menu → sub-panel → back)
- CustomizerShell layout (400px sidebar + flex preview)
- Preview components (StorefrontPreview, CustomizerPreviewPane)
- Data flow (draft state in modal, sync via onDisplayConfigChange)
- The 4 theme presets (Rounded/Sharp/Soft/Minimal)
- AccordionSection component (still used outside the customizer in wizard steps)
