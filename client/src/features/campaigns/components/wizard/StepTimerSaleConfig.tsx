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
  Banner,
  Checkbox,
} from "@shopify/polaris";
import type {
  TimerSaleConfig,
  DiscountType,
  DiscountMethod,
  TimerType,
} from "@/types";
import type { CampaignFormState } from "@/features/campaigns/hooks/useCampaignForm";

const timerTypeOptions = [
  { label: "Per-customer session", value: "per_customer" },
  { label: "Global countdown", value: "global" },
];

const discountTypeOptions = [
  { label: "Percentage (%)", value: "percentage" },
  { label: "Fixed amount ($)", value: "fixed_amount" },
];

const discountMethodOptions = [
  { label: "Change product price", value: "price_change" },
  { label: "Generate discount code", value: "discount_code" },
];

interface StepTimerSaleConfigProps {
  formState: CampaignFormState;
  onFieldChange: <K extends keyof CampaignFormState>(
    field: K,
    value: CampaignFormState[K],
  ) => void;
}

export function StepTimerSaleConfig({
  formState,
  onFieldChange,
}: StepTimerSaleConfigProps) {
  const config = formState.config as TimerSaleConfig;

  const updateConfig = useCallback(
    (updates: Partial<TimerSaleConfig>) => {
      onFieldChange("config", { ...config, ...updates });
    },
    [config, onFieldChange],
  );

  const timerTypeHelpText =
    config.timerType === "per_customer"
      ? "Timer starts when customer first views an eligible product"
      : "All customers see countdown to campaign end date";

  return (
    <BlockStack gap="400">
      {/* Timer card */}
      <Card>
        <BlockStack gap="400">
          <BlockStack gap="100">
            <Text variant="headingMd" as="h2">
              Timer
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Configure how the countdown timer behaves for this sale.
            </Text>
          </BlockStack>

          <Divider />

          <Select
            label="Timer type"
            options={timerTypeOptions}
            value={config.timerType}
            onChange={(value) =>
              updateConfig({ timerType: value as TimerType })
            }
            helpText={timerTypeHelpText}
          />

          {config.timerType === "per_customer" && (
            <TextField
              label="Timer duration (minutes)"
              type="number"
              value={String(config.timerDurationMinutes)}
              onChange={(value) =>
                updateConfig({
                  timerDurationMinutes: Math.max(1, Number(value) || 1),
                })
              }
              autoComplete="off"
              helpText="How long customers have to purchase at the discounted price"
              suffix="minutes"
            />
          )}

          <Checkbox
            label="Show countdown timer on product page"
            checked={config.showCountdown}
            onChange={(checked) => updateConfig({ showCountdown: checked })}
          />

          {config.timerType === "global" && (
            <Banner tone="info">
              The global countdown uses the campaign end date. Make sure to set
              an end date in the schedule step.
            </Banner>
          )}
        </BlockStack>
      </Card>

      {/* Discount card */}
      <Card>
        <BlockStack gap="400">
          <BlockStack gap="100">
            <Text variant="headingMd" as="h2">
              Discount
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Configure the discount amount and how it should be applied.
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

          <Select
            label="Discount method"
            options={discountMethodOptions}
            value={config.discountMethod}
            onChange={(value) =>
              updateConfig({ discountMethod: value as DiscountMethod })
            }
            helpText={
              config.discountMethod === "price_change"
                ? "The product price will be temporarily reduced during the sale"
                : "A unique discount code will be generated for the customer"
            }
          />
        </BlockStack>
      </Card>
    </BlockStack>
  );
}
