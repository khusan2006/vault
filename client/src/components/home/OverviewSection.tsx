"use client";

import { Card, BlockStack, Text, InlineStack } from "@shopify/polaris";
import type { CampaignStats } from "@/utils/compute-campaign-stats";
import { StatBox } from "./StatBox";

interface OverviewSectionProps {
  stats: CampaignStats;
}

export function OverviewSection({ stats }: OverviewSectionProps) {
  return (
    <Card>
      <BlockStack gap="400">
        <BlockStack gap="100">
          <Text variant="headingMd" as="h2">
            Overview
          </Text>
          <Text as="p" tone="subdued">
            A quick snapshot of your campaign activity.
          </Text>
        </BlockStack>
        <InlineStack gap="400" wrap>
          <StatBox
            label="Active campaigns"
            value={stats.activeCampaigns}
            subtitle="Live now"
          />
          <StatBox
            label="Draft campaigns"
            value={stats.draftCampaigns}
            subtitle="Needs review"
          />
          <StatBox
            label="Total campaigns"
            value={stats.totalCampaigns}
            subtitle="All time"
          />
        </InlineStack>
      </BlockStack>
    </Card>
  );
}
