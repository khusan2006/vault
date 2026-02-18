"use client";

import { Suspense } from "react";
import {
  Layout,
  Card,
  SkeletonPage,
  SkeletonBodyText,
  BlockStack,
  SkeletonDisplayText,
} from "@shopify/polaris";
import { EarlyAccessWizard } from "@/components/campaigns/early-access-wizard";

export default function NewEarlyAccessCampaignPage() {
  return (
    <Suspense
      fallback={
        <SkeletonPage title="Create Early Access campaign" narrowWidth backAction>
          <Layout>
            <Layout.Section>
              <BlockStack gap="400">
                <Card>
                  <BlockStack gap="200">
                    <SkeletonDisplayText size="small" />
                    <SkeletonBodyText lines={1} />
                  </BlockStack>
                </Card>
                <Card>
                  <SkeletonBodyText lines={6} />
                </Card>
                <Card>
                  <SkeletonBodyText lines={3} />
                </Card>
              </BlockStack>
            </Layout.Section>
          </Layout>
        </SkeletonPage>
      }
    >
      <EarlyAccessWizard />
    </Suspense>
  );
}
