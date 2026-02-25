"use client";

import { useCallback, useMemo, useState } from "react";
import { useIdTokenNavigation } from "@/shared/hooks/useIdTokenNavigation";
import { useCampaignWizard } from "@/features/campaigns/hooks/useCampaignWizard";
import type { CampaignFormState } from "@/features/campaigns/hooks/useCampaignForm";
import type { CampaignType } from "@/types";
import type { SelectedResource } from "@/features/campaigns/hooks/useResourcePicker";
import { WizardLayout } from "./WizardLayout";
import type { WizardStepDefinition } from "./WizardStepProgress";

export interface WizardRenderContext {
  formState: CampaignFormState;
  onFieldChange: <K extends keyof CampaignFormState>(
    field: K,
    value: CampaignFormState[K],
  ) => void;
  selectedProducts: SelectedResource[];
  selectedCollections: SelectedResource[];
  onProductsChange: (products: SelectedResource[]) => void;
  onCollectionsChange: (collections: SelectedResource[]) => void;
  currentStep: number;
  error: string | null;
  nameError?: string;
}

export interface WizardStepConfig extends WizardStepDefinition {
  render: (context: WizardRenderContext) => React.ReactNode;
}

interface CampaignWizardProps {
  type: CampaignType;
  title: string;
  saveBarId: string;
  steps: WizardStepConfig[];
  backTo?: string;
  canSave?: (formState: CampaignFormState) => boolean;
  validate?: (
    formState: CampaignFormState,
  ) => { message: string; step?: number } | null;
  canProceed?: (options: {
    currentStep: number;
    formState: CampaignFormState;
    selectedProducts: SelectedResource[];
    selectedCollections: SelectedResource[];
  }) => boolean;
  onReset?: () => void;
}

const DEFAULT_BACK_ROUTE = "/campaigns/new";

export function CampaignWizard({
  type,
  title,
  saveBarId,
  steps,
  backTo = DEFAULT_BACK_ROUTE,
  canSave,
  validate,
  canProceed,
  onReset,
}: CampaignWizardProps) {
  const { push } = useIdTokenNavigation();
  const [selectedProducts, setSelectedProducts] = useState<SelectedResource[]>(
    [],
  );
  const [selectedCollections, setSelectedCollections] = useState<
    SelectedResource[]
  >([]);

  const handleReset = useCallback(() => {
    setSelectedProducts([]);
    setSelectedCollections([]);
    onReset?.();
  }, [onReset]);

  const wizard = useCampaignWizard({
    type,
    saveBarId,
    stepsCount: steps.length,
    canSave,
    validate,
    onReset: handleReset,
  });

  const {
    formState,
    currentStep,
    isLastStep,
    saving,
    error,
    canSave: canSaveResolved,
    saveBarRef,
    setError,
    handleNext,
    handleBack,
    handleStepClick,
    handleFieldChange,
    handleSave,
    handleDiscard,
  } = wizard;

  const nameError =
    error === "Campaign name is required" ? error : undefined;

  const renderContext = useMemo(
    () => ({
      formState,
      onFieldChange: handleFieldChange,
      selectedProducts,
      selectedCollections,
      onProductsChange: setSelectedProducts,
      onCollectionsChange: setSelectedCollections,
      currentStep,
      error,
      nameError,
    }),
    [
      formState,
      handleFieldChange,
      selectedProducts,
      selectedCollections,
      setSelectedProducts,
      setSelectedCollections,
      currentStep,
      error,
      nameError,
    ],
  );

  const canGoNext = canProceed
    ? canProceed({
        currentStep,
        formState,
        selectedProducts,
        selectedCollections,
      })
    : true;

  const stepMeta = useMemo(
    () =>
      steps.map((step) => ({
        id: step.id,
        label: step.label,
        shortLabel: step.shortLabel,
      })),
    [steps],
  );

  const backLabel =
    currentStep === 0 ? "Back" : steps[currentStep - 1]?.label ?? "Back";

  return (
    <>
      <ui-save-bar id={saveBarId} ref={saveBarRef}>
        <button
          variant="primary"
          onClick={handleSave}
          disabled={!canSaveResolved}
          {...(saving ? { loading: "" } : {})}
        />
        <button onClick={handleDiscard} />
      </ui-save-bar>

      <WizardLayout
        title={title}
        steps={stepMeta}
        currentStep={currentStep}
        error={error}
        onClearError={() => setError(null)}
        onStepClick={handleStepClick}
        backAction={{
          label: backLabel,
          onAction:
            currentStep === 0 ? () => push(backTo) : handleBack,
        }}
        footer={{
          showBack: currentStep > 0,
          onBack: handleBack,
          showNext: !isLastStep,
          onNext: handleNext,
          nextDisabled: !canGoNext,
        }}
      >
        {steps[currentStep]?.render(renderContext)}
      </WizardLayout>
    </>
  );
}
