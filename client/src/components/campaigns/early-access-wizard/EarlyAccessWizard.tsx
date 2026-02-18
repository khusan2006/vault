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
import type { EarlyAccessConfig } from "@/types";
import type { SelectedResource } from "@/hooks/useResourcePicker";
import { campaignsApi } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { ProductsStep } from "./ProductsStep";
import { AudienceStep } from "./AudienceStep";
import { StorefrontStep } from "./StorefrontStep";
import { ReviewSaveStep } from "./ReviewSaveStep";
import {
  WizardStepProgress,
  type WizardStepDefinition,
} from "@/components/campaigns/wizard/WizardStepProgress";
import { WizardFooter } from "@/components/campaigns/wizard/WizardFooter";
import { useWizardSaveBar } from "@/hooks/useWizardSaveBar";

const SAVE_BAR_ID = "early-access-wizard-bar";

// =============================================================================
// Step definitions
// =============================================================================

const STEPS: WizardStepDefinition[] = [
  { id: "products", label: "Select products", shortLabel: "Products" },
  { id: "audience", label: "Set audience rules", shortLabel: "Audience" },
  { id: "storefront", label: "Storefront display", shortLabel: "Display" },
  { id: "review", label: "Review & save", shortLabel: "Save" },
];

// =============================================================================
// Main wizard component
// =============================================================================

export function EarlyAccessWizard() {
  const { push } = useIdTokenNavigation();
  const toast = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resource details for displaying product/collection info in the UI
  const [selectedProducts, setSelectedProducts] = useState<SelectedResource[]>(
    [],
  );
  const [selectedCollections, setSelectedCollections] = useState<
    SelectedResource[]
  >([]);

  const initialState = useMemo(
    () => createInitialFormState("early_access"),
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

  // Set the clean baseline on mount so save bar doesn't show prematurely.
  // useDirtyForm starts with initialValues="" which won't match the real
  // initial form state, so we mark it clean once on first render.
  const hasSetBaseline = useRef(false);
  useEffect(() => {
    if (!hasSetBaseline.current) {
      markClean();
      hasSetBaseline.current = true;
      return;
    }
    checkDirty(formState);
  }, [formState, checkDirty, markClean]);

  // Determine whether all required fields are filled so save can proceed
  const canSave = useMemo(() => {
    const config = formState.config as EarlyAccessConfig;
    return Boolean(config.storefrontApproach) && Boolean(formState.name.trim());
  }, [formState]);

  const saveBarRef = useWizardSaveBar({
    id: SAVE_BAR_ID,
    isDirty,
    canSave,
  });

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  const canGoNext = useCallback((): boolean => {
    switch (currentStep) {
      case 0: // Products — always allow (empty selection = all products)
        return true;
      case 1: // Audience — always allow (empty = all customers)
        return true;
      case 2: {
        // Storefront — must select an approach
        const config = formState.config as EarlyAccessConfig;
        return Boolean(config.storefrontApproach);
      }
      case 3: // Last step — no "next"
        return false;
      default:
        return false;
    }
  }, [currentStep, formState]);

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

  // ---------------------------------------------------------------------------
  // Field change handler
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Save (called from SaveBar)
  // ---------------------------------------------------------------------------

  const handleSave = useCallback(async () => {
    // Validate: storefront approach must be selected (step 2)
    const config = formState.config as EarlyAccessConfig;
    if (!config.storefrontApproach) {
      setError("Please select a storefront display approach");
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Validate: campaign name is required (step 3)
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
  }, [formState, buildPayload, markClean, push, toast]);

  // ---------------------------------------------------------------------------
  // Discard (called from SaveBar)
  // ---------------------------------------------------------------------------

  const handleDiscard = useCallback(() => {
    resetForm(initialState);
    setSelectedProducts([]);
    setSelectedCollections([]);
    setCurrentStep(0);
    setError(null);
    window.shopify?.saveBar?.hide(SAVE_BAR_ID);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [resetForm, initialState]);

  // ---------------------------------------------------------------------------
  // Render step content
  // ---------------------------------------------------------------------------

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
          />
        );
      case 1:
        return (
          <AudienceStep
            formState={formState}
            onFieldChange={handleFieldChange}
          />
        );
      case 2:
        return (
          <StorefrontStep
            formState={formState}
            onFieldChange={handleFieldChange}
            selectedProducts={selectedProducts}
            approachColumns={3}
            showInlinePreview
          />
        );
      case 3:
        return (
          <ReviewSaveStep
            formState={formState}
            onFieldChange={handleFieldChange}
            nameError={
              error === "Campaign name is required" ? error : undefined
            }
            selectedProducts={selectedProducts}
            selectedCollections={selectedCollections}
          />
        );
      default:
        return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <>
      {/* Shopify contextual save bar (controlled via shopify.saveBar API) */}
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
        title="Create Early Access campaign"
        backAction={{
          content: currentStep === 0 ? "Back" : STEPS[currentStep - 1].label,
          onAction:
            currentStep === 0
              ? () => push("/campaigns/new")
              : handleBack,
        }}
      >
        <BlockStack gap="600">
          {/* Step progress indicator */}
          <WizardStepProgress
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />

          {/* Error banner */}
          {error && (
            <Banner tone="critical" onDismiss={() => setError(null)}>
              {error}
            </Banner>
          )}

          {/* Step content */}
          {renderStep()}

          <WizardFooter
            showBack={currentStep > 0}
            onBack={handleBack}
            showNext={!isLastStep}
            onNext={handleNext}
            nextDisabled={!canGoNext()}
          />
        </BlockStack>
      </Page>
    </>
  );
}
