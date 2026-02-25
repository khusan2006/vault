"use client";

import { useState } from "react";
import {
  Card,
  BlockStack,
  Text,
  TextField,
  Select,
  InlineStack,
  Button,
  Collapsible,
  Divider,
} from "@shopify/polaris";
import type { CampaignStatus } from "@/types";
import type { CampaignFormState } from "@/features/campaigns/hooks/useCampaignForm";
import { CAMPAIGN_STATUS_REVIEW_OPTIONS } from "@/constants";

interface ReviewSaveCardProps {
  formState: CampaignFormState;
  onFieldChange: <K extends keyof CampaignFormState>(
    field: K,
    value: CampaignFormState[K],
  ) => void;
  nameError?: string;
  namePlaceholder?: string;
  statusOptions?: { label: string; value: CampaignStatus }[];
}

export function ReviewSaveCard({
  formState,
  onFieldChange,
  nameError,
  namePlaceholder,
  statusOptions = CAMPAIGN_STATUS_REVIEW_OPTIONS,
}: ReviewSaveCardProps) {
  const [scheduleOpen, setScheduleOpen] = useState(
    Boolean(formState.startsAt || formState.endsAt),
  );

  return (
    <Card>
      <BlockStack gap="400">
        <BlockStack gap="100">
          <Text variant="headingMd" as="h2">
            Review & launch
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            Name your campaign, choose when it should run, and save.
          </Text>
        </BlockStack>

        <Divider />

        <TextField
          label="Campaign name"
          value={formState.name}
          onChange={(value) => onFieldChange("name", value)}
          autoComplete="off"
          placeholder={namePlaceholder}
          error={nameError}
          helpText="This name is only visible to you and your team."
        />
        <TextField
          label="Description (optional)"
          value={formState.description}
          onChange={(value) => onFieldChange("description", value)}
          autoComplete="off"
          multiline={2}
          placeholder="Internal note about this campaign's purpose"
        />

        <Select
          label="Status"
          options={statusOptions}
          value={formState.status}
          onChange={(value) =>
            onFieldChange("status", value as CampaignStatus)
          }
        />

        <InlineStack align="space-between" blockAlign="center">
          <Text variant="headingSm" as="h3">
            Schedule (optional)
          </Text>
          <Button
            variant="plain"
            onClick={() => setScheduleOpen(!scheduleOpen)}
          >
            {scheduleOpen ? "Hide schedule" : "Add schedule"}
          </Button>
        </InlineStack>

        <Collapsible open={scheduleOpen} id="schedule-section">
          <BlockStack gap="300">
            <div
              className="grid grid-cols-1 gap-[var(--p-space-400)] md:grid-cols-2"
            >
              <TextField
                label="Start date"
                type="date"
                value={formState.startsAt}
                onChange={(value) => onFieldChange("startsAt", value)}
                autoComplete="off"
                helpText="Leave empty to start immediately"
              />
              <TextField
                label="End date"
                type="date"
                value={formState.endsAt}
                onChange={(value) => onFieldChange("endsAt", value)}
                autoComplete="off"
                helpText="Leave empty to run indefinitely"
              />
            </div>
          </BlockStack>
        </Collapsible>
      </BlockStack>
    </Card>
  );
}
