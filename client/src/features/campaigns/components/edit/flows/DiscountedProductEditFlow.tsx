"use client";

import { useState } from "react";
import { Layout, BlockStack } from "@shopify/polaris";
import type { DiscountedProductConfig } from "@/types";
import type { SelectedResource } from "@/features/campaigns/hooks/useResourcePicker";
import { useCampaignForm } from "@/features/campaigns/hooks/useCampaignForm";
import { ProductsStep } from "@/features/campaigns/components/early-access-wizard/ProductsStep";
import { AudienceStep } from "@/features/campaigns/components/early-access-wizard/AudienceStep";
import { StepDiscountConfig } from "@/features/campaigns/components/wizard/StepDiscountConfig";
import { DiscountedProductDisplayStep } from "@/features/campaigns/components/discounted-product-wizard/DiscountedProductDisplayStep";
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

interface DiscountedProductEditFlowProps {
  formState: ReturnType<typeof useCampaignForm>["formState"];
  onFieldChange: <K extends keyof ReturnType<typeof useCampaignForm>["formState"]>(
    field: K,
    value: ReturnType<typeof useCampaignForm>["formState"][K],
  ) => void;
  nameError?: string;
  selectionProps: SelectionProps;
}

export function DiscountedProductEditFlow({
  formState,
  onFieldChange,
  nameError,
  selectionProps,
}: DiscountedProductEditFlowProps) {
  const config = formState.config as DiscountedProductConfig;
  const [selectedTab, setSelectedTab] = useState(0);

  const productCount = config.productIds.length + config.collectionIds.length;
  const ruleCount = countFilledRules(formState.conditions);

  const tabs = buildEditFlowTabs({
    productCount,
    ruleCount,
    extra: [
      {
        id: "discount",
        content: EDIT_FLOW_TAB_LABELS.discount,
        badge: formatSetBadge(Boolean(config.discount?.value)),
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
          description={EDIT_FLOW_DESCRIPTIONS.discounted_product}
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
              title="Choose products for discounted pricing"
              description="Select the products or collections that should show discounted pricing to qualifying customers."
              productsDescription="Select individual products to discount"
              collectionsDescription="Select collections to discount"
            />
          )}

          {selectedTab === 1 && (
            <AudienceStep
              formState={formState}
              onFieldChange={onFieldChange}
              title="Who should see discounted pricing?"
              description="Define which customers are eligible for this discount."
              tipText="If you don't add any rules, all logged-in customers will qualify."
            />
          )}

          {selectedTab === 2 && (
            <BlockStack gap="400">
              <StepDiscountConfig
                formState={formState}
                onFieldChange={onFieldChange}
              />
            </BlockStack>
          )}

          {selectedTab === 3 && (
            <DiscountedProductDisplayStep
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
