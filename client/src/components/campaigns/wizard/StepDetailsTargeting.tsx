"use client";

import { useCallback } from "react";
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  TextField,
  Select,
  Button,
  Badge,
  Box,
} from "@shopify/polaris";
import type { CampaignFormState } from "@/hooks/useCampaignForm";
import type { CampaignStatus, ConditionGroup, CampaignConfig } from "@/types";
import { useResourcePicker } from "@/hooks/useResourcePicker";
import { ConditionBuilder } from "../ConditionBuilder";

// =============================================================================
// Types
// =============================================================================

interface StepDetailsTargetingProps {
  formState: CampaignFormState;
  onFieldChange: <K extends keyof CampaignFormState>(
    field: K,
    value: CampaignFormState[K],
  ) => void;
  nameError?: string;
}

// =============================================================================
// Status options (no "Archived" for new campaigns)
// =============================================================================

const STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
];

// =============================================================================
// Component
// =============================================================================

export function StepDetailsTargeting({
  formState,
  onFieldChange,
  nameError,
}: StepDetailsTargetingProps) {
  const { selectProducts, selectCollections } = useResourcePicker();

  // ---------------------------------------------------------------------------
  // Config helpers (products/collections live inside config)
  // ---------------------------------------------------------------------------

  const config = formState.config as {
    productIds: string[];
    collectionIds: string[];
  };

  const handleSelectProducts = useCallback(async () => {
    const ids = await selectProducts(config.productIds);
    onFieldChange("config", {
      ...formState.config,
      productIds: ids,
    } as CampaignConfig);
  }, [selectProducts, config.productIds, formState.config, onFieldChange]);

  const handleSelectCollections = useCallback(async () => {
    const ids = await selectCollections(config.collectionIds);
    onFieldChange("config", {
      ...formState.config,
      collectionIds: ids,
    } as CampaignConfig);
  }, [
    selectCollections,
    config.collectionIds,
    formState.config,
    onFieldChange,
  ]);

  const handleConditionsChange = useCallback(
    (value: ConditionGroup) => {
      onFieldChange("conditions", value);
    },
    [onFieldChange],
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <BlockStack gap="400">
      {/* Details */}
      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h2">
            Details
          </Text>
          <TextField
            label="Campaign name"
            value={formState.name}
            onChange={(value) => onFieldChange("name", value)}
            autoComplete="off"
            error={nameError}
            placeholder="e.g. VIP Early Access Spring 2026"
          />
          <TextField
            label="Description"
            value={formState.description}
            onChange={(value) => onFieldChange("description", value)}
            autoComplete="off"
            multiline={3}
            placeholder="Optional description for internal reference"
          />
        </BlockStack>
      </Card>

      {/* Products */}
      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h2">
            Products
          </Text>
          <Text as="p" tone="subdued">
            Select products and collections to include in this campaign.
          </Text>
          <InlineStack gap="300">
            <Button onClick={handleSelectProducts}>
              {config.productIds.length > 0
                ? `${config.productIds.length} product${config.productIds.length !== 1 ? "s" : ""} selected`
                : "Select products"}
            </Button>
            <Button onClick={handleSelectCollections}>
              {config.collectionIds.length > 0
                ? `${config.collectionIds.length} collection${config.collectionIds.length !== 1 ? "s" : ""} selected`
                : "Select collections"}
            </Button>
          </InlineStack>
          {(config.productIds.length > 0 ||
            config.collectionIds.length > 0) && (
            <InlineStack gap="200">
              {config.productIds.length > 0 && (
                <Badge>
                  {`${config.productIds.length} product${config.productIds.length !== 1 ? "s" : ""}`}
                </Badge>
              )}
              {config.collectionIds.length > 0 && (
                <Badge>
                  {`${config.collectionIds.length} collection${config.collectionIds.length !== 1 ? "s" : ""}`}
                </Badge>
              )}
            </InlineStack>
          )}
        </BlockStack>
      </Card>

      {/* Conditions */}
      <ConditionBuilder
        value={formState.conditions}
        onChange={handleConditionsChange}
      />

      {/* Schedule */}
      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h2">
            Schedule
          </Text>
          <InlineStack gap="400">
            <Box minWidth="200px">
              <TextField
                label="Start date"
                type="date"
                value={formState.startsAt}
                onChange={(value) => onFieldChange("startsAt", value)}
                autoComplete="off"
              />
            </Box>
            <Box minWidth="200px">
              <TextField
                label="End date"
                type="date"
                value={formState.endsAt}
                onChange={(value) => onFieldChange("endsAt", value)}
                autoComplete="off"
              />
            </Box>
          </InlineStack>
        </BlockStack>
      </Card>

      {/* Status & Priority */}
      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h2">
            Status & Priority
          </Text>
          <InlineStack gap="400">
            <Box minWidth="200px">
              <Select
                label="Status"
                options={STATUS_OPTIONS}
                value={formState.status}
                onChange={(value) =>
                  onFieldChange("status", value as CampaignStatus)
                }
              />
            </Box>
            <Box minWidth="200px">
              <TextField
                label="Priority"
                type="number"
                value={String(formState.priority)}
                onChange={(value) =>
                  onFieldChange(
                    "priority",
                    value === "" ? 0 : Number(value),
                  )
                }
                autoComplete="off"
                helpText="Higher priority campaigns take precedence"
              />
            </Box>
          </InlineStack>
        </BlockStack>
      </Card>
    </BlockStack>
  );
}
