"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Page,
  Layout,
  Card,
  IndexTable,
  Text,
  Badge,
  useIndexResourceState,
  EmptyState,
  Button,
  InlineStack,
  Spinner,
  Banner,
} from "@shopify/polaris";
import { PlusIcon } from "@shopify/polaris-icons";
import type { Campaign, CampaignStatus } from "@/types";
import { campaignsApi } from "@/lib/api";

function StatusBadge({ status }: { status: CampaignStatus }) {
  const toneMap: Record<CampaignStatus, "success" | "info" | "warning" | "new"> = {
    active: "success",
    draft: "info",
    paused: "warning",
    archived: "new",
  };

  return <Badge tone={toneMap[status]}>{status}</Badge>;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
}

function summarizeConditions(campaign: Campaign): string {
  const { conditions } = campaign;
  const count = conditions.conditions.length;
  if (count === 0) return "No conditions";
  if (count === 1) return "1 condition";
  return `${count} conditions (${conditions.operator})`;
}

function summarizeBenefits(campaign: Campaign): string {
  const { benefits } = campaign;
  if (benefits.length === 0) return "No benefits";

  const types = benefits.map((b) => {
    if (b.type === "visibility") return "Exclusive access";
    if (b.type === "discount") return "Discount";
    if (b.type === "free_product") return "Free product";
    return "Unknown";
  });

  return types.join(", ");
}

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resourceName = {
    singular: "campaign",
    plural: "campaigns",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(campaigns as unknown as { [key: string]: unknown }[]);

  const loadCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await campaignsApi.list();
      setCampaigns(response.campaigns);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const handleDelete = useCallback(async () => {
    if (selectedResources.length === 0) return;

    try {
      await Promise.all(selectedResources.map((id) => campaignsApi.delete(id)));
      loadCampaigns();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete campaigns");
    }
  }, [selectedResources, loadCampaigns]);

  const rowMarkup = campaigns.map((campaign, index) => (
    <IndexTable.Row
      id={campaign.id}
      key={campaign.id}
      selected={selectedResources.includes(campaign.id)}
      position={index}
      onClick={() => router.push(`/campaigns/${campaign.id}`)}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {campaign.name}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <StatusBadge status={campaign.status} />
      </IndexTable.Cell>
      <IndexTable.Cell>{summarizeConditions(campaign)}</IndexTable.Cell>
      <IndexTable.Cell>{summarizeBenefits(campaign)}</IndexTable.Cell>
      <IndexTable.Cell>{formatDate(campaign.createdAt)}</IndexTable.Cell>
    </IndexTable.Row>
  ));

  const emptyStateMarkup = (
    <EmptyState
      heading="Create your first campaign"
      action={{
        content: "Create Campaign",
        onAction: () => router.push("/campaigns/new"),
      }}
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <p>
        Define rules to grant customers exclusive access to products, discounts,
        or free items.
      </p>
    </EmptyState>
  );

  const promotedBulkActions = [
    {
      content: "Delete",
      onAction: handleDelete,
    },
  ];

  return (
    <Page
      title="Campaigns"
      primaryAction={
        <Button
          variant="primary"
          icon={PlusIcon}
          onClick={() => router.push("/campaigns/new")}
        >
          Create Campaign
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
              <div style={{ padding: "2rem", textAlign: "center" }}>
                <Spinner accessibilityLabel="Loading campaigns" size="large" />
              </div>
            ) : campaigns.length === 0 ? (
              emptyStateMarkup
            ) : (
              <IndexTable
                resourceName={resourceName}
                itemCount={campaigns.length}
                selectedItemsCount={
                  allResourcesSelected ? "All" : selectedResources.length
                }
                onSelectionChange={handleSelectionChange}
                headings={[
                  { title: "Name" },
                  { title: "Status" },
                  { title: "Conditions" },
                  { title: "Benefits" },
                  { title: "Created" },
                ]}
                promotedBulkActions={promotedBulkActions}
              >
                {rowMarkup}
              </IndexTable>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
