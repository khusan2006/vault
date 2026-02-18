"use client";

import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Badge,
  List,
  Box,
} from "@shopify/polaris";

const CURRENT_PLAN_ID = "starter";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "$0",
    cadence: "month",
    description: "Best for getting started with a single campaign.",
    features: [
      "Up to 1 active campaign",
      "Basic storefront messaging",
      "Community support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: "$19",
    cadence: "month",
    description: "For growing stores that need more automation.",
    features: [
      "Up to 5 active campaigns",
      "Advanced display rules",
      "Priority email support",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    price: "$49",
    cadence: "month",
    description: "For high-volume stores with multiple teams.",
    features: [
      "Unlimited campaigns",
      "Team collaboration",
      "Dedicated success manager",
    ],
  },
];

export default function PricingPage() {
  return (
    <Page
      title="Pricing"
      subtitle="Manage your plan and billing inside the app"
    >
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <InlineStack align="space-between" blockAlign="center">
                <Text variant="headingMd" as="h2">
                  Current plan
                </Text>
                <Badge tone="info">Active</Badge>
              </InlineStack>
              <BlockStack gap="100">
                <Text variant="headingLg" as="p">
                  Starter
                </Text>
                <Text as="p" tone="subdued">
                  You are currently on the Starter plan.
                </Text>
              </BlockStack>
              <InlineStack gap="200">
                <Button disabled>Manage billing</Button>
                <Button variant="plain" disabled>
                  View invoices
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Available plans
              </Text>
              <div
                className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]"
              >
                {PLANS.map((plan) => {
                  const isCurrent = plan.id === CURRENT_PLAN_ID;
                  return (
                    <Box
                      key={plan.id}
                      padding="300"
                      background={
                        isCurrent
                          ? "bg-surface-secondary"
                          : "bg-surface"
                      }
                      borderRadius="200"
                      borderWidth="025"
                      borderColor="border"
                    >
                      <BlockStack gap="200">
                        <InlineStack align="space-between" blockAlign="center">
                          <Text variant="headingMd" as="h3">
                            {plan.name}
                          </Text>
                          {isCurrent && <Badge tone="success">Current</Badge>}
                        </InlineStack>
                        <InlineStack gap="100" blockAlign="end">
                          <Text variant="headingLg" as="span">
                            {plan.price}
                          </Text>
                          <Text as="span" tone="subdued">
                            /{plan.cadence}
                          </Text>
                        </InlineStack>
                        <Text as="p" tone="subdued">
                          {plan.description}
                        </Text>
                        <List type="bullet">
                          {plan.features.map((feature) => (
                            <List.Item key={feature}>{feature}</List.Item>
                          ))}
                        </List>
                        <Button
                          variant={isCurrent ? "secondary" : "primary"}
                          disabled
                        >
                          {isCurrent ? "Current plan" : "Choose plan"}
                        </Button>
                      </BlockStack>
                    </Box>
                  );
                })}
              </div>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text variant="headingMd" as="h2">
                Billing settings
              </Text>
              <Text as="p" tone="subdued">
                Billing changes will be available here in a future update.
              </Text>
              <InlineStack gap="200">
                <Button disabled>Update payment method</Button>
                <Button variant="plain" disabled>
                  Contact support
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
