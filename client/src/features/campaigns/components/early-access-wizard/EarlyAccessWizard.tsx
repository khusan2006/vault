"use client";

import type { EarlyAccessConfig } from "@/types";
import type { CampaignFormState } from "@/features/campaigns/hooks/useCampaignForm";
import { ProductsStep } from "./ProductsStep";
import { AudienceStep } from "./AudienceStep";
import { StorefrontStep } from "./StorefrontStep";
import { ReviewSaveStep } from "./ReviewSaveStep";
import {
  CampaignWizard,
  type WizardStepConfig,
} from "@/features/campaigns/components/wizard/CampaignWizard";

const SAVE_BAR_ID = "early-access-wizard-bar";

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
      />
    ),
  },
  {
    id: "audience",
    label: "Set audience rules",
    shortLabel: "Audience",
    render: ({ formState, onFieldChange }) => (
      <AudienceStep formState={formState} onFieldChange={onFieldChange} />
    ),
  },
  {
    id: "storefront",
    label: "Storefront display",
    shortLabel: "Display",
    render: ({ formState, onFieldChange, selectedProducts }) => (
      <StorefrontStep
        formState={formState}
        onFieldChange={onFieldChange}
        selectedProducts={selectedProducts}
        approachColumns={3}
        showInlinePreview
      />
    ),
  },
  {
    id: "review",
    label: "Review & save",
    shortLabel: "Save",
    render: ({
      formState,
      onFieldChange,
      nameError,
      selectedProducts,
      selectedCollections,
    }) => (
      <ReviewSaveStep
        formState={formState}
        onFieldChange={onFieldChange}
        nameError={nameError}
        selectedProducts={selectedProducts}
        selectedCollections={selectedCollections}
      />
    ),
  },
];

const canSave = (state: CampaignFormState) => {
  const config = state.config as EarlyAccessConfig;
  return Boolean(config.storefrontApproach) && Boolean(state.name.trim());
};

const validate = (state: CampaignFormState) => {
  const config = state.config as EarlyAccessConfig;
  if (!config.storefrontApproach) {
    return { message: "Please select a storefront display approach", step: 2 };
  }
  if (!state.name.trim()) {
    return { message: "Campaign name is required", step: STEPS.length - 1 };
  }
  return null;
};

const canProceed = ({
  currentStep,
  formState,
}: {
  currentStep: number;
  formState: CampaignFormState;
}) => {
  if (currentStep !== 2) return true;
  const config = formState.config as EarlyAccessConfig;
  return Boolean(config.storefrontApproach);
};

// =============================================================================
// Main wizard component
// =============================================================================

export function EarlyAccessWizard() {
  return (
    <CampaignWizard
      type="early_access"
      title="Create Early Access campaign"
      saveBarId={SAVE_BAR_ID}
      steps={STEPS}
      canSave={canSave}
      validate={validate}
      canProceed={canProceed}
    />
  );
}
