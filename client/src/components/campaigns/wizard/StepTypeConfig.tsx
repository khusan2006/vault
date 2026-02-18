"use client";

import type { CampaignFormState } from "@/hooks/useCampaignForm";
import { StepEarlyAccessConfig } from "./StepEarlyAccessConfig";
import { StepDiscountConfig } from "./StepDiscountConfig";
import { StepTimerSaleConfig } from "./StepTimerSaleConfig";

interface StepTypeConfigProps {
  formState: CampaignFormState;
  onFieldChange: <K extends keyof CampaignFormState>(
    field: K,
    value: CampaignFormState[K],
  ) => void;
}

export function StepTypeConfig({ formState, onFieldChange }: StepTypeConfigProps) {
  switch (formState.type) {
    case "early_access":
      return (
        <StepEarlyAccessConfig
          formState={formState}
          onFieldChange={onFieldChange}
        />
      );
    case "discounted_product":
      return (
        <StepDiscountConfig
          formState={formState}
          onFieldChange={onFieldChange}
        />
      );
    case "timer_sale":
      return (
        <StepTimerSaleConfig
          formState={formState}
          onFieldChange={onFieldChange}
        />
      );
  }
}
