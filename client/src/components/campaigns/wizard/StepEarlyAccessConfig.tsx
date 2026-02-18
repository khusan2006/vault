"use client";

import {
  Card,
  BlockStack,
  Text,
  Banner,
  Divider,
  InlineStack,
} from "@shopify/polaris";
import type { EarlyAccessConfig } from "@/types";
import type { CampaignFormState } from "@/hooks/useCampaignForm";

interface StepEarlyAccessConfigProps {
  formState: CampaignFormState;
  onFieldChange: <K extends keyof CampaignFormState>(
    field: K,
    value: CampaignFormState[K],
  ) => void;
}

export function StepEarlyAccessConfig({
  formState,
}: StepEarlyAccessConfigProps) {
  const config = formState.config as EarlyAccessConfig;

  const productCount = config.productIds.length;
  const collectionCount = config.collectionIds.length;
  const hasSelection = productCount > 0 || collectionCount > 0;

  return (
    <Card>
      <BlockStack gap="400">
        <BlockStack gap="100">
          <Text variant="headingMd" as="h2">
            Early Access Configuration
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            Early access campaigns control product visibility. No additional
            configuration is needed beyond selecting products.
          </Text>
        </BlockStack>

        <Divider />

        <Banner tone="info">
          Products selected in the previous step will be hidden from
          non-qualifying customers.
        </Banner>

        {hasSelection ? (
          <InlineStack gap="200">
            <Text as="p" variant="bodyMd">
              {productCount > 0 &&
                `${productCount} product${productCount !== 1 ? "s" : ""}`}
              {productCount > 0 && collectionCount > 0 && ", "}
              {collectionCount > 0 &&
                `${collectionCount} collection${collectionCount !== 1 ? "s" : ""}`}
              {" "}selected
            </Text>
          </InlineStack>
        ) : (
          <Banner tone="warning">
            No products or collections have been selected. All products will be
            treated as exclusive and hidden from non-qualifying customers.
          </Banner>
        )}
      </BlockStack>
    </Card>
  );
}
