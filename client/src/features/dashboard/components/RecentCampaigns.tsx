"use client";

import {
  Text,
  BlockStack,
  InlineStack,
  Button,
  Icon,
} from "@shopify/polaris";
import { PlusIcon, TargetIcon } from "@shopify/polaris-icons";
import { useIdTokenNavigation } from "@/shared/hooks/useIdTokenNavigation";
import {
  summarizeBenefits,
  summarizeAudience,
  getCampaignItemCount,
  getCampaignScheduleDisplay,
} from "@/utils";
import { StatusBadge } from "@/shared/components";
import { CampaignTypeBadge } from "./CampaignTypeBadge";
import type { Campaign } from "@/types";

interface RecentCampaignsProps {
  campaigns: Campaign[];
}

function CampaignMetaChips({
  audience,
  itemCount,
}: {
  audience: string;
  itemCount: number;
}) {
  return (
    <InlineStack gap="200" wrap>
      <div
        className="rounded-full bg-[var(--p-color-bg-surface-secondary)] px-[10px] py-1 text-xs text-[var(--p-color-text)]"
      >
        Audience: {audience}
      </div>
      <div
        className="rounded-full bg-[var(--p-color-bg-surface-secondary)] px-[10px] py-1 text-xs text-[var(--p-color-text)]"
      >
        Items: {itemCount}
      </div>
    </InlineStack>
  );
}

function RecentCampaignEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div
      className="flex flex-col items-center gap-[var(--p-space-300)] rounded-[var(--p-border-radius-300)] bg-[var(--p-color-bg-surface)] px-[var(--p-space-500)] py-[var(--p-space-800)] shadow-[var(--p-shadow-100)]"
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-[var(--p-border-radius-full)] bg-[var(--p-color-bg-surface-secondary)]"
      >
        <Icon source={TargetIcon} tone="base" />
      </div>
      <BlockStack gap="100" inlineAlign="center">
        <Text as="p" variant="bodyMd" fontWeight="semibold" alignment="center">
          No campaigns yet
        </Text>
        <Text as="p" tone="subdued" alignment="center">
          Create your first campaign to start rewarding customers.
        </Text>
      </BlockStack>
      <Button variant="primary" icon={PlusIcon} onClick={onCreate}>
        Create campaign
      </Button>
    </div>
  );
}

function RecentCampaignCard({
  campaign,
  onOpen,
}: {
  campaign: Campaign;
  onOpen: () => void;
}) {
  const itemCount = getCampaignItemCount(campaign);
  const audience = summarizeAudience(campaign);
  const schedule = getCampaignScheduleDisplay(campaign);

  return (
    <div
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View campaign ${campaign.name}`}
      className="flex min-h-[200px] cursor-pointer flex-col overflow-hidden rounded-[var(--p-border-radius-300)] border border-[var(--p-color-border)] bg-[var(--p-color-bg-surface)] shadow-[var(--p-shadow-100)] transition-[box-shadow,transform] duration-150 ease-out hover:-translate-y-[2px] hover:shadow-[var(--p-shadow-200)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-color-border-brand)]"
    >
      <div
        className="flex items-center justify-between gap-[var(--p-space-200)] border-b border-b-[var(--p-color-border)] bg-[var(--p-color-bg-surface-secondary)] px-[var(--p-space-400)] py-[var(--p-space-300)]"
      >
        <CampaignTypeBadge type={campaign.type} />
        <StatusBadge status={campaign.status} />
      </div>

      <div
        className="flex flex-1 flex-col gap-[var(--p-space-300)] p-[var(--p-space-400)]"
      >
        <BlockStack gap="100">
          <Text variant="bodyMd" fontWeight="semibold" as="span">
            {campaign.name}
          </Text>
          <Text as="span" variant="bodySm" tone="subdued">
            {summarizeBenefits(campaign)}
          </Text>
        </BlockStack>

        <CampaignMetaChips audience={audience} itemCount={itemCount} />

        <div
          className="mt-auto flex items-center justify-between gap-[var(--p-space-200)]"
        >
          <Text as="span" variant="bodySm" tone="subdued">
            {schedule.label}
          </Text>
          <Text as="span" variant="bodySm" fontWeight="medium">
            {schedule.value}
          </Text>
        </div>
      </div>
    </div>
  );
}

export function RecentCampaigns({ campaigns }: RecentCampaignsProps) {
  const { push } = useIdTokenNavigation();

  return (
    <BlockStack gap="400">
      {/* Section heading — outside the cards, matching FeatureCards & ResourcesSection */}
      <InlineStack align="space-between" blockAlign="center">
        <Text variant="headingMd" as="h2">
          Recent campaigns
        </Text>
        <InlineStack gap="200">
          <Button
            size="slim"
            icon={PlusIcon}
            variant="primary"
            onClick={() => push("/campaigns/new")}
          >
            New
          </Button>
          {campaigns.length > 0 && (
            <Button
              size="slim"
              icon={TargetIcon}
              onClick={() => push("/campaigns")}
            >
              View all
            </Button>
          )}
        </InlineStack>
      </InlineStack>

      {/* Campaign cards or empty state */}
      {campaigns.length === 0 ? (
        <RecentCampaignEmptyState
          onCreate={() => push("/campaigns/new")}
        />
      ) : (
        <div
          className="grid gap-[var(--p-space-400)] [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]"
        >
          {campaigns.map((campaign) => (
            <RecentCampaignCard
              key={campaign.id}
              campaign={campaign}
              onOpen={() => push(`/campaigns/${campaign.id}`)}
            />
          ))}
        </div>
      )}
    </BlockStack>
  );
}
