"use client";

import { useState } from "react";
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  TextField,
  Select,
  Banner,
  Badge,
  Divider,
  Box,
  Button,
  Collapsible,
  Icon,
} from "@shopify/polaris";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ProductIcon,
  PersonIcon,
  HomeIcon,
  LayoutPopupIcon,
  LockIcon,
} from "@shopify/polaris-icons";
import type {
  CampaignStatus,
  Condition,
  ConditionGroup,
  EarlyAccessConfig,
  EarlyAccessStorefrontApproach,
  ComparisonOperator,
} from "@/types";
import type { CampaignFormState } from "@/hooks/useCampaignForm";
import type { SelectedResource } from "@/hooks/useResourcePicker";

// =============================================================================
// Constants
// =============================================================================

const STATUS_OPTIONS = [
  { label: "Draft — save now, activate later", value: "draft" },
  { label: "Active — go live immediately", value: "active" },
];

const APPROACH_META: Record<
  EarlyAccessStorefrontApproach,
  { label: string; icon: typeof HomeIcon; description: string }
> = {
  customer_page: {
    label: "Customer account page",
    icon: PersonIcon,
    description: "Exclusive products appear in each customer's account area",
  },
  storefront_section: {
    label: "Home & product pages",
    icon: HomeIcon,
    description: "A banner or section highlights exclusive products on your storefront",
  },
  modal: {
    label: "Pop-up modal",
    icon: LayoutPopupIcon,
    description: "A popup invites qualifying customers to browse exclusive products",
  },
};

const OPERATOR_LABELS: Record<ComparisonOperator, string> = {
  equals: "is",
  not_equals: "is not",
  contains: "contains",
  not_contains: "doesn't contain",
  greater_than: "over",
  less_than: "under",
  greater_than_or_equal: "at least",
  less_than_or_equal: "at most",
};

// =============================================================================
// Types
// =============================================================================

interface ReviewSaveStepProps {
  formState: CampaignFormState;
  onFieldChange: <K extends keyof CampaignFormState>(
    field: K,
    value: CampaignFormState[K],
  ) => void;
  nameError?: string;
  selectedProducts: SelectedResource[];
  selectedCollections: SelectedResource[];
}

// =============================================================================
// Helpers
// =============================================================================

function getFilledConditions(group: ConditionGroup): Condition[] {
  return group.conditions.filter(
    (item): item is Condition =>
      "type" in item &&
      !("conditions" in item) &&
      String(item.value).trim() !== "",
  );
}

function describeCondition(c: Condition): string {
  const op = OPERATOR_LABELS[c.operator] ?? c.operator;

  switch (c.type) {
    case "customer_tag":
      return `tagged "${c.value}"`;
    case "total_spent":
      return `who spent ${op} $${c.value}`;
    case "order_count":
      return `with ${op} ${c.value} order${Number(c.value) !== 1 ? "s" : ""}`;
    case "account_age_days":
      return `with accounts ${op} ${c.value} day${Number(c.value) !== 1 ? "s" : ""} old`;
    default:
      return `${c.type} ${op} ${c.value}`;
  }
}

function formatConditionsNarrative(group: ConditionGroup): string {
  const filled = getFilledConditions(group);
  if (filled.length === 0) return "";

  const connector = group.operator === "AND" ? " and " : " or ";
  const descriptions = filled.map(describeCondition);

  if (descriptions.length === 1) return descriptions[0];
  if (descriptions.length === 2)
    return descriptions.join(connector);

  const last = descriptions.pop();
  return `${descriptions.join(", ")}${connector}${last}`;
}

// =============================================================================
// Summary line component
// =============================================================================

function SummaryLine({
  icon,
  iconBgClassName,
  children,
}: {
  icon: typeof ProductIcon;
  iconBgClassName: string;
  children: React.ReactNode;
}) {
  return (
    <InlineStack gap="300" blockAlign="start" wrap={false}>
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--p-border-radius-200)] ${iconBgClassName}`}
      >
        <Icon source={icon} />
      </div>
      <Box paddingBlockStart="100">
        <Text as="p" variant="bodyMd">
          {children}
        </Text>
      </Box>
    </InlineStack>
  );
}

// =============================================================================
// Component
// =============================================================================

export function ReviewSaveStep({
  formState,
  onFieldChange,
  nameError,
  selectedProducts,
  selectedCollections,
}: ReviewSaveStepProps) {
  const config = formState.config as EarlyAccessConfig;
  const [scheduleOpen, setScheduleOpen] = useState(
    Boolean(formState.startsAt || formState.endsAt),
  );

  const productCount = config.productIds.length;
  const collectionCount = config.collectionIds.length;
  const hasProducts = productCount > 0 || collectionCount > 0;
  const filledConditions = getFilledConditions(formState.conditions);
  const hasConditions = filledConditions.length > 0;
  const approach = config.storefrontApproach;
  const approachMeta = approach ? APPROACH_META[approach] : null;

  // Build product names for the summary
  const productNames = selectedProducts.map((p) => p.title);
  const collectionNames = selectedCollections.map((c) => c.title);

  function buildProductsSummary(): React.ReactNode {
    if (!hasProducts) {
      return (
        <>
          <Text as="span" fontWeight="semibold">
            All products
          </Text>{" "}
          in your store will be treated as exclusive
        </>
      );
    }

    const items: string[] = [];

    if (productNames.length > 0) {
      if (productNames.length <= 2) {
        items.push(...productNames);
      } else {
        items.push(
          productNames[0],
          productNames[1],
          `${productNames.length - 2} more product${productNames.length - 2 !== 1 ? "s" : ""}`,
        );
      }
    }

    if (collectionNames.length > 0) {
      if (collectionNames.length <= 2) {
        items.push(
          ...collectionNames.map((n) => `the "${n}" collection`),
        );
      } else {
        items.push(
          `${collectionNames.length} collection${collectionNames.length !== 1 ? "s" : ""}`,
        );
      }
    }

    return (
      <>
        <Text as="span" fontWeight="semibold">
          {items.join(", ")}
        </Text>{" "}
        will be hidden from non-qualifying customers
      </>
    );
  }

  function buildAudienceSummary(): React.ReactNode {
    if (!hasConditions) {
      return (
        <>
          <Text as="span" fontWeight="semibold">
            All logged-in customers
          </Text>{" "}
          will qualify for early access
        </>
      );
    }

    const narrative = formatConditionsNarrative(formState.conditions);
    return (
      <>
        Only customers{" "}
        <Text as="span" fontWeight="semibold">
          {narrative}
        </Text>{" "}
        will see the exclusive products
      </>
    );
  }

  return (
    <BlockStack gap="500">
      {/* Header */}
      <BlockStack gap="200">
        <Text variant="headingLg" as="h2">
          Name and launch your campaign
        </Text>
        <Text as="p" tone="subdued">
          Give your campaign a name, choose when to go live, and review
          everything before saving.
        </Text>
      </BlockStack>

      {/* Name and description */}
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
            placeholder="e.g., VIP Early Access — Spring 2026"
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
        </BlockStack>
      </Card>

      {/* Status and schedule */}
      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h2">
            Launch settings
          </Text>
          <Divider />

          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={formState.status}
            onChange={(value) =>
              onFieldChange("status", value as CampaignStatus)
            }
          />

          {formState.status === "active" && (
            <Banner tone="warning">
              This campaign will go live as soon as you save. Make sure
              everything looks right.
            </Banner>
          )}

          {/* Schedule toggle */}
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

          {!scheduleOpen && (formState.startsAt || formState.endsAt) && (
            <Text as="p" variant="bodySm" tone="subdued">
              {formState.startsAt ? `Starts ${formState.startsAt}` : ""}
              {formState.startsAt && formState.endsAt ? " · " : ""}
              {formState.endsAt ? `Ends ${formState.endsAt}` : ""}
            </Text>
          )}
        </BlockStack>
      </Card>

      {/* Visual campaign summary */}
      <Card>
        <BlockStack gap="400">
          <InlineStack gap="200" blockAlign="center">
            <Text variant="headingMd" as="h2">
              What this campaign will do
            </Text>
            <Badge tone="info">Early Access</Badge>
          </InlineStack>
          <Divider />

          <BlockStack gap="400">
            {/* Products line */}
            <SummaryLine
              icon={ProductIcon}
              iconBgClassName="bg-[var(--p-color-bg-fill-info)]"
            >
              {buildProductsSummary()}
            </SummaryLine>

            {/* Audience line */}
            <SummaryLine
              icon={LockIcon}
              iconBgClassName="bg-[var(--p-color-bg-fill-caution)]"
            >
              {buildAudienceSummary()}
            </SummaryLine>

            {/* Storefront line */}
            {approachMeta && (
              <SummaryLine
                icon={approachMeta.icon}
                iconBgClassName="bg-[var(--p-color-bg-fill-success)]"
              >
                <Text as="span" fontWeight="semibold">
                  {approachMeta.label}
                </Text>
                {" — "}
                {approachMeta.description.charAt(0).toLowerCase() +
                  approachMeta.description.slice(1)}
              </SummaryLine>
            )}
          </BlockStack>
        </BlockStack>
      </Card>
    </BlockStack>
  );
}
