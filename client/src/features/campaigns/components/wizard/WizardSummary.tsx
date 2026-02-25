"use client";

import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Icon,
  Badge,
  Divider,
  Box,
} from "@shopify/polaris";
import {
  CheckCircleIcon,
  AlertCircleIcon,
} from "@shopify/polaris-icons";
import type { CampaignFormState } from "@/features/campaigns/hooks/useCampaignForm";
import { CAMPAIGN_TYPE_LABELS } from "@/utils";
import type {
  DiscountedProductConfig,
  TimerSaleConfig,
  ConditionGroup,
  Condition,
} from "@/types";
import { CAMPAIGN_STATUS_TONE_MAP_EXTENDED } from "@/features/campaigns/constants";

// =============================================================================
// Types
// =============================================================================

interface WizardSummaryProps {
  formState: CampaignFormState;
  currentStep: number;
}

// =============================================================================
// Helpers
// =============================================================================

function countConditions(group: ConditionGroup): number {
  return group.conditions.reduce<number>((total, item) => {
    if ("conditions" in item && Array.isArray((item as ConditionGroup).conditions)) {
      return total + countConditions(item as ConditionGroup);
    }
    return total + 1;
  }, 0);
}

function isFilledCondition(condition: Condition): boolean {
  return String(condition.value).trim() !== "";
}

function hasFilledConditions(group: ConditionGroup): boolean {
  return group.conditions.some((item) => {
    if ("conditions" in item && Array.isArray((item as ConditionGroup).conditions)) {
      return hasFilledConditions(item as ConditionGroup);
    }
    return isFilledCondition(item as Condition);
  });
}

function hasDiscount(
  config: CampaignFormState["config"],
): config is DiscountedProductConfig | TimerSaleConfig {
  return "discount" in config;
}

function hasTimer(
  config: CampaignFormState["config"],
): config is TimerSaleConfig {
  return "timerDurationMinutes" in config;
}

// =============================================================================
// Validation item
// =============================================================================

function ValidationItem({
  label,
  valid,
  detail,
}: {
  label: string;
  valid: boolean;
  detail?: string;
}) {
  return (
    <InlineStack gap="200" blockAlign="start">
      <Box>
        <Icon
          source={valid ? CheckCircleIcon : AlertCircleIcon}
          tone={valid ? "success" : "subdued"}
        />
      </Box>
      <BlockStack gap="050">
        <Text as="span" variant="bodySm" fontWeight="medium">
          {label}
        </Text>
        {detail && (
          <Text as="span" variant="bodySm" tone="subdued">
            {detail}
          </Text>
        )}
      </BlockStack>
    </InlineStack>
  );
}

// =============================================================================
// Component
// =============================================================================

export function WizardSummary({ formState, currentStep }: WizardSummaryProps) {
  const config = formState.config as {
    productIds: string[];
    collectionIds: string[];
  };
  const productCount = config.productIds.length;
  const collectionCount = config.collectionIds.length;
  const totalProducts = productCount + collectionCount;
  const conditionCount = countConditions(formState.conditions);
  const conditionsFilled = hasFilledConditions(formState.conditions);

  // Schedule summary
  let scheduleText = "No schedule set";
  if (formState.startsAt && formState.endsAt) {
    scheduleText = `${formState.startsAt} to ${formState.endsAt}`;
  } else if (formState.startsAt) {
    scheduleText = `Starts ${formState.startsAt}`;
  } else if (formState.endsAt) {
    scheduleText = `Ends ${formState.endsAt}`;
  }

  return (
    <Card>
      <BlockStack gap="400">
        <Text variant="headingMd" as="h2">
          Summary
        </Text>

        <Badge tone="info">{CAMPAIGN_TYPE_LABELS[formState.type]}</Badge>

        <Divider />

        <BlockStack gap="300">
          <ValidationItem
            label="Name"
            valid={formState.name.trim().length > 0}
            detail={
              formState.name.trim()
                ? formState.name.trim()
                : "Required"
            }
          />

          <ValidationItem
            label="Products"
            valid={totalProducts > 0}
            detail={
              totalProducts > 0
                ? `${productCount} product${productCount !== 1 ? "s" : ""}, ${collectionCount} collection${collectionCount !== 1 ? "s" : ""}`
                : "No products selected"
            }
          />

          <ValidationItem
            label="Conditions"
            valid={conditionsFilled}
            detail={
              conditionsFilled
                ? `${conditionCount} condition${conditionCount !== 1 ? "s" : ""}`
                : "No conditions configured"
            }
          />

          {hasDiscount(formState.config) && (
            <ValidationItem
              label="Discount"
              valid={formState.config.discount.value > 0}
              detail={
                formState.config.discount.value > 0
                  ? formState.config.discount.type === "percentage"
                    ? `${formState.config.discount.value}% off`
                    : `$${formState.config.discount.value} off`
                  : "Not configured"
              }
            />
          )}

          {hasTimer(formState.config) && (
            <ValidationItem
              label="Timer"
              valid={formState.config.timerDurationMinutes > 0}
              detail={
                formState.config.timerDurationMinutes > 0
                  ? `${formState.config.timerDurationMinutes} minutes`
                  : "Not configured"
              }
            />
          )}
        </BlockStack>

        <Divider />

        <BlockStack gap="200">
          <InlineStack gap="200" blockAlign="center">
            <Text as="span" variant="bodySm" fontWeight="medium">
              Status:
            </Text>
            <Badge tone={CAMPAIGN_STATUS_TONE_MAP_EXTENDED[formState.status] ?? "info"}>
              {formState.status.charAt(0).toUpperCase() +
                formState.status.slice(1)}
            </Badge>
          </InlineStack>

          <Text as="p" variant="bodySm" tone="subdued">
            {scheduleText}
          </Text>

          <Text as="p" variant="bodySm" tone="subdued">
            Step {currentStep + 1} of 4
          </Text>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
