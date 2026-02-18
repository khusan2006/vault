"use client";

import { useCallback } from "react";
import { useIdTokenNavigation } from "@/hooks/useIdTokenNavigation";
import {
  Page,
  Layout,
  Card,
  Box,
  Spinner,
  InlineStack,
} from "@shopify/polaris";
import { useDashboard } from "@/hooks/useDashboard";
import type { Campaign, SetupStatus } from "@/types";
import {
  SetupGuide,
  ThemeEmbedCard,
  FeatureCards,
  RecentCampaigns,
  ResourcesSection,
  buildSetupTasks,
} from "@/components/home";
import { OverviewSection } from "@/components/home/OverviewSection";

interface HomeContentProps {
  initialCampaigns: Campaign[] | null;
  initialSetupStatus: SetupStatus | null;
}

export function HomeContent({
  initialCampaigns,
  initialSetupStatus,
}: HomeContentProps) {
  const { push } = useIdTokenNavigation();

  const {
    loading,
    campaigns,
    stats,
    setupStatus,
    storeName,
    guideDismissed,
    refreshEmbedStatus,
    dismissGuide,
  } = useDashboard({ initialCampaigns, initialSetupStatus });

  const handleNavigate = useCallback(
    (url: string, external?: boolean) => {
      if (external) {
        window.open(url, "_blank");
      } else {
        push(url);
      }
    },
    [push],
  );

  const tasks = buildSetupTasks(setupStatus, refreshEmbedStatus);
  const completedTasks = tasks.filter((t) => t.completed).length;
  const allTasksCompleted =
    completedTasks === tasks.length && tasks.length > 0;
  const showGuide = !allTasksCompleted && !guideDismissed;

  const pageTitle = storeName ? `Hi, ${storeName}!` : "Home";
  const pageSubtitle = storeName ? "Welcome to The Vault" : undefined;

  if (loading) {
    return (
      <Page title={pageTitle} subtitle={pageSubtitle}>
        <Layout>
          <Layout.Section>
            <Card>
              <Box padding="800">
                <InlineStack align="center">
                  <Spinner
                    accessibilityLabel="Loading dashboard"
                    size="large"
                  />
                </InlineStack>
              </Box>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page title={pageTitle} subtitle={pageSubtitle}>
      <Layout>
        <Layout.Section>
          <ThemeEmbedCard isEnabled={setupStatus.themeEmbedEnabled} />
        </Layout.Section>

        <Layout.Section>
          <OverviewSection stats={stats} />
        </Layout.Section>

        <Layout.Section>
          <FeatureCards />
        </Layout.Section>

        {showGuide && (
          <Layout.Section>
            <SetupGuide
              tasks={tasks}
              onNavigate={handleNavigate}
              onDismiss={dismissGuide}
            />
          </Layout.Section>
        )}

        <Layout.Section>
          <RecentCampaigns campaigns={campaigns} />
        </Layout.Section>

        <Layout.Section>
          <ResourcesSection />
        </Layout.Section>

        <Layout.Section>
          <Box paddingBlockEnd="400" />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
