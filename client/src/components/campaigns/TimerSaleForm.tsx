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
  Badge,
  Icon,
  Checkbox,
} from "@shopify/polaris";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from "@shopify/polaris-icons";
import { useState } from "react";
import type {
  CampaignStatus,
  Condition,
  TimerSaleConfig,
  DiscountType,
  DiscountMethod,
} from "@/types";
import type { CampaignFormState } from "@/hooks/useCampaignForm";
import { useResourcePicker } from "@/hooks/useResourcePicker";
import { ConditionBuilder } from "./ConditionBuilder";

const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Archived", value: "archived" },
];

const discountTypeOptions = [
  { label: "Percentage (%)", value: "percentage" },
  { label: "Fixed amount ($)", value: "fixed_amount" },
];

const discountMethodOptions = [
  { label: "Change product price", value: "price_change" },
  { label: "Generate discount code", value: "discount_code" },
];

interface TimerSaleFormProps {
  formState: CampaignFormState;
  onFieldChange: <K extends keyof CampaignFormState>(field: K, value: CampaignFormState[K]) => void;
  nameError?: string;
  showArchived?: boolean;
}

export function TimerSaleForm({
  formState,
  onFieldChange,
  nameError,
  showArchived = false,
}: TimerSaleFormProps) {
  const { selectProducts, selectCollections } = useResourcePicker();
  const [scheduleOpen, setScheduleOpen] = useState(Boolean(formState.startsAt || formState.endsAt));
  const [priorityOpen, setPriorityOpen] = useState(formState.priority !== 10);

  const config = formState.config as TimerSaleConfig;

  const filteredStatusOptions = showArchived
    ? statusOptions
    : statusOptions.filter((o) => o.value !== "archived");

  const updateConfig = useCallback(
    (updates: Partial<TimerSaleConfig>) => {
      onFieldChange("config", { ...config, ...updates });
    },
    [config, onFieldChange],
  );

  const handleSelectProducts = useCallback(async () => {
    const selectedIds = await selectProducts(config.productIds);
    updateConfig({ productIds: selectedIds });
  }, [config.productIds, selectProducts, updateConfig]);

  const handleSelectCollections = useCallback(async () => {
    const selectedIds = await selectCollections(config.collectionIds);
    updateConfig({ collectionIds: selectedIds });
  }, [config.collectionIds, selectCollections, updateConfig]);

  // Derived state
  const hasName = formState.name.trim().length > 0;
  const conditionCount = formState.conditions.conditions.length;
  const hasConditions =
    conditionCount > 0 &&
    !(
      conditionCount === 1 &&
      "type" in formState.conditions.conditions[0] &&
      (formState.conditions.conditions[0] as Condition).value === ""
    );
  const hasProducts = config.productIds.length > 0 || config.collectionIds.length > 0;
  const hasDiscount = config.discount.value > 0;
  const hasTimer = config.timerDurationMinutes > 0;

  const discountLabel = config.discount.type === "percentage"
    ? `${config.discount.value}% off`
    : `$${config.discount.value} off`;

  const timerLabel = config.timerDurationMinutes >= 60
    ? `${Math.floor(config.timerDurationMinutes / 60)}h ${config.timerDurationMinutes % 60}m`
    : `${config.timerDurationMinutes}m`;

  return (
    <>
      {/* Main column */}
      <Layout.Section>
        {/* Details */}
        <Card>
          <BlockStack gap="400">
            <BlockStack gap="100">
              <InlineStack gap="200" blockAlign="center">
                <Text variant="headingMd" as="h2">Details</Text>
                <Badge tone="attention">Timer Sale</Badge>
              </InlineStack>
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
              placeholder="e.g., Flash Sale Weekend"
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
            />
          </BlockStack>
        </Card>

        {/* Timer settings */}
        <Box paddingBlockStart="400">
          <Card>
            <BlockStack gap="400">
              <BlockStack gap="100">
                <Text variant="headingMd" as="h2">Timer</Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Set the countdown duration. The timer starts when a customer first
                  views an eligible product. They must complete their purchase before
                  it expires.
                </Text>
              </BlockStack>
              <Divider />
              <TextField
                label="Timer duration (minutes)"
                type="number"
                value={String(config.timerDurationMinutes)}
                onChange={(value) =>
                  updateConfig({ timerDurationMinutes: Math.max(1, Number(value) || 1) })
                }
                autoComplete="off"
                helpText="How long customers have to purchase at the discounted price"
                suffix="minutes"
              />
              <Checkbox
                label="Show countdown timer on product page"
                checked={config.showCountdown}
                onChange={(checked) => updateConfig({ showCountdown: checked })}
                helpText="When enabled, customers will see a visible countdown timer on eligible product pages"
              />
            </BlockStack>
          </Card>
        </Box>

        {/* Discount settings */}
        <Box paddingBlockStart="400">
          <Card>
            <BlockStack gap="400">
              <BlockStack gap="100">
                <Text variant="headingMd" as="h2">Discount</Text>
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
                        discount: { ...config.discount, type: value as DiscountType },
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
                        discount: { ...config.discount, value: Number(value) || 0 },
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
        </Box>

        {/* Products */}
        <Box paddingBlockStart="400">
          <Card>
            <BlockStack gap="400">
              <BlockStack gap="100">
                <Text variant="headingMd" as="h2">Products</Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Select which products should be included in the timer sale.
                </Text>
              </BlockStack>
              <Divider />
              <InlineStack gap="300">
                <Button onClick={handleSelectProducts}>
                  {config.productIds.length > 0
                    ? `${config.productIds.length} product${config.productIds.length > 1 ? "s" : ""} selected`
                    : "Select products"}
                </Button>
                <Button onClick={handleSelectCollections}>
                  {config.collectionIds.length > 0
                    ? `${config.collectionIds.length} collection${config.collectionIds.length > 1 ? "s" : ""} selected`
                    : "Select collections"}
                </Button>
              </InlineStack>
              {!hasProducts && (
                <Banner tone="info">
                  If no products are selected, the timer sale will apply to all products.
                </Banner>
              )}
            </BlockStack>
          </Card>
        </Box>

        {/* Conditions */}
        <Box paddingBlockStart="400">
          <ConditionBuilder
            value={formState.conditions}
            onChange={(value) => onFieldChange("conditions", value)}
          />
        </Box>
      </Layout.Section>

      {/* Sidebar */}
      <Layout.Section variant="oneThird">
        {/* Summary */}
        <Card>
          <BlockStack gap="300">
            <Text variant="headingMd" as="h2">Summary</Text>
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
                source={hasTimer ? CheckCircleIcon : AlertCircleIcon}
                tone={hasTimer ? "success" : "subdued"}
              />
              <Text as="p" variant="bodySm">
                {hasTimer ? `${timerLabel} countdown` : "No timer set"}
              </Text>
            </InlineStack>
            <InlineStack gap="200" blockAlign="center">
              <Icon
                source={hasDiscount ? CheckCircleIcon : AlertCircleIcon}
                tone={hasDiscount ? "success" : "subdued"}
              />
              <Text as="p" variant="bodySm">
                {hasDiscount ? discountLabel : "No discount set"}
              </Text>
            </InlineStack>
            <InlineStack gap="200" blockAlign="center">
              <Icon
                source={hasProducts ? CheckCircleIcon : AlertCircleIcon}
                tone={hasProducts ? "success" : "subdued"}
              />
              <Text as="p" variant="bodySm">
                {hasProducts
                  ? `${config.productIds.length + config.collectionIds.length} items selected`
                  : "All products"}
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
                  : "All customers"}
              </Text>
            </InlineStack>
          </BlockStack>
        </Card>

        {/* Status */}
        <Box paddingBlockStart="400">
          <Card>
            <BlockStack gap="300">
              <Text variant="headingMd" as="h2">Status</Text>
              <Select
                label="Campaign status"
                labelHidden
                options={filteredStatusOptions}
                value={formState.status}
                onChange={(value) => onFieldChange("status", value as CampaignStatus)}
              />
              {formState.status === "active" && !hasDiscount && (
                <Banner tone="warning">
                  No discount value set — the timer sale won&apos;t offer any savings.
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
                <Text variant="headingMd" as="h2">Schedule</Text>
                <Button
                  variant="plain"
                  icon={scheduleOpen ? ChevronUpIcon : ChevronDownIcon}
                  onClick={() => setScheduleOpen(!scheduleOpen)}
                  accessibilityLabel={scheduleOpen ? "Collapse" : "Expand"}
                />
              </InlineStack>
              <Collapsible open={scheduleOpen} id="schedule-section">
                <BlockStack gap="300">
                  <TextField
                    label="Start date" type="date"
                    value={formState.startsAt}
                    onChange={(value) => onFieldChange("startsAt", value)}
                    autoComplete="off"
                    helpText="Leave empty to start immediately when activated"
                  />
                  <TextField
                    label="End date" type="date"
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
                <Text variant="headingMd" as="h2">Priority</Text>
                <Button
                  variant="plain"
                  icon={priorityOpen ? ChevronUpIcon : ChevronDownIcon}
                  onClick={() => setPriorityOpen(!priorityOpen)}
                  accessibilityLabel={priorityOpen ? "Collapse" : "Expand"}
                />
              </InlineStack>
              <Collapsible open={priorityOpen} id="priority-section">
                <TextField
                  label="Priority value" labelHidden type="number"
                  value={String(formState.priority)}
                  onChange={(value) => onFieldChange("priority", Number(value) || 0)}
                  autoComplete="off"
                  helpText="Higher priority campaigns take precedence."
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
