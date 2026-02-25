"use client";

import { BlockStack } from "@shopify/polaris";
import type { CampaignFormState } from "@/features/campaigns/hooks/useCampaignForm";
import { ProductsStep } from "@/features/campaigns/components/early-access-wizard/ProductsStep";
import { AudienceStep } from "@/features/campaigns/components/early-access-wizard/AudienceStep";
import { StepDiscountConfig } from "@/features/campaigns/components/wizard/StepDiscountConfig";
import { DiscountedProductDisplayStep } from "./DiscountedProductDisplayStep";
import { ReviewSaveCard } from "@/features/campaigns/components/wizard/ReviewSaveCard";
import {
  CampaignWizard,
  type WizardStepConfig,
} from "@/features/campaigns/components/wizard/CampaignWizard";

const SAVE_BAR_ID = "discounted-product-wizard-bar";

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
        title="Choose products for discounted pricing"
        description="Select the products or collections that should show discounted pricing to qualifying customers."
        productsDescription="Select individual products to discount"
        collectionsDescription="Select collections to discount"
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
        title="Who should see discounted pricing?"
        description="Define which customers are eligible for this discount."
        tipText="If you don't add any rules, all logged-in customers will qualify."
      />
    ),
  },
  {
    id: "offer",
    label: "Discount settings",
    shortLabel: "Discount",
    render: ({ formState, onFieldChange }) => (
      <BlockStack gap="400">
        <StepDiscountConfig
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
      <DiscountedProductDisplayStep
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
        namePlaceholder="e.g., VIP Discount — Spring 2026"
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

export function DiscountedProductWizard() {
  return (
    <CampaignWizard
      type="discounted_product"
      title="Create Discounted Product campaign"
      saveBarId={SAVE_BAR_ID}
      steps={STEPS}
      validate={validate}
    />
  );
}
