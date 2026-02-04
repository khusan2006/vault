"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Select,
  Button,
  Banner,
  BlockStack,
  Text,
  InlineStack,
} from "@shopify/polaris";
import type { CampaignStatus, ConditionGroup, Benefit } from "@/types";
import { campaignsApi } from "@/lib/api";

const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
];

const defaultConditions: ConditionGroup = {
  operator: "AND",
  conditions: [],
};

export default function NewCampaignPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<CampaignStatus>("draft");
  const [conditions] = useState<ConditionGroup>(defaultConditions);
  const [benefits] = useState<Benefit[]>([]);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      setError("Campaign name is required");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await campaignsApi.create({
        name: name.trim(),
        description: description.trim() || undefined,
        status,
        conditions,
        benefits,
      });

      router.push("/campaigns");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create campaign");
    } finally {
      setSaving(false);
    }
  }, [name, description, status, conditions, benefits, router]);

  return (
    <Page
      title="Create Campaign"
      backAction={{ content: "Campaigns", onAction: () => router.push("/campaigns") }}
      primaryAction={{
        content: "Save",
        onAction: handleSave,
        loading: saving,
      }}
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
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Campaign Details
              </Text>
              <FormLayout>
                <TextField
                  label="Campaign name"
                  value={name}
                  onChange={setName}
                  autoComplete="off"
                  placeholder="e.g., VIP Customer Rewards"
                />
                <TextField
                  label="Description"
                  value={description}
                  onChange={setDescription}
                  autoComplete="off"
                  multiline={3}
                  placeholder="Describe what this campaign does..."
                />
                <Select
                  label="Status"
                  options={statusOptions}
                  value={status}
                  onChange={(value) => setStatus(value as CampaignStatus)}
                />
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text variant="headingMd" as="h2">
                  Conditions
                </Text>
                <Button size="slim">Add Condition</Button>
              </InlineStack>
              <Text as="p" tone="subdued">
                Define who qualifies for this campaign. Customers must meet these
                conditions to receive the benefits.
              </Text>
              <Banner tone="info">
                Condition builder coming soon. For now, campaigns will match all
                customers.
              </Banner>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text variant="headingMd" as="h2">
                  Benefits
                </Text>
                <Button size="slim">Add Benefit</Button>
              </InlineStack>
              <Text as="p" tone="subdued">
                Define what qualifying customers receive. You can add multiple
                benefits to a single campaign.
              </Text>
              <Banner tone="info">
                Benefit selector coming soon. Configure product visibility,
                discounts, or free products.
              </Banner>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
