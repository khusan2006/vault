"use client";

import { useState, useCallback } from "react";
import { BlockStack, TextField, Text } from "@shopify/polaris";
import type { ThemeConfig, ThemePreset, StyleTokens } from "@/types";
import { PRESETS } from "@vault/shared/theme/presets";
import { AccordionSection } from "./AccordionSection";

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
// Override section definitions
// =============================================================================

interface OverrideField {
  key: keyof StyleTokens;
  label: string;
}

interface OverrideSection {
  id: string;
  title: string;
  description: string;
  fields: OverrideField[];
}

const OVERRIDE_SECTIONS: OverrideSection[] = [
  {
    id: "card",
    title: "Card Appearance",
    description: "Border radius, shadow, colors, and buttons",
    fields: [
      { key: "cardBorderRadius", label: "Card border radius" },
      { key: "cardShadow", label: "Card shadow" },
      { key: "cardBackground", label: "Card background" },
      { key: "cardBorderColor", label: "Card border color" },
      { key: "cardHoverShadow", label: "Card hover shadow" },
      { key: "cardHoverLift", label: "Card hover lift" },
      { key: "cardImageAspectRatio", label: "Card image aspect ratio" },
      { key: "cardInfoPadding", label: "Card info padding" },
      { key: "cardButtonBg", label: "Card button background" },
      { key: "cardButtonColor", label: "Card button color" },
      { key: "cardButtonRadius", label: "Card button radius" },
    ],
  },
  {
    id: "grid",
    title: "Grid & Layout",
    description: "Spacing, page width, and padding",
    fields: [
      { key: "gridGap", label: "Grid gap" },
      { key: "gridMobileGap", label: "Grid mobile gap" },
      { key: "pageMaxWidth", label: "Page max width" },
      { key: "pagePadding", label: "Page padding" },
      { key: "headerSpacing", label: "Header spacing" },
    ],
  },
  {
    id: "typography",
    title: "Typography",
    description: "Font sizes and text colors",
    fields: [
      { key: "titleSize", label: "Title size" },
      { key: "titleColor", label: "Title color" },
      { key: "subtitleSize", label: "Subtitle size" },
      { key: "subtitleColor", label: "Subtitle color" },
      { key: "cardTitleSize", label: "Card title size" },
      { key: "cardTitleColor", label: "Card title color" },
      { key: "cardPriceSize", label: "Card price size" },
      { key: "cardPriceColor", label: "Card price color" },
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Notification border radius and font sizing",
    fields: [
      { key: "notifBorderRadius", label: "Notification border radius" },
      { key: "notifFontSize", label: "Notification font size" },
      { key: "notifButtonRadius", label: "Notification button radius" },
    ],
  },
  {
    id: "timer",
    title: "Timer",
    description: "Timer border radius and number size",
    fields: [
      { key: "timerBorderRadius", label: "Timer border radius" },
      { key: "timerNumSize", label: "Timer number size" },
    ],
  },
];

// =============================================================================
// Props
// =============================================================================

interface ThemeConfigEditorProps {
  value: ThemeConfig;
  onChange: (value: ThemeConfig) => void;
}

// =============================================================================
// Component
// =============================================================================

export function ThemeConfigEditor({ value, onChange }: ThemeConfigEditorProps) {
  const [sectionsOpen, setSectionsOpen] = useState<Record<string, boolean>>({
    card: false,
    grid: false,
    typography: false,
    notifications: false,
    timer: false,
  });

  const presetTokens = PRESETS[value.preset];

  const handlePresetSelect = useCallback(
    (preset: ThemePreset) => {
      onChange({ preset, overrides: {} });
    },
    [onChange],
  );

  const handleOverrideChange = useCallback(
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

  const toggleSection = useCallback((sectionId: string) => {
    setSectionsOpen((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }, []);

  return (
    <BlockStack gap="400">
      {/* Preset picker */}
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

      {/* Override sections */}
      <BlockStack gap="200">
        <Text as="p" variant="bodyMd" fontWeight="semibold">
          Overrides
        </Text>
        <Text as="p" variant="bodySm" tone="subdued">
          Leave fields empty to use the preset default. Values shown as
          placeholders are the current preset defaults.
        </Text>
      </BlockStack>

      <BlockStack gap="300">
        {OVERRIDE_SECTIONS.map((section) => (
          <AccordionSection
            key={section.id}
            title={section.title}
            description={section.description}
            open={sectionsOpen[section.id] ?? false}
            onToggle={() => toggleSection(section.id)}
          >
            <BlockStack gap="300">
              {section.fields.map(({ key, label }) => (
                <TextField
                  key={key}
                  label={label}
                  placeholder={presetTokens[key]}
                  value={value.overrides[key] ?? ""}
                  onChange={(v) => handleOverrideChange(key, v)}
                  autoComplete="off"
                />
              ))}
            </BlockStack>
          </AccordionSection>
        ))}
      </BlockStack>
    </BlockStack>
  );
}
