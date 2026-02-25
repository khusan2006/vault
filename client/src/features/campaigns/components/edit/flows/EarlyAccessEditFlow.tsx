"use client";

import { useState } from "react";
import { Layout } from "@shopify/polaris";
import type { EarlyAccessConfig } from "@/types";
import type { SelectedResource } from "@/features/campaigns/hooks/useResourcePicker";
import { useCampaignForm } from "@/features/campaigns/hooks/useCampaignForm";
import { ProductsStep } from "@/features/campaigns/components/early-access-wizard/ProductsStep";
import { AudienceStep } from "@/features/campaigns/components/early-access-wizard/AudienceStep";
import { StorefrontStep } from "@/features/campaigns/components/early-access-wizard/StorefrontStep";
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

interface EarlyAccessEditFlowProps {
  formState: ReturnType<typeof useCampaignForm>["formState"];
  onFieldChange: <K extends keyof ReturnType<typeof useCampaignForm>["formState"]>(
    field: K,
    value: ReturnType<typeof useCampaignForm>["formState"][K],
  ) => void;
  nameError?: string;
  selectionProps: SelectionProps;
}

export function EarlyAccessEditFlow({
  formState,
  onFieldChange,
  nameError,
  selectionProps,
}: EarlyAccessEditFlowProps) {
  const config = formState.config as EarlyAccessConfig;
  const [selectedTab, setSelectedTab] = useState(0);

  const productCount = config.productIds.length + config.collectionIds.length;
  const ruleCount = countFilledRules(formState.conditions);

  const tabs = buildEditFlowTabs({
    productCount,
    ruleCount,
    extra: [
      {
        id: "preview",
        content: EDIT_FLOW_TAB_LABELS.preview,
        badge: formatSetBadge(Boolean(config.storefrontApproach)),
      },
    ],
  });

  return (
    <>
      <Layout.Section>
        <EditSectionsCard
          title="Edit sections"
          description={EDIT_FLOW_DESCRIPTIONS.early_access}
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
            />
          )}

          {selectedTab === 1 && (
            <AudienceStep
              formState={formState}
              onFieldChange={onFieldChange}
            />
          )}

          {selectedTab === 2 && (
            <StorefrontStep
              formState={formState}
              onFieldChange={onFieldChange}
              selectedProducts={selectionProps.selectedProducts}
              approachColumns={2}
              showInlinePreview={false}
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
