"use client";

import type { CampaignType } from "@/types";
import type { SelectedResource } from "@/features/campaigns/hooks/useResourcePicker";
import { useCampaignForm } from "@/features/campaigns/hooks/useCampaignForm";
import { EarlyAccessEditFlow } from "./flows/EarlyAccessEditFlow";
import { DiscountedProductEditFlow } from "./flows/DiscountedProductEditFlow";
import { TimerSaleEditFlow } from "./flows/TimerSaleEditFlow";
import { LegacyEditFlow } from "./flows/LegacyEditFlow";

interface SelectionProps {
  selectedProducts: SelectedResource[];
  selectedCollections: SelectedResource[];
  onProductsChange: (products: SelectedResource[]) => void;
  onCollectionsChange: (collections: SelectedResource[]) => void;
}

export function renderEditFlowByType({
  type,
  formState,
  onFieldChange,
  nameError,
  selectionProps,
}: {
  type: CampaignType | undefined;
  formState: ReturnType<typeof useCampaignForm>["formState"];
  onFieldChange: <K extends keyof ReturnType<typeof useCampaignForm>["formState"]>(
    field: K,
    value: ReturnType<typeof useCampaignForm>["formState"][K],
  ) => void;
  nameError?: string;
  selectionProps: SelectionProps;
}) {
  switch (type) {
    case "discounted_product":
      return (
        <DiscountedProductEditFlow
          formState={formState}
          onFieldChange={onFieldChange}
          nameError={nameError}
          selectionProps={selectionProps}
        />
      );
    case "timer_sale":
      return (
        <TimerSaleEditFlow
          formState={formState}
          onFieldChange={onFieldChange}
          nameError={nameError}
          selectionProps={selectionProps}
        />
      );
    case "early_access":
      return (
        <EarlyAccessEditFlow
          formState={formState}
          onFieldChange={onFieldChange}
          nameError={nameError}
          selectionProps={selectionProps}
        />
      );
    default:
      return (
        <LegacyEditFlow
          formState={formState}
          onFieldChange={onFieldChange}
          nameError={nameError}
        />
      );
  }
}
