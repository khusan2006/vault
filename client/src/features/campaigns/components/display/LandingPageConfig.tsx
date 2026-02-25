"use client";

import { Fragment, useState } from "react";
import {
  Card,
  BlockStack,
  TextField,
  Select,
  Text,
  Checkbox,
  Divider,
} from "@shopify/polaris";
import type { LandingPageDisplayConfig, EarlyAccessStorefrontApproach } from "@/types";
import { AccordionSection } from "./AccordionSection";
import { ColorInput } from "./controls";

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
  approach?: EarlyAccessStorefrontApproach;
  sections?: Array<"basics" | "layout" | "badge" | "items">;
}

export function LandingPageConfig({
  value,
  onChange,
  layout = "card",
  showHeading = true,
  grouping = "accordion",
  approach,
  sections,
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

  // Customer page approach: limited settings (Shopify controls card styling)
  const isCustomerPage = approach === "customer_page";
  const visibleSections = sections ?? ["basics", "layout", "badge", "items"];
  const showBasics = visibleSections.includes("basics");
  const showLayout = visibleSections.includes("layout");
  const showBadge = visibleSections.includes("badge");
  const showItems = visibleSections.includes("items");

  const basicsFields = (
    <BlockStack gap="300">
      <Checkbox
        label={
          isCustomerPage
            ? "Show products on customer account page"
            : "Show products on exclusive landing page"
        }
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
            helpText={
              isCustomerPage
                ? "Displayed at the top of the customer account products section."
                : "Explain who can access these products and why."
            }
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
      Enable the page to adjust layout.
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
      <ColorInput
        label="Badge color"
        value={resolvedValue.badgeColor}
        onChange={(badgeColor) => onChange({ ...resolvedValue, badgeColor })}
        placeholder="#7c3aed"
      />
    </BlockStack>
  ) : (
    <Text as="p" variant="bodySm" tone="subdued">
      Enable the page to customize badges.
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
      Enable the page to customize product cards.
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
          {showBasics && (
            <AccordionSection
              title="Basics"
              description="Show or hide the page section"
              open={sectionsOpen.basics}
              onToggle={() =>
                setSectionsOpen((prev) => ({ ...prev, basics: !prev.basics }))
              }
            >
              {basicsFields}
            </AccordionSection>
          )}

          {showLayout && (
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
          )}

          {!isCustomerPage && showBadge && (
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
          )}

          {!isCustomerPage && showItems && (
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
          )}
        </BlockStack>
      ) : (
        <BlockStack gap="400">
          {[
            showBasics
              ? { key: "basics", label: "Basics", fields: basicsFields }
              : null,
            showLayout
              ? { key: "layout", label: "Layout", fields: layoutFields }
              : null,
            !isCustomerPage && showBadge
              ? { key: "badge", label: "Badge", fields: badgeFields }
              : null,
            !isCustomerPage && showItems
              ? { key: "items", label: "Product cards", fields: itemFields }
              : null,
          ]
            .filter(Boolean)
            .map((section, index) => {
              const data = section as {
                key: string;
                label: string;
                fields: JSX.Element;
              };
              return (
                <Fragment key={data.key}>
                  {index > 0 && <Divider />}
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd" fontWeight="semibold">
                      {data.label}
                    </Text>
                    {data.fields}
                  </BlockStack>
                </Fragment>
              );
            })}
        </BlockStack>
      )}
    </BlockStack>
  );

  if (layout === "plain") {
    return content;
  }

  return <Card>{content}</Card>;
}
