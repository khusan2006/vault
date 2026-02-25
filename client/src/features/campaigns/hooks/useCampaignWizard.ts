"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { campaignsApi } from "@/lib/api";
import { useIdTokenNavigation } from "@/shared/hooks/useIdTokenNavigation";
import { useToast } from "@/shared/hooks/useToast";
import {
  createInitialFormState,
  useCampaignForm,
} from "@/features/campaigns/hooks/useCampaignForm";
import type { CampaignFormState } from "@/features/campaigns/hooks/useCampaignForm";
import type { CampaignType } from "@/types";
import { useWizardSaveBar } from "@/features/campaigns/hooks/useWizardSaveBar";

interface UseCampaignWizardOptions {
  type: CampaignType;
  saveBarId: string;
  stepsCount: number;
  canSave?: (formState: CampaignFormState) => boolean;
  validate?: (
    formState: CampaignFormState,
  ) => { message: string; step?: number } | null;
  onReset?: () => void;
}

interface UseCampaignWizardResult {
  formState: CampaignFormState;
  currentStep: number;
  isLastStep: boolean;
  saving: boolean;
  error: string | null;
  canSave: boolean;
  saveBarRef: RefObject<UISaveBarElement>;
  setError: (value: string | null) => void;
  handleNext: () => void;
  handleBack: () => void;
  handleStepClick: (index: number) => void;
  handleFieldChange: <K extends keyof CampaignFormState>(
    field: K,
    value: CampaignFormState[K],
  ) => void;
  handleSave: () => Promise<void>;
  handleDiscard: () => void;
}

export function useCampaignWizard({
  type,
  saveBarId,
  stepsCount,
  canSave: canSaveOverride,
  validate,
  onReset,
}: UseCampaignWizardOptions): UseCampaignWizardResult {
  const { push } = useIdTokenNavigation();
  const toast = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialState = useMemo(() => createInitialFormState(type), [type]);

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

  const canSave = useMemo(() => {
    if (canSaveOverride) return canSaveOverride(formState);
    return Boolean(formState.name.trim());
  }, [canSaveOverride, formState]);

  const saveBarRef = useWizardSaveBar({
    id: saveBarId,
    isDirty,
    canSave,
  });

  const handleNext = useCallback(() => {
    if (currentStep < stepsCount - 1) {
      setCurrentStep((prev) => prev + 1);
      setError(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep, stepsCount]);

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
    const validationError = validate?.(formState);
    if (validationError) {
      setError(validationError.message);
      if (typeof validationError.step === "number") {
        setCurrentStep(validationError.step);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = buildPayload();
      await campaignsApi.create(payload);
      markClean();
      window.shopify?.saveBar?.hide(saveBarId);
      push("/campaigns");
      toast.show("Campaign created");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create campaign",
      );
    } finally {
      setSaving(false);
    }
  }, [formState, validate, buildPayload, markClean, saveBarId, push, toast]);

  const handleDiscard = useCallback(() => {
    resetForm(initialState);
    setCurrentStep(0);
    setError(null);
    onReset?.();
    window.shopify?.saveBar?.hide(saveBarId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [resetForm, initialState, saveBarId, onReset]);

  return {
    formState,
    currentStep,
    isLastStep: currentStep >= stepsCount - 1,
    saving,
    error,
    canSave,
    saveBarRef,
    setError,
    handleNext,
    handleBack,
    handleStepClick,
    handleFieldChange,
    handleSave,
    handleDiscard,
  };
}
