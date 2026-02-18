"use client";

import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Button,
} from "@shopify/polaris";

export default function SettingsPage() {
  return (
    <Page title="Settings">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="200">
              <Text variant="headingMd" as="h2">
                Settings are now managed per campaign
              </Text>
              <Text as="p" tone="subdued">
                This space will be used for global settings in a future update.
              </Text>
              <Button variant="primary" disabled>
                Coming soon
              </Button>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
