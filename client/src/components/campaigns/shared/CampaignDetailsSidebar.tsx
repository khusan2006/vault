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
import { ChevronDownIcon, ChevronUpIcon } from "@shopify/polaris-icons";
import type { Campaign } from "@/types";
import type { CampaignFormState } from "@/hooks/useCampaignForm";

const STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Archived", value: "archived" },
];

interface CampaignDetailsSidebarProps {
  formState: CampaignFormState;
  onFieldChange: <K extends keyof CampaignFormState>(
    field: K,
    value: CampaignFormState[K],
  ) => void;
  nameError?: string;
}

export function CampaignDetailsSidebar({
  formState,
  onFieldChange,
  nameError,
}: CampaignDetailsSidebarProps) {
  const [scheduleOpen, setScheduleOpen] = useState(
    Boolean(formState.startsAt || formState.endsAt),
  );

  return (
    <Card>
      <BlockStack gap="400">
        <Text variant="headingMd" as="h2">
          Campaign details
        </Text>
        <Divider />
        <TextField
          label="Campaign name"
          value={formState.name}
          onChange={(value) => onFieldChange("name", value)}
          autoComplete="off"
          placeholder="e.g., Spring VIP Campaign"
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
          options={STATUS_OPTIONS}
          value={formState.status}
          onChange={(value) =>
            onFieldChange("status", value as Campaign["status"])
          }
        />

        <InlineStack align="space-between" blockAlign="center">
          <Text variant="headingSm" as="h3">
            Schedule (optional)
          </Text>
          <Button
            variant="plain"
            icon={scheduleOpen ? ChevronUpIcon : ChevronDownIcon}
            onClick={() => setScheduleOpen(!scheduleOpen)}
            accessibilityLabel={
              scheduleOpen ? "Collapse schedule" : "Expand schedule"
            }
          />
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
