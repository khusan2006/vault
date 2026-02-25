"use client";

import { useCallback, useState } from "react";
import {
  Page,
  Layout,
  Card,
  IndexTable,
  Text,
  useIndexResourceState,
  EmptyState,
  Button,
  Banner,
  Tabs,
  TextField,
  Modal,
  BlockStack,
  InlineStack,
  Icon,
  Box,
  SkeletonBodyText,
  SkeletonDisplayText,
  Badge,
} from "@shopify/polaris";
import { PlusIcon, SearchIcon } from "@shopify/polaris-icons";
import type { Campaign } from "@/types";
import { useToast } from "@/shared/hooks/useToast";
import { useIdTokenNavigation } from "@/shared/hooks/useIdTokenNavigation";
import {
  CAMPAIGN_TAB_IDS,
  useCampaignsList,
} from "@/features/campaigns/hooks/useCampaignsList";
import { StatusBadge } from "@/shared/components";
import {
  formatDate,
  summarizeBenefits,
  CAMPAIGN_TYPE_LABELS,
} from "@/utils";

const SKELETON_ROWS = Array.from({ length: 6 }, (_, index) => index);

// =============================================================================
// Props
// =============================================================================

interface CampaignsListProps {
  initialCampaigns: Campaign[] | null;
}

// =============================================================================
// Main component
// =============================================================================

export function CampaignsList({ initialCampaigns }: CampaignsListProps) {
  const { push } = useIdTokenNavigation();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { show: showToast } = useToast();

  const {
    allCampaigns,
    filteredCampaigns,
    loading,
    error,
    searchQuery,
    selectedTab,
    tabCounts,
    setError,
    setSearchQuery,
    setSelectedTab,
    deleteCampaigns,
  } = useCampaignsList(initialCampaigns);

  const resourceName = { singular: "campaign", plural: "campaigns" };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState<Campaign>(filteredCampaigns);

  // --- Handlers ---

  const handleBulkDelete = useCallback(async () => {
    if (selectedResources.length === 0) return;

    try {
      const count = selectedResources.length;
      await deleteCampaigns(selectedResources);
      setDeleteModalOpen(false);
      showToast(`Deleted ${count} campaign${count > 1 ? "s" : ""}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete campaigns",
      );
      setDeleteModalOpen(false);
    }
  }, [selectedResources, deleteCampaigns, showToast, setError]);

  // --- Tab config ---

  const tabs = CAMPAIGN_TAB_IDS.map((id) => ({
    id,
    content: `${id.charAt(0).toUpperCase() + id.slice(1)}${tabCounts[id] > 0 ? ` (${tabCounts[id]})` : ""}`,
    accessibilityLabel: `${id} campaigns`,
    panelID: `${id}-panel`,
  }));

  const promotedBulkActions = [
    {
      content: "Delete",
      onAction: () => setDeleteModalOpen(true),
    },
  ];

  // --- Empty state ---

  const emptyStateMarkup =
    allCampaigns.length === 0 ? (
      <EmptyState
        heading="Create your first campaign"
        action={{
          content: "Create campaign",
          onAction: () => push("/campaigns/new"),
        }}
        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
      >
        <p>
          Define rules to grant customers exclusive access to products,
          discounts, or free items.
        </p>
      </EmptyState>
    ) : (
      <Box padding="400">
        <BlockStack gap="200" inlineAlign="center">
          <Text as="p" tone="subdued" alignment="center">
            No campaigns found matching your filters.
          </Text>
          <Button
            variant="plain"
            onClick={() => {
              setSearchQuery("");
              setSelectedTab(0);
            }}
          >
            Clear filters
          </Button>
        </BlockStack>
      </Box>
    );

  // --- Row markup ---

  const rowMarkup = filteredCampaigns.map((campaign, index) => (
    <IndexTable.Row
      id={campaign.id}
      key={campaign.id}
      selected={selectedResources.includes(campaign.id)}
      position={index}
      onClick={() => push(`/campaigns/${campaign.id}`)}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="semibold" as="span">
          {campaign.name}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        {campaign.type && (
          <Badge
            tone={
              campaign.type === "early_access"
                ? "info"
                : campaign.type === "discounted_product"
                  ? "success"
                  : "attention"
            }
          >
            {CAMPAIGN_TYPE_LABELS[campaign.type]}
          </Badge>
        )}
      </IndexTable.Cell>
      <IndexTable.Cell>
        <StatusBadge status={campaign.status} />
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" tone="subdued" variant="bodySm">
          {summarizeBenefits(campaign)}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" tone="subdued" variant="bodySm">
          {formatDate(campaign.createdAt)}
        </Text>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  // --- Render ---

  return (
    <>
      <Page
        title="Campaigns"
        primaryAction={
          <Button
            variant="primary"
            icon={PlusIcon}
            onClick={() => push("/campaigns/new")}
          >
            Create campaign
          </Button>
        }
      >
        <Layout>
          {error && (
            <Layout.Section>
              <Banner tone="critical" onDismiss={() => setError(null)}>
                {error}
              </Banner>
            </Layout.Section>
          )}

          <Layout.Section>
            <Card padding="0">
              {loading ? (
                <Box padding="400">
                  <BlockStack gap="300">
                    <SkeletonDisplayText size="small" />
                    <InlineStack gap="200" wrap>
                      {CAMPAIGN_TAB_IDS.map((id) => (
                        <div
                          key={id}
                          className="min-w-[72px] rounded-[var(--p-border-radius-200)] bg-[var(--p-color-bg-surface-secondary)] p-[var(--p-space-100)]"
                        >
                          <SkeletonBodyText lines={1} />
                        </div>
                      ))}
                    </InlineStack>
                    <Box paddingBlockEnd="200">
                      <SkeletonBodyText lines={1} />
                    </Box>
                    <BlockStack gap="200">
                      {SKELETON_ROWS.map((row) => (
                        <Box
                          key={row}
                          padding="300"
                          borderRadius="200"
                          background="bg-surface"
                          borderWidth="025"
                          borderColor="border"
                        >
                          <SkeletonBodyText lines={2} />
                        </Box>
                      ))}
                    </BlockStack>
                  </BlockStack>
                </Box>
              ) : allCampaigns.length === 0 ? (
                emptyStateMarkup
              ) : (
                <>
                  <Tabs
                    tabs={tabs}
                    selected={selectedTab}
                    onSelect={setSelectedTab}
                  />

                  <Box padding="300" paddingBlockEnd="0">
                    <TextField
                      label="Search campaigns"
                      labelHidden
                      placeholder="Search campaigns..."
                      value={searchQuery}
                      onChange={setSearchQuery}
                      autoComplete="off"
                      prefix={<Icon source={SearchIcon} />}
                      clearButton
                      onClearButtonClick={() => setSearchQuery("")}
                    />
                  </Box>

                  {filteredCampaigns.length === 0 ? (
                    emptyStateMarkup
                  ) : (
                    <IndexTable
                      resourceName={resourceName}
                      itemCount={filteredCampaigns.length}
                      selectedItemsCount={
                        allResourcesSelected
                          ? "All"
                          : selectedResources.length
                      }
                      onSelectionChange={handleSelectionChange}
                      headings={[
                        { title: "Name" },
                        { title: "Type" },
                        { title: "Status" },
                        { title: "Details" },
                        { title: "Created" },
                      ]}
                      promotedBulkActions={promotedBulkActions}
                    >
                      {rowMarkup}
                    </IndexTable>
                  )}
                </>
              )}
            </Card>
          </Layout.Section>
        </Layout>
      </Page>

      {/* Delete confirmation modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete campaigns?"
        primaryAction={{
          content: `Delete ${selectedResources.length} campaign${selectedResources.length > 1 ? "s" : ""}`,
          destructive: true,
          onAction: handleBulkDelete,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setDeleteModalOpen(false),
          },
        ]}
      >
        <Modal.Section>
          <Text as="p">
            Are you sure you want to delete {selectedResources.length}{" "}
            campaign
            {selectedResources.length > 1 ? "s" : ""}? This action cannot be
            undone.
          </Text>
        </Modal.Section>
      </Modal>
    </>
  );
}
