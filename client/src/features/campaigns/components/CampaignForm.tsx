"use client";

import { useCallback } from "react";
import {
  Layout,
  Card,
  BlockStack,
  TextField,
  Text,
  Select,
  Box,
  Collapsible,
  Button,
  InlineStack,
  Divider,
  Banner,
  Icon,
} from "@shopify/polaris";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from "@shopify/polaris-icons";
import { useState } from "react";
import type { CampaignStatus, Condition } from "@/types";
import type { CampaignFormState } from "@/features/campaigns/hooks/useCampaignForm";
import { useResourcePicker } from "@/features/campaigns/hooks/useResourcePicker";
import { CAMPAIGN_STATUS_OPTIONS } from "@/constants";
import { ConditionBuilder } from "./ConditionBuilder";
import { BenefitSelector } from "./BenefitSelector";

interface CampaignFormProps {
  formState: CampaignFormState;
  onFieldChange: <K extends keyof CampaignFormState>(field: K, value: CampaignFormState[K]) => void;
  nameError?: string;
  showArchived?: boolean;
}

export function CampaignForm({
  formState,
  onFieldChange,
  nameError,
  showArchived = false,
}: CampaignFormProps) {
  const { selectProducts, selectCollections } = useResourcePicker();
  const [scheduleOpen, setScheduleOpen] = useState(Boolean(formState.startsAt || formState.endsAt));
  const [priorityOpen, setPriorityOpen] = useState(formState.priority !== 10);

  const filteredStatusOptions = showArchived
    ? CAMPAIGN_STATUS_OPTIONS
    : CAMPAIGN_STATUS_OPTIONS.filter((o) => o.value !== "archived");

  const benefits = formState.benefits ?? [];

  const handleSelectProducts = useCallback(
    async (benefitIndex: number) => {
      const currentBenefits = formState.benefits ?? [];
      const benefit = currentBenefits[benefitIndex];
      const selectedIds = await selectProducts(benefit.productIds);
      const newBenefits = [...currentBenefits];
      newBenefits[benefitIndex] = { ...benefit, productIds: selectedIds };
      onFieldChange("benefits", newBenefits);
    },
    [formState.benefits, selectProducts, onFieldChange],
  );

  const handleSelectCollections = useCallback(
    async (benefitIndex: number) => {
      const currentBenefits = formState.benefits ?? [];
      const benefit = currentBenefits[benefitIndex];
      const selectedIds = await selectCollections(benefit.collectionIds);
      const newBenefits = [...currentBenefits];
      newBenefits[benefitIndex] = { ...benefit, collectionIds: selectedIds };
      onFieldChange("benefits", newBenefits);
    },
    [formState.benefits, selectCollections, onFieldChange],
  );

  // Derived state for summary
  const hasName = formState.name.trim().length > 0;
  const conditionCount = formState.conditions.conditions.length;
  const hasConditions =
    conditionCount > 0 &&
    !(
      conditionCount === 1 &&
      "type" in formState.conditions.conditions[0] &&
      (formState.conditions.conditions[0] as Condition).value === ""
    );
  const hasBenefits = benefits.length > 0;

  return (
    <>
      {/* Main column */}
      <Layout.Section>
        {/* Details */}
        <Card>
          <BlockStack gap="400">
            <BlockStack gap="100">
              <Text variant="headingMd" as="h2">
                Details
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Name your campaign and add an internal description.
              </Text>
            </BlockStack>
            <Divider />
            <TextField
              label="Campaign name"
              value={formState.name}
              onChange={(value) => onFieldChange("name", value)}
              autoComplete="off"
              placeholder="e.g., VIP Customer Rewards"
              error={nameError}
              helpText="This name is only visible to you and your team."
            />
            <TextField
              label="Description"
              value={formState.description}
              onChange={(value) => onFieldChange("description", value)}
              autoComplete="off"
              multiline={3}
              placeholder="Internal note — customers won't see this"
              helpText="Optional. Help your team understand this campaign's purpose."
            />
          </BlockStack>
        </Card>

        {/* Conditions */}
        <Box paddingBlockStart="400">
          <ConditionBuilder
            value={formState.conditions}
            onChange={(value) => onFieldChange("conditions", value)}
          />
        </Box>

        {/* Benefits */}
        <Box paddingBlockStart="400">
          <BenefitSelector
            value={benefits}
            onChange={(value) => onFieldChange("benefits", value)}
            onSelectProducts={handleSelectProducts}
            onSelectCollections={handleSelectCollections}
          />
        </Box>
      </Layout.Section>

      {/* Sidebar */}
      <Layout.Section variant="oneThird">
        {/* Summary card */}
        <Card>
          <BlockStack gap="300">
            <Text variant="headingMd" as="h2">
              Summary
            </Text>
            <Divider />
            <InlineStack gap="200" blockAlign="center">
              <Icon
                source={hasName ? CheckCircleIcon : AlertCircleIcon}
                tone={hasName ? "success" : "subdued"}
              />
              <Text as="p" variant="bodySm">
                {hasName ? formState.name : "Campaign name required"}
              </Text>
            </InlineStack>
            <InlineStack gap="200" blockAlign="center">
              <Icon
                source={hasConditions ? CheckCircleIcon : AlertCircleIcon}
                tone={hasConditions ? "success" : "subdued"}
              />
              <Text as="p" variant="bodySm">
                {hasConditions
                  ? `${conditionCount} condition${conditionCount > 1 ? "s" : ""}`
                  : "No audience conditions"}
              </Text>
            </InlineStack>
            <InlineStack gap="200" blockAlign="center">
              <Icon
                source={hasBenefits ? CheckCircleIcon : AlertCircleIcon}
                tone={hasBenefits ? "success" : "subdued"}
              />
              <Text as="p" variant="bodySm">
                {hasBenefits
                  ? `${benefits.length} benefit${benefits.length > 1 ? "s" : ""}`
                  : "No benefits added"}
              </Text>
            </InlineStack>
          </BlockStack>
        </Card>

        {/* Status */}
        <Box paddingBlockStart="400">
          <Card>
            <BlockStack gap="300">
              <Text variant="headingMd" as="h2">
                Status
              </Text>
              <Select
                label="Campaign status"
                labelHidden
                options={filteredStatusOptions}
                value={formState.status}
                onChange={(value) => onFieldChange("status", value as CampaignStatus)}
              />
              {formState.status === "active" && !hasBenefits && (
                <Banner tone="warning">
                  This campaign has no benefits — customers won&apos;t
                  receive anything.
                </Banner>
              )}
              {formState.status === "active" && !hasConditions && (
                <Banner tone="info">
                  No audience conditions set — all customers will qualify.
                </Banner>
              )}
            </BlockStack>
          </Card>
        </Box>

        {/* Schedule */}
        <Box paddingBlockStart="400">
          <Card>
            <BlockStack gap="300">
              <InlineStack align="space-between" blockAlign="center">
                <BlockStack gap="0">
                  <Text variant="headingMd" as="h2">
                    Schedule
                  </Text>
                </BlockStack>
                <Button
                  variant="plain"
                  icon={scheduleOpen ? ChevronUpIcon : ChevronDownIcon}
                  onClick={() => setScheduleOpen(!scheduleOpen)}
                  accessibilityLabel={scheduleOpen ? "Collapse schedule" : "Expand schedule"}
                />
              </InlineStack>
              <Collapsible open={scheduleOpen} id="schedule-section">
                <BlockStack gap="300">
                  <TextField
                    label="Start date"
                    type="date"
                    value={formState.startsAt}
                    onChange={(value) => onFieldChange("startsAt", value)}
                    autoComplete="off"
                    helpText="Leave empty to start immediately when activated"
                  />
                  <TextField
                    label="End date"
                    type="date"
                    value={formState.endsAt}
                    onChange={(value) => onFieldChange("endsAt", value)}
                    autoComplete="off"
                    helpText="Leave empty to run indefinitely"
                  />
                </BlockStack>
              </Collapsible>
              {!scheduleOpen && (
                <Text as="p" variant="bodySm" tone="subdued">
                  {formState.startsAt || formState.endsAt
                    ? `${formState.startsAt ? `Starts ${formState.startsAt}` : ""}${formState.startsAt && formState.endsAt ? " · " : ""}${formState.endsAt ? `Ends ${formState.endsAt}` : ""}`
                    : "No schedule set"}
                </Text>
              )}
            </BlockStack>
          </Card>
        </Box>

        {/* Priority */}
        <Box paddingBlockStart="400">
          <Card>
            <BlockStack gap="300">
              <InlineStack align="space-between" blockAlign="center">
                <Text variant="headingMd" as="h2">
                  Priority
                </Text>
                <Button
                  variant="plain"
                  icon={priorityOpen ? ChevronUpIcon : ChevronDownIcon}
                  onClick={() => setPriorityOpen(!priorityOpen)}
                  accessibilityLabel={priorityOpen ? "Collapse priority" : "Expand priority"}
                />
              </InlineStack>
              <Collapsible open={priorityOpen} id="priority-section">
                <TextField
                  label="Priority value"
                  labelHidden
                  type="number"
                  value={String(formState.priority)}
                  onChange={(value) => onFieldChange("priority", Number(value) || 0)}
                  autoComplete="off"
                  helpText="Higher priority campaigns take precedence when a customer qualifies for multiple."
                />
              </Collapsible>
              {!priorityOpen && (
                <Text as="p" variant="bodySm" tone="subdued">
                  Priority: {formState.priority}
                </Text>
              )}
            </BlockStack>
          </Card>
        </Box>
      </Layout.Section>
    </>
  );
}
