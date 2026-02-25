"use client";

import { CampaignForm } from "@/features/campaigns/components";
import { useCampaignForm } from "@/features/campaigns/hooks/useCampaignForm";

interface LegacyEditFlowProps {
  formState: ReturnType<typeof useCampaignForm>["formState"];
  onFieldChange: <K extends keyof ReturnType<typeof useCampaignForm>["formState"]>(
    field: K,
    value: ReturnType<typeof useCampaignForm>["formState"][K],
  ) => void;
  nameError?: string;
}

export function LegacyEditFlow({
  formState,
  onFieldChange,
  nameError,
}: LegacyEditFlowProps) {
  return (
    <CampaignForm
      formState={formState}
      onFieldChange={onFieldChange}
      nameError={nameError}
      showArchived
    />
  );
}
