"use client";

import {
  Card,
  BlockStack,
  TextField,
  Text,
  Checkbox,
  Divider,
} from "@shopify/polaris";
import type { ProductPageDisplayConfig } from "@/types";

interface ProductPageConfigProps {
  value: ProductPageDisplayConfig;
  onChange: (value: ProductPageDisplayConfig) => void;
  layout?: "card" | "plain";
  showHeading?: boolean;
}

export function ProductPageConfig({
  value,
  onChange,
  layout = "card",
  showHeading = true,
}: ProductPageConfigProps) {
  const bannerEnabled = value.banner != null;

  const content = (
    <BlockStack gap="400">
      {showHeading && (
        <>
          <Text variant="headingMd" as="h2">
            Product Page Display
          </Text>
          <Divider />
        </>
      )}
      <Checkbox
        label="Show strikethrough pricing"
        checked={value.showStrikethroughPricing}
        onChange={(showStrikethroughPricing) =>
          onChange({ ...value, showStrikethroughPricing })
        }
      />
      <Checkbox
        label="Show discount badge"
        checked={value.discountBadge.enabled}
        onChange={(enabled) =>
          onChange({
            ...value,
            discountBadge: { ...value.discountBadge, enabled },
          })
        }
      />
      {value.discountBadge.enabled && (
        <>
          <TextField
            label="Badge text"
            value={value.discountBadge.text}
            onChange={(text) =>
              onChange({
                ...value,
                discountBadge: { ...value.discountBadge, text },
              })
            }
            autoComplete="off"
          />
          <TextField
            label="Badge color"
            value={value.discountBadge.color}
            onChange={(color) =>
              onChange({
                ...value,
                discountBadge: { ...value.discountBadge, color },
              })
            }
            placeholder="#7c3aed"
            autoComplete="off"
          />
        </>
      )}
      <Checkbox
        label="Show product page banner"
        checked={bannerEnabled}
        onChange={(enabled) =>
          onChange({
            ...value,
            banner: enabled
              ? {
                  enabled: true,
                  message: "Special offer for you!",
                  bgColor: "#7c3aed",
                  textColor: "#ffffff",
                }
              : null,
          })
        }
      />
      {value.banner != null && (
        <>
          <TextField
            label="Banner message"
            value={value.banner.message}
            onChange={(message) =>
              onChange({
                ...value,
                banner: { ...value.banner!, message },
              })
            }
            autoComplete="off"
          />
          <TextField
            label="Background color"
            value={value.banner.bgColor}
            onChange={(bgColor) =>
              onChange({
                ...value,
                banner: { ...value.banner!, bgColor },
              })
            }
            placeholder="#7c3aed"
            autoComplete="off"
          />
          <TextField
            label="Text color"
            value={value.banner.textColor}
            onChange={(textColor) =>
              onChange({
                ...value,
                banner: { ...value.banner!, textColor },
              })
            }
            placeholder="#ffffff"
            autoComplete="off"
          />
        </>
      )}
    </BlockStack>
  );

  if (layout === "plain") {
    return content;
  }

  return <Card>{content}</Card>;
}
