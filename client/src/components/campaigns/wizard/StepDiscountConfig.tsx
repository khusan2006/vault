"use client";

import { useCallback } from "react";
import {
  Card,
  BlockStack,
  TextField,
  Text,
  Select,
  Box,
  Divider,
  InlineStack,
} from "@shopify/polaris";
import type { DiscountedProductConfig, DiscountType } from "@/types";
import type { CampaignFormState } from "@/hooks/useCampaignForm";

const discountTypeOptions = [
  { label: "Percentage (%)", value: "percentage" },
  { label: "Fixed amount ($)", value: "fixed_amount" },
];

interface StepDiscountConfigProps {
  formState: CampaignFormState;
  onFieldChange: <K extends keyof CampaignFormState>(
    field: K,
    value: CampaignFormState[K],
  ) => void;
}

export function StepDiscountConfig({
  formState,
  onFieldChange,
}: StepDiscountConfigProps) {
  const config = formState.config as DiscountedProductConfig;

  const updateConfig = useCallback(
    (updates: Partial<DiscountedProductConfig>) => {
      onFieldChange("config", { ...config, ...updates });
    },
    [config, onFieldChange],
  );

  const discountPreview =
    config.discount.value > 0
      ? config.discount.type === "percentage"
        ? `${config.discount.value}% off`
        : `$${config.discount.value} off`
      : null;

  return (
    <Card>
      <BlockStack gap="400">
        <BlockStack gap="100">
          <Text variant="headingMd" as="h2">
            Discount Configuration
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            Set the discount amount that qualifying customers will receive.
          </Text>
        </BlockStack>

        <Divider />

        <InlineStack gap="300" wrap={false}>
          <Box width="50%">
            <Select
              label="Discount type"
              options={discountTypeOptions}
              value={config.discount.type}
              onChange={(value) =>
                updateConfig({
                  discount: {
                    ...config.discount,
                    type: value as DiscountType,
                  },
                })
              }
            />
          </Box>
          <Box width="50%">
            <TextField
              label="Discount value"
              type="number"
              value={String(config.discount.value)}
              onChange={(value) =>
                updateConfig({
                  discount: {
                    ...config.discount,
                    value: Number(value) || 0,
                  },
                })
              }
              autoComplete="off"
              suffix={config.discount.type === "percentage" ? "%" : "$"}
            />
          </Box>
        </InlineStack>

        {discountPreview && (
          <Text as="p" variant="bodyMd" tone="success">
            Preview: {discountPreview}
          </Text>
        )}
      </BlockStack>
    </Card>
  );
}
