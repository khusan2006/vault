"use client";

import { useCallback, useMemo } from "react";
import { useIdTokenNavigation } from "@/shared/hooks/useIdTokenNavigation";
import {
  Page,
  Layout,
  Card,
  Box,
  Spinner,
  InlineStack,
} from "@shopify/polaris";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import type { Campaign, SetupStatus } from "@/types";
import {
  SetupGuide,
  ThemeEmbedCard,
  FeatureCards,
  RecentCampaigns,
  ResourcesSection,
  OverviewSection,
  buildSetupTasks,
} from "@/features/dashboard/components";

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

  const tasks = useMemo(
    () => buildSetupTasks(setupStatus, refreshEmbedStatus),
    [setupStatus, refreshEmbedStatus],
  );
  const { showGuide, pageTitle, pageSubtitle } = useMemo(() => {
    const completedTasks = tasks.filter((t) => t.completed).length;
    const allTasksCompleted =
      completedTasks === tasks.length && tasks.length > 0;

    return {
      showGuide: !allTasksCompleted && !guideDismissed,
      pageTitle: storeName ? `Hi, ${storeName}!` : "Home",
      pageSubtitle: storeName ? "Welcome to The Vault" : undefined,
    };
  }, [tasks, guideDismissed, storeName]);

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
