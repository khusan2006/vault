"use client";

import { Page, Layout, Card, Text, BlockStack } from "@shopify/polaris";

interface HomePageProps {
  shop?: string;
  error?: string;
}

export function HomePage({ shop, error }: HomePageProps) {
  return (
    <Page title="The Vault">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="200">
              {error && (
                <Text as="p" tone="critical">
                  {error}
                </Text>
              )}
              {shop && (
                <Text as="p" variant="headingLg">
                  Hello World! Connected to {shop}
                </Text>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
