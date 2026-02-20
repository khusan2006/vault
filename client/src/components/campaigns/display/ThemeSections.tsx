"use client";

import { useCallback, useState, type RefObject } from "react";
import { BlockStack, Text, Checkbox, Select } from "@shopify/polaris";
import type { ThemeConfig, ThemePreset, StyleTokens } from "@/types";
import { PRESETS } from "@vault/shared/theme/presets";
import { SHADOW_PRESETS } from "@vault/shared/theme/tokens";
import {
  ColorInput,
  SizeSlider,
  TextStyleGroup,
  SettingsSection,
} from "./controls";

// =============================================================================
// Preset metadata
// =============================================================================

const PRESET_OPTIONS: {
  key: ThemePreset;
  label: string;
  description: string;
}[] = [
  { key: "rounded", label: "Rounded", description: "Soft corners, balanced" },
  { key: "sharp", label: "Sharp", description: "Clean edges, compact" },
  { key: "soft", label: "Soft", description: "Pill shapes, airy" },
  {
    key: "minimal",
    label: "Minimal",
    description: "No frills, content-first",
  },
];

// =============================================================================
// Select options
// =============================================================================

const SHADOW_OPTIONS = [
  { label: "None", value: "none" },
  { label: "Subtle", value: "subtle" },
  { label: "Medium", value: "medium" },
  { label: "Strong", value: "strong" },
];

const ASPECT_RATIO_OPTIONS = [
  { label: "1:1 (Square)", value: "1/1" },
  { label: "3:4", value: "3/4" },
  { label: "4:5", value: "4/5" },
  { label: "16:9 (Wide)", value: "16/9" },
];

// =============================================================================
// Helpers
// =============================================================================

function parseNum(val: string | undefined): number | "" {
  if (!val) return "";
  const n = parseFloat(val);
  return isNaN(n) ? "" : n;
}

function numToPx(val: number | ""): string {
  return val === "" ? "" : `${val}px`;
}

function findShadowPreset(cssValue: string): string {
  for (const [name, css] of Object.entries(SHADOW_PRESETS)) {
    if (css === cssValue) return name;
  }
  return "medium";
}

function useThemeOverrides(
  value: ThemeConfig,
  onChange: (value: ThemeConfig) => void,
) {
  const presetTokens = PRESETS[value.preset];
  const overrides = value.overrides;

  const setOverride = useCallback(
    (key: keyof StyleTokens, fieldValue: string) => {
      const newOverrides = { ...value.overrides };
      if (fieldValue === "") {
        delete newOverrides[key];
      } else {
        newOverrides[key] = fieldValue;
      }
      onChange({ ...value, overrides: newOverrides });
    },
    [value, onChange],
  );

  return { presetTokens, overrides, setOverride };
}

function usePreviewHighlight(
  previewRef?: RefObject<HTMLDivElement | null>,
) {
  return useCallback(
    (zone: string | null) => {
      if (!previewRef?.current) return;
      if (zone) {
        previewRef.current.dataset.highlightZone = zone;
      } else {
        delete previewRef.current.dataset.highlightZone;
      }
    },
    [previewRef],
  );
}

// =============================================================================
// Preset picker
// =============================================================================

export function ThemePresetPicker({
  value,
  onChange,
}: {
  value: ThemeConfig;
  onChange: (value: ThemeConfig) => void;
}) {
  const handlePresetSelect = useCallback(
    (preset: ThemePreset) => {
      onChange({ preset, overrides: {} });
    },
    [onChange],
  );

  return (
    <BlockStack gap="200">
      <Text as="p" variant="bodyMd" fontWeight="semibold">
        Theme preset
      </Text>
      <div className="grid grid-cols-2 gap-2">
        {PRESET_OPTIONS.map(({ key, label, description }) => {
          const selected = value.preset === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => handlePresetSelect(key)}
              className={`cursor-pointer rounded-[var(--p-border-radius-200)] border-2 bg-[var(--p-color-bg-surface)] px-3 py-3 text-left transition-colors duration-100 ${
                selected
                  ? "border-[var(--p-color-border-interactive-focus)] bg-[var(--p-color-bg-surface-selected)]"
                  : "border-[var(--p-color-border)] hover:border-[var(--p-color-border-hover)]"
              }`}
            >
              <BlockStack gap="050">
                <Text
                  as="p"
                  variant="bodyMd"
                  fontWeight={selected ? "bold" : "semibold"}
                >
                  {label}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  {description}
                </Text>
              </BlockStack>
            </button>
          );
        })}
      </div>
    </BlockStack>
  );
}

// =============================================================================
// Theme sections
// =============================================================================

interface ThemeSectionProps {
  value: ThemeConfig;
  onChange: (value: ThemeConfig) => void;
  previewRef?: RefObject<HTMLDivElement | null>;
  title?: string;
  description?: string;
  defaultOpen?: boolean;
}

export function ThemeCardStyleSection({
  value,
  onChange,
  previewRef,
  title = "Card styles",
  description = "Border radius, shadow, colors, and buttons",
  defaultOpen = true,
}: ThemeSectionProps) {
  const { presetTokens, overrides, setOverride } = useThemeOverrides(
    value,
    onChange,
  );
  const [open, setOpen] = useState(defaultOpen);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const setHighlight = usePreviewHighlight(previewRef);

  return (
    <SettingsSection
      title={title}
      description={description}
      open={open}
      onToggle={() => setOpen((prev) => !prev)}
      onMouseEnter={() => setHighlight("cards")}
      onMouseLeave={() => setHighlight(null)}
    >
      <BlockStack gap="400">
        <SizeSlider
          label="Border radius"
          value={parseNum(overrides.cardBorderRadius)}
          onChange={(v) => setOverride("cardBorderRadius", numToPx(v))}
          min={0}
          max={24}
          placeholder={parseNum(presetTokens.cardBorderRadius) || undefined}
        />
        <Select
          label="Shadow"
          options={SHADOW_OPTIONS}
          value={findShadowPreset(
            overrides.cardShadow ?? presetTokens.cardShadow,
          )}
          onChange={(v) => setOverride("cardShadow", SHADOW_PRESETS[v] ?? "")}
        />
        <ColorInput
          label="Background"
          value={overrides.cardBackground ?? ""}
          onChange={(v) => setOverride("cardBackground", v)}
          placeholder={presetTokens.cardBackground}
        />
        <ColorInput
          label="Border color"
          value={overrides.cardBorderColor ?? ""}
          onChange={(v) => setOverride("cardBorderColor", v)}
          placeholder={presetTokens.cardBorderColor}
        />
        <ColorInput
          label="Button background"
          value={overrides.cardButtonBg ?? ""}
          onChange={(v) => setOverride("cardButtonBg", v)}
          placeholder={presetTokens.cardButtonBg}
        />
        <SizeSlider
          label="Button radius"
          value={parseNum(overrides.cardButtonRadius)}
          onChange={(v) => setOverride("cardButtonRadius", numToPx(v))}
          min={0}
          max={24}
          placeholder={parseNum(presetTokens.cardButtonRadius) || undefined}
        />

        <Checkbox
          label="Show advanced settings"
          checked={showAdvanced}
          onChange={setShowAdvanced}
        />
        {showAdvanced && (
          <BlockStack gap="400">
            <ColorInput
              label="Button text color"
              value={overrides.cardButtonColor ?? ""}
              onChange={(v) => setOverride("cardButtonColor", v)}
              placeholder={presetTokens.cardButtonColor}
            />
            <Select
              label="Image aspect ratio"
              options={ASPECT_RATIO_OPTIONS}
              value={
                overrides.cardImageAspectRatio ??
                presetTokens.cardImageAspectRatio
              }
              onChange={(v) => setOverride("cardImageAspectRatio", v)}
            />
          </BlockStack>
        )}
      </BlockStack>
    </SettingsSection>
  );
}

export function ThemeCardTypographySection({
  value,
  onChange,
  previewRef,
  title = "Card text",
  description = "Title and price typography",
  defaultOpen = true,
}: ThemeSectionProps) {
  const { presetTokens, overrides, setOverride } = useThemeOverrides(
    value,
    onChange,
  );
  const [open, setOpen] = useState(defaultOpen);
  const setHighlight = usePreviewHighlight(previewRef);

  return (
    <SettingsSection
      title={title}
      description={description}
      open={open}
      onToggle={() => setOpen((prev) => !prev)}
      onMouseEnter={() => setHighlight("cards")}
      onMouseLeave={() => setHighlight(null)}
    >
      <BlockStack gap="500">
        <TextStyleGroup
          label="Card title"
          color={{
            value: overrides.cardTitleColor ?? "",
            onChange: (v) => setOverride("cardTitleColor", v),
            placeholder: presetTokens.cardTitleColor,
          }}
          size={{
            value: parseNum(overrides.cardTitleSize),
            onChange: (v) => setOverride("cardTitleSize", numToPx(v)),
            placeholder: parseNum(presetTokens.cardTitleSize) || undefined,
            min: 12,
            max: 24,
          }}
          weight={{
            value: overrides.cardTitleWeight ?? "",
            onChange: (v) => setOverride("cardTitleWeight", v),
            placeholder: presetTokens.cardTitleWeight,
          }}
        />
        <TextStyleGroup
          label="Card price"
          color={{
            value: overrides.cardPriceColor ?? "",
            onChange: (v) => setOverride("cardPriceColor", v),
            placeholder: presetTokens.cardPriceColor,
          }}
          size={{
            value: parseNum(overrides.cardPriceSize),
            onChange: (v) => setOverride("cardPriceSize", numToPx(v)),
            placeholder: parseNum(presetTokens.cardPriceSize) || undefined,
            min: 12,
            max: 24,
          }}
          weight={{
            value: overrides.cardPriceWeight ?? "",
            onChange: (v) => setOverride("cardPriceWeight", v),
            placeholder: presetTokens.cardPriceWeight,
          }}
        />
      </BlockStack>
    </SettingsSection>
  );
}

export function ThemeGridSpacingSection({
  value,
  onChange,
  previewRef,
  title = "Grid spacing",
  description = "Card spacing for desktop and mobile",
  defaultOpen = true,
}: ThemeSectionProps) {
  const { presetTokens, overrides, setOverride } = useThemeOverrides(
    value,
    onChange,
  );
  const [open, setOpen] = useState(defaultOpen);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const setHighlight = usePreviewHighlight(previewRef);

  return (
    <SettingsSection
      title={title}
      description={description}
      open={open}
      onToggle={() => setOpen((prev) => !prev)}
      onMouseEnter={() => setHighlight("cards")}
      onMouseLeave={() => setHighlight(null)}
    >
      <BlockStack gap="400">
        <SizeSlider
          label="Grid gap"
          value={parseNum(overrides.gridGap)}
          onChange={(v) => setOverride("gridGap", numToPx(v))}
          min={8}
          max={48}
          placeholder={parseNum(presetTokens.gridGap) || undefined}
        />

        <Checkbox
          label="Show advanced settings"
          checked={showAdvanced}
          onChange={setShowAdvanced}
        />
        {showAdvanced && (
          <SizeSlider
            label="Grid mobile gap"
            value={parseNum(overrides.gridMobileGap)}
            onChange={(v) => setOverride("gridMobileGap", numToPx(v))}
            min={8}
            max={48}
            placeholder={parseNum(presetTokens.gridMobileGap) || undefined}
          />
        )}
      </BlockStack>
    </SettingsSection>
  );
}

export function ThemePageLayoutSection({
  value,
  onChange,
  previewRef,
  title = "Section layout",
  description = "Page width, padding, and header spacing",
  defaultOpen = true,
}: ThemeSectionProps) {
  const { presetTokens, overrides, setOverride } = useThemeOverrides(
    value,
    onChange,
  );
  const [open, setOpen] = useState(defaultOpen);
  const setHighlight = usePreviewHighlight(previewRef);

  return (
    <SettingsSection
      title={title}
      description={description}
      open={open}
      onToggle={() => setOpen((prev) => !prev)}
      onMouseEnter={() => setHighlight("layout")}
      onMouseLeave={() => setHighlight(null)}
    >
      <BlockStack gap="400">
        <SizeSlider
          label="Page max width"
          value={parseNum(overrides.pageMaxWidth)}
          onChange={(v) => setOverride("pageMaxWidth", numToPx(v))}
          min={800}
          max={1400}
          step={50}
          placeholder={parseNum(presetTokens.pageMaxWidth) || undefined}
        />
        <SizeSlider
          label="Page padding"
          value={parseNum(overrides.pagePadding)}
          onChange={(v) => setOverride("pagePadding", numToPx(v))}
          min={0}
          max={48}
          placeholder={parseNum(presetTokens.pagePadding) || undefined}
        />
        <SizeSlider
          label="Header spacing"
          value={parseNum(overrides.headerSpacing)}
          onChange={(v) => setOverride("headerSpacing", numToPx(v))}
          min={0}
          max={48}
          placeholder={parseNum(presetTokens.headerSpacing) || undefined}
        />
      </BlockStack>
    </SettingsSection>
  );
}

export function ThemeSectionTypographySection({
  value,
  onChange,
  previewRef,
  title = "Headings & text",
  description = "Heading and subheading typography",
  defaultOpen = true,
}: ThemeSectionProps) {
  const { presetTokens, overrides, setOverride } = useThemeOverrides(
    value,
    onChange,
  );
  const [open, setOpen] = useState(defaultOpen);
  const setHighlight = usePreviewHighlight(previewRef);

  return (
    <SettingsSection
      title={title}
      description={description}
      open={open}
      onToggle={() => setOpen((prev) => !prev)}
      onMouseEnter={() => setHighlight("typography")}
      onMouseLeave={() => setHighlight(null)}
    >
      <BlockStack gap="500">
        <TextStyleGroup
          label="Heading"
          color={{
            value: overrides.titleColor ?? "",
            onChange: (v) => setOverride("titleColor", v),
            placeholder: presetTokens.titleColor,
          }}
          size={{
            value: parseNum(overrides.titleSize),
            onChange: (v) => setOverride("titleSize", numToPx(v)),
            placeholder: parseNum(presetTokens.titleSize) || undefined,
            min: 16,
            max: 48,
          }}
          weight={{
            value: overrides.titleWeight ?? "",
            onChange: (v) => setOverride("titleWeight", v),
            placeholder: presetTokens.titleWeight,
          }}
        />
        <TextStyleGroup
          label="Subheading"
          color={{
            value: overrides.subtitleColor ?? "",
            onChange: (v) => setOverride("subtitleColor", v),
            placeholder: presetTokens.subtitleColor,
          }}
          size={{
            value: parseNum(overrides.subtitleSize),
            onChange: (v) => setOverride("subtitleSize", numToPx(v)),
            placeholder: parseNum(presetTokens.subtitleSize) || undefined,
            min: 12,
            max: 24,
          }}
          weight={{
            value: overrides.subtitleWeight ?? "",
            onChange: (v) => setOverride("subtitleWeight", v),
            placeholder: presetTokens.subtitleWeight,
          }}
        />
      </BlockStack>
    </SettingsSection>
  );
}

export function ThemeNotificationStyleSection({
  value,
  onChange,
  previewRef,
  title = "Notification style",
  description = "Radius and typography for notifications",
  defaultOpen = true,
}: ThemeSectionProps) {
  const { presetTokens, overrides, setOverride } = useThemeOverrides(
    value,
    onChange,
  );
  const [open, setOpen] = useState(defaultOpen);
  const setHighlight = usePreviewHighlight(previewRef);

  return (
    <SettingsSection
      title={title}
      description={description}
      open={open}
      onToggle={() => setOpen((prev) => !prev)}
      onMouseEnter={() => setHighlight("notifications")}
      onMouseLeave={() => setHighlight(null)}
    >
      <BlockStack gap="400">
        <SizeSlider
          label="Notification radius"
          value={parseNum(overrides.notifBorderRadius)}
          onChange={(v) => setOverride("notifBorderRadius", numToPx(v))}
          min={0}
          max={24}
          placeholder={parseNum(presetTokens.notifBorderRadius) || undefined}
        />
        <SizeSlider
          label="Notification font size"
          value={parseNum(overrides.notifFontSize)}
          onChange={(v) => setOverride("notifFontSize", numToPx(v))}
          min={12}
          max={20}
          placeholder={parseNum(presetTokens.notifFontSize) || undefined}
        />
        <SizeSlider
          label="Notification button radius"
          value={parseNum(overrides.notifButtonRadius)}
          onChange={(v) => setOverride("notifButtonRadius", numToPx(v))}
          min={0}
          max={16}
          placeholder={parseNum(presetTokens.notifButtonRadius) || undefined}
        />
      </BlockStack>
    </SettingsSection>
  );
}
