# Customizer UX Overhaul Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the campaign customizer sidebar with Shopify-style navigation, proper color pickers, slider controls, compound text style groups, and preview highlight zones.

**Architecture:** Build 4 shared form primitives (ColorInput, SizeSlider, TextStyleGroup, SettingsSection) in `display/controls/`. Restyle CustomizerMenuButton. Rewrite ThemeConfigEditor with reorganized settings. Upgrade NotificationConfig, LandingPageConfig, ProductPageConfig with new controls. Add highlight zones to StorefrontPreview.

**Tech Stack:** React, Polaris (ColorPicker, RangeSlider, Popover, hsbToHex, rgbToHsb, hexToRgb), Tailwind CSS with Polaris CSS custom properties.

---

## Task 1: Add weight tokens and shadow preset to shared types

**Files:**
- Modify: `packages/shared/src/types/display-config.types.ts`

**Step 1:** Add new fields to the `StyleTokens` interface. Insert after `timerNumSize`:

```typescript
// In StyleTokens interface, after timerNumSize: string;

// Font weights
titleWeight: string;
subtitleWeight: string;
cardTitleWeight: string;
cardPriceWeight: string;
```

**Step 2:** Run typecheck — expect failures in `presets.ts` (missing new required fields):

```bash
npm run typecheck
```

**Step 3:** Commit:

```bash
git add packages/shared/src/types/display-config.types.ts
git commit -m "feat: add weight tokens to StyleTokens"
```

---

## Task 2: Update presets with weight defaults and shadow mapping

**Files:**
- Modify: `packages/shared/src/theme/presets.ts`
- Modify: `packages/shared/src/theme/tokens.ts`

**Step 1:** Add weight values to all 4 presets in `presets.ts`. Each preset gets:

```typescript
// rounded preset — add after timerNumSize
titleWeight: '600',
subtitleWeight: '400',
cardTitleWeight: '500',
cardPriceWeight: '600',

// sharp preset
titleWeight: '700',
subtitleWeight: '400',
cardTitleWeight: '600',
cardPriceWeight: '700',

// soft preset
titleWeight: '500',
subtitleWeight: '400',
cardTitleWeight: '500',
cardPriceWeight: '500',

// minimal preset
titleWeight: '400',
subtitleWeight: '400',
cardTitleWeight: '400',
cardPriceWeight: '500',
```

**Step 2:** Add a `SHADOW_PRESETS` map to `tokens.ts` and update `tokensToCSS()` to also emit `--vault-title-weight` etc. for the new weight tokens. The weight tokens already follow the camelCase→kebab convention so `toVarName()` handles them automatically. No code change needed for the conversion itself.

Add above `tokensToCSS`:

```typescript
export const SHADOW_PRESETS: Record<string, string> = {
  none: 'none',
  subtle: '0 1px 3px rgba(0, 0, 0, 0.08)',
  medium: '0 4px 12px rgba(0, 0, 0, 0.1)',
  strong: '0 10px 20px -16px rgba(15, 23, 42, 0.4)',
};
```

This map is consumed by ThemeConfigEditor (Task 7) — the user picks a preset name, and the editor writes the CSS value to `cardShadow`.

**Step 3:** Run typecheck:

```bash
npm run typecheck
```

Expected: PASS (all presets now have the required weight fields).

**Step 4:** Rebuild server to pick up shared changes:

```bash
cd server && npm run build
```

**Step 5:** Commit:

```bash
git add packages/shared/src/theme/presets.ts packages/shared/src/theme/tokens.ts
git commit -m "feat: add weight token defaults to presets and shadow preset map"
```

---

## Task 3: Create ColorInput primitive

**Files:**
- Create: `client/src/components/campaigns/display/controls/ColorInput.tsx`

**Step 1:** Create the component. Uses Polaris `Popover`, `ColorPicker`, `TextField`, and color utilities (`hsbToHex`, `rgbToHsb`, `hexToRgb`).

Key implementation details:
- Props: `{ label: string, value: string, onChange: (hex: string) => void, placeholder?: string }`
- State: `popoverActive` boolean, internal HSB color derived from hex value
- Swatch: 32x32px clickable div, shows current color (or placeholder color if empty), triggers popover
- Popover contains Polaris `ColorPicker` component
- Bidirectional sync: changing ColorPicker updates hex TextField, typing hex updates ColorPicker
- Hex parsing: use `hexToRgb` → `rgbToHsb` to convert hex to HSB for ColorPicker
- HSB to hex: use `hsbToHex` for ColorPicker onChange
- Validate hex input: only sync to ColorPicker if valid 3 or 6 char hex (with or without #)
- Layout: `InlineStack gap="200" blockAlign="center"` → `[swatch] [TextField flex-1]`
- Swatch styling: `h-8 w-8 shrink-0 cursor-pointer rounded-[var(--p-border-radius-200)] border border-[var(--p-color-border)] shadow-sm transition-shadow hover:shadow-md`

Polaris imports:
```typescript
import { Popover, ColorPicker, TextField, InlineStack } from "@shopify/polaris";
import { hsbToHex, rgbToHsb, hexToRgb } from "@shopify/polaris";
// Note: color utilities are exported from @shopify/polaris root
```

**Step 2:** Run typecheck:

```bash
cd client && npx tsc --noEmit
```

**Step 3:** Commit:

```bash
git add client/src/components/campaigns/display/controls/ColorInput.tsx
git commit -m "feat: add ColorInput primitive with popover color picker"
```

---

## Task 4: Create SizeSlider primitive

**Files:**
- Create: `client/src/components/campaigns/display/controls/SizeSlider.tsx`

**Step 1:** Create the component. Uses Polaris `RangeSlider` and `TextField`.

Key implementation details:
- Props: `{ label: string, value: number | "", onChange: (val: number | "") => void, min?: number, max?: number, step?: number, unit?: string, placeholder?: number }`
- Defaults: `min=0, max=48, step=1, unit="px"`
- Layout: Label on top row. Bottom row: `[RangeSlider flex-1] [TextField 64px] [unit text]`
- When value is `""` (empty): slider shows at placeholder position with `output={false}`, number input shows placeholder. This means the preset default is being used.
- When user drags slider or types a number: value becomes a number, stored as override.
- Number input: `type="number"`, `min`, `max` attributes, `suffix` element showing unit
- RangeSlider: `labelHidden` (label is shown separately above), `min`, `max`, `step`, `output`
- Clearing the number input (backspace to empty) sets value to `""` (reset to preset default)

Polaris imports:
```typescript
import { RangeSlider, TextField, BlockStack, InlineStack, Text } from "@shopify/polaris";
```

**Step 2:** Run typecheck:

```bash
cd client && npx tsc --noEmit
```

**Step 3:** Commit:

```bash
git add client/src/components/campaigns/display/controls/SizeSlider.tsx
git commit -m "feat: add SizeSlider primitive with range slider and number input"
```

---

## Task 5: Create TextStyleGroup primitive

**Files:**
- Create: `client/src/components/campaigns/display/controls/TextStyleGroup.tsx`

**Step 1:** Create the component. Compound control for one text element.

Key implementation details:
- Props:
  ```typescript
  interface TextStyleGroupProps {
    label: string;
    color: { value: string; onChange: (v: string) => void; placeholder?: string };
    size: { value: number | ""; onChange: (v: number | "") => void; placeholder?: number; min?: number; max?: number };
    weight: { value: string; onChange: (v: string) => void; placeholder?: string };
  }
  ```
- Layout:
  ```
  [Label — Text variant="bodyMd" fontWeight="semibold"]
  [ColorInput]  (full width, label="Color")
  [SizeSlider]  (full width, label="Font size")
  [Select]      (full width, label="Font weight", options: Normal(400)/Medium(500)/Semibold(600)/Bold(700))
  ```
- Uses `BlockStack gap="300"` to stack vertically
- The Select for weight: options are `[{label: "Normal", value: "400"}, {label: "Medium", value: "500"}, {label: "Semibold", value: "600"}, {label: "Bold", value: "700"}]`
- Empty weight value uses placeholder

**Step 2:** Run typecheck:

```bash
cd client && npx tsc --noEmit
```

**Step 3:** Commit:

```bash
git add client/src/components/campaigns/display/controls/TextStyleGroup.tsx
git commit -m "feat: add TextStyleGroup compound control for text styling"
```

---

## Task 6: Create SettingsSection (Shopify-style collapsible) + barrel export

**Files:**
- Create: `client/src/components/campaigns/display/controls/SettingsSection.tsx`
- Create: `client/src/components/campaigns/display/controls/index.ts`

**Step 1:** Create `SettingsSection`. Replaces `AccordionSection` inside the customizer.

Key implementation details:
- Props: `{ title: string, description?: string, open: boolean, onToggle: () => void, disabled?: boolean, children: ReactNode, onMouseEnter?: () => void, onMouseLeave?: () => void }`
- The `onMouseEnter`/`onMouseLeave` props are for the preview highlight feature (Task 12)
- Visual: NO border box. Just a full-width row with bottom border.
- Header: `padding: 12px 0`, `border-bottom: 1px solid var(--p-color-border)`
- Chevron: `ChevronRightIcon` rotates 90° (to point down) when `open`
- Content: hidden by default, slides open with CSS `grid-template-rows` transition (0fr → 1fr over 200ms)
- Implementation of height animation:
  ```tsx
  <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
    <div className="overflow-hidden">
      <div className="py-3">{children}</div>
    </div>
  </div>
  ```
- Title: `Text variant="bodyMd" fontWeight="semibold"`, description: `Text variant="bodySm" tone="subdued"`
- Hover state: `hover:bg-[var(--p-color-bg-surface-hover)]` on the header button, with `rounded-[var(--p-border-radius-200)]` and `mx-[-8px] px-2` to create a subtle inset hover

Polaris imports: `BlockStack`, `InlineStack`, `Text`, `Icon`, `ChevronRightIcon`

**Step 2:** Create barrel export `controls/index.ts`:

```typescript
export { ColorInput } from './ColorInput';
export { SizeSlider } from './SizeSlider';
export { TextStyleGroup } from './TextStyleGroup';
export { SettingsSection } from './SettingsSection';
```

**Step 3:** Run typecheck:

```bash
cd client && npx tsc --noEmit
```

**Step 4:** Commit:

```bash
git add client/src/components/campaigns/display/controls/
git commit -m "feat: add SettingsSection with smooth expand animation and barrel export"
```

---

## Task 7: Rewrite ThemeConfigEditor with new controls and reorganized settings

**Files:**
- Modify: `client/src/components/campaigns/display/ThemeConfigEditor.tsx`

This is the largest task. Rewrite the component to use the new primitives.

**Step 1:** Replace imports — remove `TextField`, add imports from `./controls`:

```typescript
import { BlockStack, Text, Checkbox, Select } from "@shopify/polaris";
import { ColorInput, SizeSlider, TextStyleGroup, SettingsSection } from "./controls";
import { SHADOW_PRESETS } from "@vault/shared/theme/tokens";
```

**Step 2:** Redefine sections. Replace the `OVERRIDE_SECTIONS` array and field rendering with 4 new sections.

The preset picker stays exactly as-is (2x2 grid).

Replace the "Overrides" heading text with: "Customize" / "Fine-tune individual settings. Empty fields use the preset default."

**Section 1: Cards** — `SettingsSection title="Cards" description="Border radius, shadow, colors, and buttons"`
Fields (in order):
1. `SizeSlider label="Border radius" value={parseNum(overrides.cardBorderRadius)} onChange={...} min={0} max={24} placeholder={parseNum(presetTokens.cardBorderRadius)}`
2. `Select label="Shadow" options={shadowOptions} value={findShadowPreset(overrides.cardShadow ?? presetTokens.cardShadow)} onChange={...}`
   - Shadow options: `[{label:"None",value:"none"}, {label:"Subtle",value:"subtle"}, {label:"Medium",value:"medium"}, {label:"Strong",value:"strong"}]`
   - On change: write `SHADOW_PRESETS[selected]` to `overrides.cardShadow`
3. `ColorInput label="Background" value={overrides.cardBackground ?? ""} placeholder={presetTokens.cardBackground} onChange={...}`
4. `ColorInput label="Border color" value={overrides.cardBorderColor ?? ""} placeholder={presetTokens.cardBorderColor} onChange={...}`
5. `ColorInput label="Button background" value={overrides.cardButtonBg ?? ""} placeholder={presetTokens.cardButtonBg} onChange={...}`
6. `SizeSlider label="Button radius" value={parseNum(overrides.cardButtonRadius)} min={0} max={24} placeholder={parseNum(presetTokens.cardButtonRadius)} onChange={...}`

Advanced toggle (Checkbox "Show advanced settings"):
7. `cardHoverShadow` — TextField (free text CSS shadow)
8. `cardHoverLift` — TextField (free text CSS value)
9. `cardImageAspectRatio` — Select (options: 1/1, 3/4, 4/5, 16/9)
10. `cardInfoPadding` — TextField (free text CSS padding)
11. `cardButtonColor` — ColorInput

**Section 2: Layout** — `SettingsSection title="Layout" description="Spacing, page width, and padding"`
1. `SizeSlider label="Grid gap" value={parseNum(overrides.gridGap)} min={8} max={48} placeholder={parseNum(presetTokens.gridGap)}`
2. `SizeSlider label="Page max width" value={parseNum(overrides.pageMaxWidth)} min={800} max={1400} step={50} placeholder={parseNum(presetTokens.pageMaxWidth)}`
3. `SizeSlider label="Page padding" value={parseNum(overrides.pagePadding)} min={0} max={48} placeholder={parseNum(presetTokens.pagePadding)}`
4. `SizeSlider label="Header spacing" value={parseNum(overrides.headerSpacing)} min={0} max={48} placeholder={parseNum(presetTokens.headerSpacing)}`

Advanced: `gridMobileGap` — SizeSlider

**Section 3: Typography** — `SettingsSection title="Typography" description="Heading, subheading, and card text styles"`
4 `TextStyleGroup` components:
1. Heading — color: titleColor, size: titleSize (16-48), weight: titleWeight
2. Subheading — color: subtitleColor, size: subtitleSize (12-24), weight: subtitleWeight
3. Card title — color: cardTitleColor, size: cardTitleSize (12-24), weight: cardTitleWeight
4. Card price — color: cardPriceColor, size: cardPriceSize (12-24), weight: cardPriceWeight

**Section 4: Notifications & Timer** — `SettingsSection title="Notifications & Timer" description="Border radius and sizing"`
1. `SizeSlider label="Notification radius" ... notifBorderRadius min={0} max={24}`
2. `SizeSlider label="Notification font size" ... notifFontSize min={12} max={20}`
3. `SizeSlider label="Notification button radius" ... notifButtonRadius min={0} max={16}`
4. `SizeSlider label="Timer radius" ... timerBorderRadius min={0} max={24}`
5. `SizeSlider label="Timer number size" ... timerNumSize min={16} max={48}`

**Helper function** `parseNum`: extracts number from CSS value string:
```typescript
function parseNum(val: string | undefined): number | "" {
  if (!val) return "";
  const n = parseFloat(val);
  return isNaN(n) ? "" : n;
}
```

**Helper function** `numToPx`: converts number back to px string for overrides:
```typescript
function numToPx(val: number | ""): string {
  return val === "" ? "" : `${val}px`;
}
```

**Step 3:** Run typecheck:

```bash
cd client && npx tsc --noEmit
```

**Step 4:** Visual test — run `npm run dev` in client directory, open a campaign, go to the customizer, verify:
- Preset picker works as before
- New slider controls render and function
- Color pickers open and close
- TextStyleGroup shows 3 controls per text element
- Advanced toggle shows/hides hidden fields
- All changes reflect in the live preview

**Step 5:** Commit:

```bash
git add client/src/components/campaigns/display/ThemeConfigEditor.tsx
git commit -m "feat: rewrite ThemeConfigEditor with slider, color picker, and text style controls"
```

---

## Task 8: Restyle CustomizerMenuButton to Shopify-style

**Files:**
- Modify: `client/src/components/campaigns/customizer/CustomizerMenuButton.tsx`

**Step 1:** Restyle from bordered card button to clean Shopify row:

Replace the current className with:
```
w-full cursor-pointer bg-transparent py-3 text-left transition-colors duration-100 hover:bg-[var(--p-color-bg-surface-hover)] rounded-[var(--p-border-radius-200)]
```

Remove: `rounded-[10px] border border-[var(--p-color-border)] bg-[var(--p-color-bg-surface)] px-[6px] py-[10px]`

**Step 2:** Update the three customizer modals to wrap menu buttons with dividers. In each modal's `panel === "menu"` section, replace the `<Divider />` components between buttons with a single wrapping `<div>` that uses `divide-y divide-[var(--p-color-border)]` on the parent:

In `DisplayCustomizerModal.tsx`, `DiscountedProductCustomizerModal.tsx`, and `TimerSaleCustomizerModal.tsx`:

Replace the `panel === "menu"` block. Change from:
```tsx
<BlockStack gap="050">
  <Text variant="headingMd" as="h2">Customize</Text>
  <CustomizerMenuButton label="..." onClick={...} />
  <Divider />
  <CustomizerMenuButton label="..." onClick={...} />
  ...
</BlockStack>
```

To:
```tsx
<BlockStack gap="200">
  <Text variant="headingMd" as="h2">Customize</Text>
  <div className="divide-y divide-[var(--p-color-border)]">
    <CustomizerMenuButton label="..." onClick={...} />
    <CustomizerMenuButton label="..." onClick={...} />
    ...
  </div>
</BlockStack>
```

Remove `Divider` imports from the modals if no longer used.

**Step 3:** Run typecheck:

```bash
cd client && npx tsc --noEmit
```

**Step 4:** Commit:

```bash
git add client/src/components/campaigns/customizer/CustomizerMenuButton.tsx client/src/components/campaigns/early-access-wizard/DisplayCustomizerModal.tsx client/src/components/campaigns/discounted-product-wizard/DiscountedProductCustomizerModal.tsx client/src/components/campaigns/timer-sale-wizard/TimerSaleCustomizerModal.tsx
git commit -m "feat: restyle sidebar menu to Shopify-style clean rows with dividers"
```

---

## Task 9: Upgrade NotificationConfig color inputs

**Files:**
- Modify: `client/src/components/campaigns/display/NotificationConfig.tsx`

**Step 1:** Replace the ad-hoc inline color swatch + TextField pattern with `ColorInput`.

Import `ColorInput` from `./controls`:
```typescript
import { ColorInput } from "./controls";
```

In the `appearanceFields` section, replace the two `InlineStack` blocks (primaryColor and textColor) with:

```tsx
<ColorInput
  label="Primary color"
  value={value.visuals.primaryColor}
  onChange={(primaryColor) =>
    onChange({ ...value, visuals: { ...value.visuals, primaryColor } })
  }
  placeholder="#7c3aed"
/>
<ColorInput
  label="Text color"
  value={value.visuals.textColor}
  onChange={(textColor) =>
    onChange({ ...value, visuals: { ...value.visuals, textColor } })
  }
  placeholder="#ffffff"
/>
```

Remove the now-unused `InlineStack` import if it's only used for color swatches (check other usages first).

**Step 2:** Run typecheck:

```bash
cd client && npx tsc --noEmit
```

**Step 3:** Commit:

```bash
git add client/src/components/campaigns/display/NotificationConfig.tsx
git commit -m "feat: upgrade NotificationConfig to use ColorInput with popover picker"
```

---

## Task 10: Upgrade LandingPageConfig color input

**Files:**
- Modify: `client/src/components/campaigns/display/LandingPageConfig.tsx`

**Step 1:** Replace the badge color inline swatch + TextField with `ColorInput`.

Import `ColorInput`:
```typescript
import { ColorInput } from "./controls";
```

In `badgeFields`, replace the `InlineStack` block with:
```tsx
<ColorInput
  label="Badge color"
  value={resolvedValue.badgeColor}
  onChange={(badgeColor) => onChange({ ...resolvedValue, badgeColor })}
  placeholder="#7c3aed"
/>
```

Remove `InlineStack` from the Polaris imports if no longer used elsewhere in the component.

**Step 2:** Run typecheck:

```bash
cd client && npx tsc --noEmit
```

**Step 3:** Commit:

```bash
git add client/src/components/campaigns/display/LandingPageConfig.tsx
git commit -m "feat: upgrade LandingPageConfig badge color to ColorInput"
```

---

## Task 11: Upgrade ProductPageConfig color inputs

**Files:**
- Modify: `client/src/components/campaigns/display/ProductPageConfig.tsx`

**Step 1:** This component has the worst color UX — plain TextFields with NO swatch. Replace all 3 color TextFields with `ColorInput`.

Import `ColorInput`:
```typescript
import { ColorInput } from "./controls";
```

Replace badge color TextField:
```tsx
<ColorInput
  label="Badge color"
  value={value.discountBadge.color}
  onChange={(color) =>
    onChange({ ...value, discountBadge: { ...value.discountBadge, color } })
  }
  placeholder="#7c3aed"
/>
```

Replace banner background TextField:
```tsx
<ColorInput
  label="Background color"
  value={value.banner.bgColor}
  onChange={(bgColor) =>
    onChange({ ...value, banner: { ...value.banner!, bgColor } })
  }
  placeholder="#7c3aed"
/>
```

Replace banner text color TextField:
```tsx
<ColorInput
  label="Text color"
  value={value.banner.textColor}
  onChange={(textColor) =>
    onChange({ ...value, banner: { ...value.banner!, textColor } })
  }
  placeholder="#ffffff"
/>
```

**Step 2:** Run typecheck:

```bash
cd client && npx tsc --noEmit
```

**Step 3:** Commit:

```bash
git add client/src/components/campaigns/display/ProductPageConfig.tsx
git commit -m "feat: upgrade ProductPageConfig to use ColorInput for all color fields"
```

---

## Task 12: Add preview highlight zones

**Files:**
- Modify: `client/src/components/campaigns/preview/StorefrontPreview.tsx`
- Modify: `client/src/components/campaigns/preview/LandingPagePreview.tsx`
- Modify: `client/src/components/campaigns/display/ThemeConfigEditor.tsx` (add onMouseEnter/Leave to SettingsSections)
- Modify: `client/src/components/campaigns/early-access-wizard/DisplayCustomizerModal.tsx`
- Modify: `client/src/components/campaigns/discounted-product-wizard/DiscountedProductCustomizerModal.tsx`
- Modify: `client/src/components/campaigns/timer-sale-wizard/TimerSaleCustomizerModal.tsx`

**Step 1:** Add `highlightZone` prop to `StorefrontPreview`:

In `storefront-preview.types.ts`, add to `StorefrontPreviewProps`:
```typescript
highlightZone?: 'cards' | 'layout' | 'typography' | 'notifications' | 'timer' | null;
```

**Step 2:** In `StorefrontPreview.tsx`, pass `highlightZone` through and apply highlight CSS. Add a `data-highlight-zone` attribute to relevant wrapper divs, and apply a CSS class when the zone matches.

Add a helper for highlight class:
```typescript
const zoneClass = (zone: string) =>
  highlightZone === zone
    ? "ring-2 ring-[var(--p-color-border-interactive)] ring-offset-2 rounded-lg transition-shadow duration-200"
    : "transition-shadow duration-200";
```

Apply to the content wrapper div (`mx-auto max-w-[1200px]`) for 'layout' zone. Apply to `LandingPagePreview` wrapper for 'cards' zone. Apply to `NotificationPreview` wrapper for 'notifications' zone. The typography and timer zones apply on their respective text elements / timer component.

**Step 3:** In `LandingPagePreview.tsx`, accept and forward `highlightZone` prop. Wrap the heading/subheading in a div with `zoneClass('typography')` and the product grid in a div with `zoneClass('cards')`.

**Step 4:** In `ThemeConfigEditor.tsx`, add `onHighlightChange?: (zone: string | null) => void` prop. Pass `onMouseEnter` and `onMouseLeave` to each `SettingsSection`:

```tsx
<SettingsSection
  title="Cards"
  onMouseEnter={() => onHighlightChange?.('cards')}
  onMouseLeave={() => onHighlightChange?.(null)}
  ...
>
```

**Step 5:** In each customizer modal, add `highlightZone` state and wire it:

```typescript
const [highlightZone, setHighlightZone] = useState<string | null>(null);
```

Pass to ThemeConfigEditor:
```tsx
<ThemeConfigEditor
  value={draftConfig.theme ?? { preset: 'rounded', overrides: {} }}
  onChange={...}
  onHighlightChange={setHighlightZone}
/>
```

Pass to StorefrontPreview:
```tsx
<StorefrontPreview
  config={draftConfig}
  device={device}
  products={products}
  highlightZone={highlightZone}
/>
```

**Step 6:** Run typecheck:

```bash
cd client && npx tsc --noEmit
```

**Step 7:** Commit:

```bash
git add client/src/components/campaigns/preview/ client/src/components/campaigns/display/ThemeConfigEditor.tsx client/src/types/storefront-preview.types.ts client/src/components/campaigns/early-access-wizard/DisplayCustomizerModal.tsx client/src/components/campaigns/discounted-product-wizard/DiscountedProductCustomizerModal.tsx client/src/components/campaigns/timer-sale-wizard/TimerSaleCustomizerModal.tsx
git commit -m "feat: add preview highlight zones on sidebar section hover"
```

---

## Task 13: Delete unused ThemeSettingsPanel and update barrel export

**Files:**
- Delete: `client/src/components/campaigns/customizer/ThemeSettingsPanel.tsx`
- Modify: `client/src/components/campaigns/display/index.ts`

**Step 1:** Delete the orphaned file:

```bash
rm client/src/components/campaigns/customizer/ThemeSettingsPanel.tsx
```

**Step 2:** Add controls barrel re-export to `display/index.ts`. Append:

```typescript
export { ColorInput, SizeSlider, TextStyleGroup, SettingsSection } from "./controls";
```

**Step 3:** Run typecheck:

```bash
cd client && npx tsc --noEmit
```

**Step 4:** Commit:

```bash
git add -A client/src/components/campaigns/customizer/ThemeSettingsPanel.tsx client/src/components/campaigns/display/index.ts
git commit -m "chore: delete unused ThemeSettingsPanel, add controls to barrel export"
```

---

## Task 14: Full build verification and server rebuild

**Files:** None (verification only)

**Step 1:** Run full typecheck:

```bash
npm run typecheck
```

**Step 2:** Run client typecheck:

```bash
cd client && npx tsc --noEmit
```

**Step 3:** Rebuild server (picks up shared type changes):

```bash
cd server && npm run build
```

**Step 4:** Build storefront:

```bash
npm run build:storefront
```

**Step 5:** All should pass. If any fail, fix and recommit.

**Step 6:** Final commit if any cleanup needed:

```bash
git add -A && git commit -m "chore: full build verification after customizer UX overhaul"
```
