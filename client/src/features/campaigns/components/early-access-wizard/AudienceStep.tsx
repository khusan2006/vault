"use client";

import { useCallback } from "react";
import { BlockStack, Text, Banner, Card, Divider } from "@shopify/polaris";
import type { ConditionGroup } from "@/types";
import type { CampaignFormState } from "@/features/campaigns/hooks/useCampaignForm";
import { RuleBuilder } from "./RuleBuilder";

// =============================================================================
// Types
// =============================================================================

interface AudienceStepProps {
  formState: CampaignFormState;
  onFieldChange: <K extends keyof CampaignFormState>(
    field: K,
    value: CampaignFormState[K],
  ) => void;
  title?: string;
  description?: string;
  rulesTitle?: string;
  rulesDescription?: string;
  tipText?: string;
}

// =============================================================================
// Component
// =============================================================================

export function AudienceStep({
  formState,
  onFieldChange,
  title = "Who should get early access?",
  description = "Define the rules that determine which customers can see the exclusive products. Customers who don't match these rules won't see them at all.",
  rulesTitle = "Customer rules",
  rulesDescription = "Add rules to control which customers qualify. Combine rules with AND (must match all) or OR (match any).",
  tipText = "If you don't add any rules, all logged-in customers will qualify for early access. Guest visitors will never see exclusive products.",
}: AudienceStepProps) {
  const handleConditionsChange = useCallback(
    (conditions: ConditionGroup) => {
      onFieldChange("conditions", conditions);
    },
    [onFieldChange],
  );

  return (
    <BlockStack gap="500">
      {/* Header */}
      <BlockStack gap="200">
        <Text variant="headingLg" as="h2">
          {title}
        </Text>
        <Text as="p" tone="subdued">
          {description}
        </Text>
      </BlockStack>

      {/* Rule builder */}
      <Card>
        <BlockStack gap="400">
          <BlockStack gap="100">
            <Text variant="headingMd" as="h2">
              {rulesTitle}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              {rulesDescription}
            </Text>
          </BlockStack>

          <Divider />

          <RuleBuilder
            value={formState.conditions}
            onChange={handleConditionsChange}
          />
        </BlockStack>
      </Card>

      {/* Helpful tip */}
      <Banner tone="info">
        <Text as="p" variant="bodyMd">
          <Text as="span" fontWeight="semibold">
            Tip:
          </Text>{" "}
          {tipText}
        </Text>
      </Banner>
    </BlockStack>
  );
}
