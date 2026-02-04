"use client";

import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Banner,
} from "@shopify/polaris";

export default function SettingsPage() {
  return (
    <Page title="Settings">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                App Settings
              </Text>
              <Banner tone="info">
                Settings page coming soon. Configure metafield namespaces,
                default behaviors, and notification preferences.
              </Banner>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
