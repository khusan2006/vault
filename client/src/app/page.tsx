"use client";

import { useRouter } from "next/navigation";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Icon,
  Box,
} from "@shopify/polaris";
import { TargetIcon, PlusIcon } from "@shopify/polaris-icons";

export default function HomePage() {
  const router = useRouter();

  return (
    <Page title="Welcome to The Vault">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Create Customer Campaigns
              </Text>
              <Text as="p" tone="subdued">
                Define rules to grant your customers exclusive access to products,
                special discounts, or free items based on their tags, purchase
                history, or loyalty.
              </Text>
              <InlineStack gap="300">
                <Button
                  variant="primary"
                  icon={PlusIcon}
                  onClick={() => router.push("/campaigns/new")}
                >
                  Create Campaign
                </Button>
                <Button onClick={() => router.push("/campaigns")}>
                  View All Campaigns
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <InlineStack align="start" gap="200">
                <Box>
                  <Icon source={TargetIcon} tone="base" />
                </Box>
                <Text variant="headingMd" as="h3">
                  Quick Stats
                </Text>
              </InlineStack>
              <BlockStack gap="200">
                <InlineStack align="space-between">
                  <Text as="span" tone="subdued">
                    Active Campaigns
                  </Text>
                  <Text as="span" fontWeight="semibold">
                    0
                  </Text>
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span" tone="subdued">
                    Customers Benefiting
                  </Text>
                  <Text as="span" fontWeight="semibold">
                    0
                  </Text>
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span" tone="subdued">
                    Claims This Month
                  </Text>
                  <Text as="span" fontWeight="semibold">
                    0
                  </Text>
                </InlineStack>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h3">
                Getting Started
              </Text>
              <BlockStack gap="200">
                <Text as="p" tone="subdued">
                  1. Create your first campaign
                </Text>
                <Text as="p" tone="subdued">
                  2. Define who qualifies (conditions)
                </Text>
                <Text as="p" tone="subdued">
                  3. Set what they get (benefits)
                </Text>
                <Text as="p" tone="subdued">
                  4. Activate and watch it work
                </Text>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
