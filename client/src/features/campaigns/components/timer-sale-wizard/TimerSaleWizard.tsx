"use client";

import { BlockStack } from "@shopify/polaris";
import type { CampaignFormState } from "@/features/campaigns/hooks/useCampaignForm";
import { ProductsStep } from "@/features/campaigns/components/early-access-wizard/ProductsStep";
import { AudienceStep } from "@/features/campaigns/components/early-access-wizard/AudienceStep";
import { StepTimerSaleConfig } from "@/features/campaigns/components/wizard/StepTimerSaleConfig";
import { TimerSaleDisplayStep } from "./TimerSaleDisplayStep";
import { ReviewSaveCard } from "@/features/campaigns/components/wizard/ReviewSaveCard";
import {
  CampaignWizard,
  type WizardStepConfig,
} from "@/features/campaigns/components/wizard/CampaignWizard";

const SAVE_BAR_ID = "timer-sale-wizard-bar";

// =============================================================================
// Step definitions
// =============================================================================

const STEPS: WizardStepConfig[] = [
  {
    id: "products",
    label: "Select products",
    shortLabel: "Products",
    render: ({
      formState,
      onFieldChange,
      selectedProducts,
      selectedCollections,
      onProductsChange,
      onCollectionsChange,
    }) => (
      <ProductsStep
        formState={formState}
        onFieldChange={onFieldChange}
        selectedProducts={selectedProducts}
        selectedCollections={selectedCollections}
        onProductsChange={onProductsChange}
        onCollectionsChange={onCollectionsChange}
        title="Choose products for this timer sale"
        description="Select the products or collections included in this timed offer."
        productsDescription="Select individual products to include"
        collectionsDescription="Select collections to include"
      />
    ),
  },
  {
    id: "audience",
    label: "Set audience rules",
    shortLabel: "Audience",
    render: ({ formState, onFieldChange }) => (
      <AudienceStep
        formState={formState}
        onFieldChange={onFieldChange}
        title="Who should see this timer sale?"
        description="Define which customers are eligible for this timed offer."
        tipText="If you don't add any rules, all logged-in customers will qualify."
      />
    ),
  },
  {
    id: "offer",
    label: "Timer & discount",
    shortLabel: "Timer",
    render: ({ formState, onFieldChange }) => (
      <BlockStack gap="400">
        <StepTimerSaleConfig
          formState={formState}
          onFieldChange={onFieldChange}
        />
      </BlockStack>
    ),
  },
  {
    id: "display",
    label: "Storefront display",
    shortLabel: "Display",
    render: ({ formState, onFieldChange, selectedProducts }) => (
      <TimerSaleDisplayStep
        formState={formState}
        onFieldChange={onFieldChange}
        selectedProducts={selectedProducts}
      />
    ),
  },
  {
    id: "review",
    label: "Review & save",
    shortLabel: "Save",
    render: ({ formState, onFieldChange, nameError }) => (
      <ReviewSaveCard
        formState={formState}
        onFieldChange={onFieldChange}
        nameError={nameError}
        namePlaceholder="e.g., Flash Timer Sale — Spring 2026"
      />
    ),
  },
];

const validate = (state: CampaignFormState) => {
  if (!state.name.trim()) {
    return { message: "Campaign name is required", step: STEPS.length - 1 };
  }
  return null;
};

// =============================================================================
// Main wizard component
// =============================================================================

export function TimerSaleWizard() {
  return (
    <CampaignWizard
      type="timer_sale"
      title="Create Timer Sale campaign"
      saveBarId={SAVE_BAR_ID}
      steps={STEPS}
      validate={validate}
    />
  );
}
