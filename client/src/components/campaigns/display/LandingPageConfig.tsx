"use client";

import { useState } from "react";
import {
  Card,
  BlockStack,
  InlineStack,
  TextField,
  Select,
  Text,
  Checkbox,
  Divider,
} from "@shopify/polaris";
import type { LandingPageDisplayConfig } from "@/types";
import { AccordionSection } from "./AccordionSection";

const GRID_COLUMN_OPTIONS = [
  { label: "2 columns", value: "2" },
  { label: "3 columns", value: "3" },
  { label: "4 columns", value: "4" },
];

const ITEM_LAYOUT_OPTIONS = [
  { label: "Card layout", value: "card" },
  { label: "Row layout", value: "row" },
  { label: "Minimal layout", value: "minimal" },
];

interface LandingPageConfigProps {
  value: LandingPageDisplayConfig;
  onChange: (value: LandingPageDisplayConfig) => void;
  layout?: "card" | "plain";
  showHeading?: boolean;
  grouping?: "accordion" | "flat";
}

export function LandingPageConfig({
  value,
  onChange,
  layout = "card",
  showHeading = true,
  grouping = "accordion",
}: LandingPageConfigProps) {
  const resolvedValue: LandingPageDisplayConfig = {
    ...value,
    itemLayout: value.itemLayout ?? "card",
    showAddToCart: value.showAddToCart ?? true,
    showCategory: value.showCategory ?? true,
    showCompareAt: value.showCompareAt ?? true,
    showRatings: value.showRatings ?? true,
  };
  const [sectionsOpen, setSectionsOpen] = useState({
    basics: true,
    layout: true,
    badge: false,
    items: false,
  });

  const basicsFields = (
    <BlockStack gap="300">
      <Checkbox
        label="Show products on exclusive landing page"
        checked={resolvedValue.enabled}
        onChange={(enabled) => onChange({ ...resolvedValue, enabled })}
      />
      {resolvedValue.enabled && (
        <>
          <TextField
            label="Heading"
            value={resolvedValue.heading}
            onChange={(heading) => onChange({ ...resolvedValue, heading })}
            autoComplete="off"
          />
          <TextField
            label="Subheading"
            value={resolvedValue.subheading}
            onChange={(subheading) =>
              onChange({ ...resolvedValue, subheading })
            }
            autoComplete="off"
            helpText="Explain who can access these products and why."
          />
        </>
      )}
    </BlockStack>
  );

  const layoutFields = resolvedValue.enabled ? (
    <Select
      label="Grid columns"
      options={GRID_COLUMN_OPTIONS}
      value={String(resolvedValue.gridColumns)}
      onChange={(val) =>
        onChange({
          ...resolvedValue,
          gridColumns: Number(val) as 2 | 3 | 4,
        })
      }
    />
  ) : (
    <Text as="p" variant="bodySm" tone="subdued">
      Enable the landing page to adjust layout.
    </Text>
  );

  const badgeFields = resolvedValue.enabled ? (
    <BlockStack gap="300">
      <TextField
        label="Badge text"
        value={resolvedValue.badgeText}
        onChange={(badgeText) => onChange({ ...resolvedValue, badgeText })}
        autoComplete="off"
      />
      <InlineStack gap="200" blockAlign="center">
        <div
          aria-hidden
          className="h-7 w-7 rounded-[var(--p-border-radius-100)] border border-[var(--p-color-border)]"
          style={{ backgroundColor: resolvedValue.badgeColor }}
        />
        <div className="flex-1">
          <TextField
            label="Badge color"
            value={resolvedValue.badgeColor}
            onChange={(badgeColor) =>
              onChange({ ...resolvedValue, badgeColor })
            }
            placeholder="#7c3aed"
            autoComplete="off"
          />
        </div>
      </InlineStack>
    </BlockStack>
  ) : (
    <Text as="p" variant="bodySm" tone="subdued">
      Enable the landing page to customize badges.
    </Text>
  );

  const itemFields = resolvedValue.enabled ? (
    <BlockStack gap="300">
      <Select
        label="Product item layout"
        options={ITEM_LAYOUT_OPTIONS}
        value={resolvedValue.itemLayout}
        onChange={(itemLayout) =>
          onChange({
            ...resolvedValue,
            itemLayout: itemLayout as LandingPageDisplayConfig["itemLayout"],
          })
        }
      />
      <BlockStack gap="200">
        <Checkbox
          label="Show add to cart button"
          checked={resolvedValue.showAddToCart}
          onChange={(showAddToCart) =>
            onChange({ ...resolvedValue, showAddToCart })
          }
        />
        <Checkbox
          label="Show product category"
          checked={resolvedValue.showCategory}
          onChange={(showCategory) =>
            onChange({ ...resolvedValue, showCategory })
          }
        />
        <Checkbox
          label="Show compare-at price"
          checked={resolvedValue.showCompareAt}
          onChange={(showCompareAt) =>
            onChange({ ...resolvedValue, showCompareAt })
          }
        />
        <Checkbox
          label="Show ratings"
          checked={resolvedValue.showRatings}
          onChange={(showRatings) =>
            onChange({ ...resolvedValue, showRatings })
          }
        />
      </BlockStack>
    </BlockStack>
  ) : (
    <Text as="p" variant="bodySm" tone="subdued">
      Enable the landing page to customize product cards.
    </Text>
  );

  const content = (
    <BlockStack gap="400">
      {showHeading && (
        <>
          <Text variant="headingMd" as="h2">
            Landing Page Section
          </Text>
          <Divider />
        </>
      )}

      {grouping === "accordion" ? (
        <BlockStack gap="300">
          <AccordionSection
            title="Basics"
            description="Show or hide the landing page section"
            open={sectionsOpen.basics}
            onToggle={() =>
              setSectionsOpen((prev) => ({ ...prev, basics: !prev.basics }))
            }
          >
            {basicsFields}
          </AccordionSection>

          <AccordionSection
            title="Layout"
            description="Grid and spacing"
            open={sectionsOpen.layout}
            onToggle={() =>
              setSectionsOpen((prev) => ({ ...prev, layout: !prev.layout }))
            }
            disabled={!value.enabled}
          >
            {layoutFields}
          </AccordionSection>

          <AccordionSection
            title="Badge"
            description="Badge label and color"
            open={sectionsOpen.badge}
            onToggle={() =>
              setSectionsOpen((prev) => ({ ...prev, badge: !prev.badge }))
            }
            disabled={!value.enabled}
          >
            {badgeFields}
          </AccordionSection>

          <AccordionSection
            title="Product cards"
            description="Layout and details"
            open={sectionsOpen.items}
            onToggle={() =>
              setSectionsOpen((prev) => ({ ...prev, items: !prev.items }))
            }
            disabled={!value.enabled}
          >
            {itemFields}
          </AccordionSection>
        </BlockStack>
      ) : (
        <BlockStack gap="400">
          <BlockStack gap="200">
            <Text as="p" variant="bodyMd" fontWeight="semibold">
              Basics
            </Text>
            {basicsFields}
          </BlockStack>

          <BlockStack gap="200">
            <Text as="p" variant="bodyMd" fontWeight="semibold">
              Layout
            </Text>
            {layoutFields}
          </BlockStack>

          <BlockStack gap="200">
            <Text as="p" variant="bodyMd" fontWeight="semibold">
              Badge
            </Text>
            {badgeFields}
          </BlockStack>

          <BlockStack gap="200">
            <Text as="p" variant="bodyMd" fontWeight="semibold">
              Product cards
            </Text>
            {itemFields}
          </BlockStack>
        </BlockStack>
      )}
    </BlockStack>
  );

  if (layout === "plain") {
    return content;
  }

  return <Card>{content}</Card>;
}
