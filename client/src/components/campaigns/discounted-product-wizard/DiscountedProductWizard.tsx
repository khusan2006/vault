"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useIdTokenNavigation } from "@/hooks/useIdTokenNavigation";
import { Page, BlockStack, Banner } from "@shopify/polaris";
import {
  useCampaignForm,
  createInitialFormState,
} from "@/hooks/useCampaignForm";
import type { CampaignFormState } from "@/hooks/useCampaignForm";
import type { SelectedResource } from "@/hooks/useResourcePicker";
import { campaignsApi } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { ProductsStep } from "@/components/campaigns/early-access-wizard/ProductsStep";
import { AudienceStep } from "@/components/campaigns/early-access-wizard/AudienceStep";
import { StepDiscountConfig } from "@/components/campaigns/wizard/StepDiscountConfig";
import { DiscountedProductDisplayStep } from "./DiscountedProductDisplayStep";
import {
  WizardStepProgress,
  type WizardStepDefinition,
} from "@/components/campaigns/wizard/WizardStepProgress";
import { WizardFooter } from "@/components/campaigns/wizard/WizardFooter";
import { useWizardSaveBar } from "@/hooks/useWizardSaveBar";
import { ReviewSaveCard } from "@/components/campaigns/wizard/ReviewSaveCard";

const SAVE_BAR_ID = "discounted-product-wizard-bar";

// =============================================================================
// Step definitions
// =============================================================================

const STEPS: WizardStepDefinition[] = [
  { id: "products", label: "Select products", shortLabel: "Products" },
  { id: "audience", label: "Set audience rules", shortLabel: "Audience" },
  { id: "offer", label: "Discount settings", shortLabel: "Discount" },
  { id: "display", label: "Storefront display", shortLabel: "Display" },
  { id: "review", label: "Review & save", shortLabel: "Save" },
];

// =============================================================================
// Main wizard component
// =============================================================================

export function DiscountedProductWizard() {
  const { push } = useIdTokenNavigation();
  const toast = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedProducts, setSelectedProducts] = useState<SelectedResource[]>(
    [],
  );
  const [selectedCollections, setSelectedCollections] = useState<
    SelectedResource[]
  >([]);

  const initialState = useMemo(
    () => createInitialFormState("discounted_product"),
    [],
  );

  const {
    formState,
    updateField,
    resetForm,
    buildPayload,
    isDirty,
    checkDirty,
    markClean,
  } = useCampaignForm(initialState);

  const hasSetBaseline = useRef(false);
  useEffect(() => {
    if (!hasSetBaseline.current) {
      markClean();
      hasSetBaseline.current = true;
      return;
    }
    checkDirty(formState);
  }, [formState, checkDirty, markClean]);

  const canSave = useMemo(
    () => Boolean(formState.name.trim()),
    [formState.name],
  );

  const saveBarRef = useWizardSaveBar({
    id: SAVE_BAR_ID,
    isDirty,
    canSave,
  });

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setError(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setError(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  const handleStepClick = useCallback(
    (index: number) => {
      if (index < currentStep) {
        setCurrentStep(index);
        setError(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [currentStep],
  );

  const handleFieldChange = useCallback(
    <K extends keyof CampaignFormState>(
      field: K,
      value: CampaignFormState[K],
    ) => {
      updateField(field, value);
      if (
        error === "Campaign name is required" &&
        field === "name" &&
        String(value).trim()
      ) {
        setError(null);
      }
    },
    [updateField, error],
  );

  const handleSave = useCallback(async () => {
    if (!formState.name.trim()) {
      setError("Campaign name is required");
      setCurrentStep(STEPS.length - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = buildPayload();
      await campaignsApi.create(payload);
      markClean();
      window.shopify?.saveBar?.hide(SAVE_BAR_ID);
      push("/campaigns");
      toast.show("Campaign created");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create campaign",
      );
    } finally {
      setSaving(false);
    }
  }, [formState.name, buildPayload, markClean, push, toast]);

  const handleDiscard = useCallback(() => {
    resetForm(initialState);
    setSelectedProducts([]);
    setSelectedCollections([]);
    setCurrentStep(0);
    setError(null);
    window.shopify?.saveBar?.hide(SAVE_BAR_ID);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [resetForm, initialState]);

  function renderStep() {
    switch (currentStep) {
      case 0:
        return (
          <ProductsStep
            formState={formState}
            onFieldChange={handleFieldChange}
            selectedProducts={selectedProducts}
            selectedCollections={selectedCollections}
            onProductsChange={setSelectedProducts}
            onCollectionsChange={setSelectedCollections}
            title="Choose products for discounted pricing"
            description="Select the products or collections that should show discounted pricing to qualifying customers."
            productsDescription="Select individual products to discount"
            collectionsDescription="Select collections to discount"
          />
        );
      case 1:
        return (
          <AudienceStep
            formState={formState}
            onFieldChange={handleFieldChange}
            title="Who should see discounted pricing?"
            description="Define which customers are eligible for this discount."
            tipText="If you don't add any rules, all logged-in customers will qualify."
          />
        );
      case 2:
        return (
          <BlockStack gap="400">
            <StepDiscountConfig
              formState={formState}
              onFieldChange={handleFieldChange}
            />
          </BlockStack>
        );
      case 3:
        return (
          <DiscountedProductDisplayStep
            formState={formState}
            onFieldChange={handleFieldChange}
            selectedProducts={selectedProducts}
          />
        );
      case 4:
        return (
          <ReviewSaveCard
            formState={formState}
            onFieldChange={handleFieldChange}
            nameError={
              error === "Campaign name is required" ? error : undefined
            }
            namePlaceholder="e.g., VIP Discount — Spring 2026"
          />
        );
      default:
        return null;
    }
  }

  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <>
      <ui-save-bar id={SAVE_BAR_ID} ref={saveBarRef}>
        <button
          variant="primary"
          onClick={handleSave}
          disabled={!canSave}
          {...(saving ? { loading: "" } : {})}
        />
        <button onClick={handleDiscard} />
      </ui-save-bar>

      <Page
        title="Create Discounted Product campaign"
        backAction={{
          content: currentStep === 0 ? "Back" : STEPS[currentStep - 1].label,
          onAction:
            currentStep === 0
              ? () => push("/campaigns/new")
              : handleBack,
        }}
      >
        <BlockStack gap="600">
          <WizardStepProgress
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />

          {error && (
            <Banner tone="critical" onDismiss={() => setError(null)}>
              {error}
            </Banner>
          )}

          {renderStep()}

          <WizardFooter
            showBack={currentStep > 0}
            onBack={handleBack}
            showNext={!isLastStep}
            onNext={handleNext}
          />
        </BlockStack>
      </Page>
    </>
  );
}
