"use client";

import { useState } from "react";
import { Layout, BlockStack } from "@shopify/polaris";
import type { TimerSaleConfig } from "@/types";
import type { SelectedResource } from "@/features/campaigns/hooks/useResourcePicker";
import { useCampaignForm } from "@/features/campaigns/hooks/useCampaignForm";
import { ProductsStep } from "@/features/campaigns/components/early-access-wizard/ProductsStep";
import { AudienceStep } from "@/features/campaigns/components/early-access-wizard/AudienceStep";
import { StepTimerSaleConfig } from "@/features/campaigns/components/wizard/StepTimerSaleConfig";
import { TimerSaleDisplayStep } from "@/features/campaigns/components/timer-sale-wizard/TimerSaleDisplayStep";
import {
  CampaignDetailsSidebar,
  EditSectionsCard,
} from "@/features/campaigns/components/shared";
import { countFilledRules, formatSetBadge } from "./edit-flow-helpers";
import {
  buildEditFlowTabs,
  EDIT_FLOW_DESCRIPTIONS,
  EDIT_FLOW_TAB_LABELS,
} from "./edit-flow-tabs";

interface SelectionProps {
  selectedProducts: SelectedResource[];
  selectedCollections: SelectedResource[];
  onProductsChange: (products: SelectedResource[]) => void;
  onCollectionsChange: (collections: SelectedResource[]) => void;
}

interface TimerSaleEditFlowProps {
  formState: ReturnType<typeof useCampaignForm>["formState"];
  onFieldChange: <K extends keyof ReturnType<typeof useCampaignForm>["formState"]>(
    field: K,
    value: ReturnType<typeof useCampaignForm>["formState"][K],
  ) => void;
  nameError?: string;
  selectionProps: SelectionProps;
}

export function TimerSaleEditFlow({
  formState,
  onFieldChange,
  nameError,
  selectionProps,
}: TimerSaleEditFlowProps) {
  const config = formState.config as TimerSaleConfig;
  const [selectedTab, setSelectedTab] = useState(0);

  const productCount = config.productIds.length + config.collectionIds.length;
  const ruleCount = countFilledRules(formState.conditions);

  const tabs = buildEditFlowTabs({
    productCount,
    ruleCount,
    extra: [
      {
        id: "timer",
        content: EDIT_FLOW_TAB_LABELS.timer,
        badge: formatSetBadge(Boolean(config.timerDurationMinutes)),
      },
      {
        id: "display",
        content: EDIT_FLOW_TAB_LABELS.display,
        badge: formatSetBadge(Boolean(config.displayConfig), "Default"),
      },
    ],
  });

  return (
    <>
      <Layout.Section>
        <EditSectionsCard
          title="Edit sections"
          description={EDIT_FLOW_DESCRIPTIONS.timer_sale}
          tabs={tabs}
          selectedTab={selectedTab}
          onSelectTab={setSelectedTab}
        >
          {selectedTab === 0 && (
            <ProductsStep
              formState={formState}
              onFieldChange={onFieldChange}
              selectedProducts={selectionProps.selectedProducts}
              selectedCollections={selectionProps.selectedCollections}
              onProductsChange={selectionProps.onProductsChange}
              onCollectionsChange={selectionProps.onCollectionsChange}
              title="Choose products for this timer sale"
              description="Select the products or collections included in this timed offer."
              productsDescription="Select individual products to include"
              collectionsDescription="Select collections to include"
            />
          )}

          {selectedTab === 1 && (
            <AudienceStep
              formState={formState}
              onFieldChange={onFieldChange}
              title="Who should see this timer sale?"
              description="Define which customers are eligible for this timed offer."
              tipText="If you don't add any rules, all logged-in customers will qualify."
            />
          )}

          {selectedTab === 2 && (
            <BlockStack gap="400">
              <StepTimerSaleConfig
                formState={formState}
                onFieldChange={onFieldChange}
              />
            </BlockStack>
          )}

          {selectedTab === 3 && (
            <TimerSaleDisplayStep
              formState={formState}
              onFieldChange={onFieldChange}
              selectedProducts={selectionProps.selectedProducts}
            />
          )}
        </EditSectionsCard>
      </Layout.Section>

      <Layout.Section variant="oneThird">
        <CampaignDetailsSidebar
          formState={formState}
          onFieldChange={onFieldChange}
          nameError={nameError}
        />
      </Layout.Section>
    </>
  );
}
