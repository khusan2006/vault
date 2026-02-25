"use client";

import { Suspense } from "react";
import {
  Layout,
  Card,
  SkeletonPage,
  SkeletonBodyText,
  SkeletonDisplayText,
  BlockStack,
} from "@shopify/polaris";
import { CampaignCreationWizard } from "@/features/campaigns/components/wizard";

export default function NewCampaignPage() {
  return (
    <Suspense
      fallback={
        <SkeletonPage title="Create campaign" backAction>
          <Layout>
            <Layout.Section>
              <BlockStack gap="400">
                <Card>
                  <BlockStack gap="200">
                    <SkeletonDisplayText size="small" />
                    <SkeletonBodyText lines={2} />
                  </BlockStack>
                </Card>
                <div className="grid grid-cols-1 gap-[var(--p-space-400)] md:grid-cols-3">
                  {[0, 1, 2].map((index) => (
                    <Card key={index}>
                      <BlockStack gap="200">
                        <div className="h-[110px] rounded-[var(--p-border-radius-200)] bg-[var(--p-color-bg-surface-secondary)]" />
                        <SkeletonDisplayText size="small" />
                        <SkeletonBodyText lines={2} />
                      </BlockStack>
                    </Card>
                  ))}
                </div>
              </BlockStack>
            </Layout.Section>
          </Layout>
        </SkeletonPage>
      }
    >
      <CampaignCreationWizard />
    </Suspense>
  );
}
