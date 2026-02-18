"use client";

import { useCallback, useReducer } from "react";
import type {
  Campaign,
  CampaignType,
  CampaignConfig,
  CampaignStatus,
  ConditionGroup,
  Benefit,
} from "@/types";
import { CAMPAIGN_DEFAULTS } from "@/constants";
import { useDirtyForm } from "./useDirtyForm";

// =============================================================================
// Types
// =============================================================================

export interface CampaignFormState {
  type: CampaignType;
  name: string;
  description: string;
  status: CampaignStatus;
  conditions: ConditionGroup;
  config: CampaignConfig;
  /** @deprecated Kept for backward compatibility during migration */
  benefits: Benefit[] | null;
  priority: number;
  startsAt: string;
  endsAt: string;
}

type FormAction =
  | { type: "SET_FIELD"; field: keyof CampaignFormState; value: CampaignFormState[keyof CampaignFormState] }
  | { type: "RESET"; state: CampaignFormState };

// =============================================================================
// Defaults
// =============================================================================

const DEFAULT_CONDITIONS: ConditionGroup = {
  operator: "AND",
  conditions: [],
};

export const INITIAL_FORM_STATE: CampaignFormState = {
  type: "early_access",
  name: "",
  description: "",
  status: CAMPAIGN_DEFAULTS.STATUS,
  conditions: DEFAULT_CONDITIONS,
  config: { productIds: [], collectionIds: [] },
  benefits: null,
  priority: CAMPAIGN_DEFAULTS.PRIORITY,
  startsAt: "",
  endsAt: "",
};

export function campaignToFormState(campaign: Campaign): CampaignFormState {
  return {
    type: campaign.type ?? "early_access",
    name: campaign.name,
    description: campaign.description || "",
    status: campaign.status,
    conditions: campaign.conditions ?? DEFAULT_CONDITIONS,
    config: campaign.config ?? { productIds: [], collectionIds: [] },
    benefits: campaign.benefits ?? null,
    priority: campaign.priority ?? CAMPAIGN_DEFAULTS.PRIORITY,
    startsAt: campaign.startsAt ? campaign.startsAt.split("T")[0] : "",
    endsAt: campaign.endsAt ? campaign.endsAt.split("T")[0] : "",
  };
}

export function createInitialFormState(
  campaignType: CampaignType,
): CampaignFormState {
  const configs: Record<CampaignType, CampaignConfig> = {
    early_access: { productIds: [], collectionIds: [] },
    discounted_product: {
      productIds: [],
      collectionIds: [],
      discount: { type: "percentage", value: 0 },
    },
    timer_sale: {
      productIds: [],
      collectionIds: [],
      discount: { type: "percentage", value: 0 },
      discountMethod: "price_change",
      timerDurationMinutes: 60,
      showCountdown: true,
      timerType: "per_customer",
    },
  };

  return {
    ...INITIAL_FORM_STATE,
    type: campaignType,
    config: configs[campaignType],
  };
}

// =============================================================================
// Reducer
// =============================================================================

function formReducer(state: CampaignFormState, action: FormAction): CampaignFormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return action.state;
  }
}

// =============================================================================
// Hook
// =============================================================================

export function useCampaignForm(initial?: CampaignFormState) {
  const [formState, dispatch] = useReducer(formReducer, initial ?? INITIAL_FORM_STATE);
  const { isDirty, setClean, checkDirty } = useDirtyForm();

  const updateField = useCallback(
    <K extends keyof CampaignFormState>(field: K, value: CampaignFormState[K]) => {
      dispatch({ type: "SET_FIELD", field, value });
    },
    [],
  );

  const resetForm = useCallback(
    (state: CampaignFormState) => {
      dispatch({ type: "RESET", state });
      setClean(state);
    },
    [setClean],
  );

  const hydrateFromCampaign = useCallback(
    (campaign: Campaign) => {
      resetForm(campaignToFormState(campaign));
    },
    [resetForm],
  );

  const buildPayload = useCallback((): Partial<Campaign> => {
    const safeConditions = formState.conditions ?? DEFAULT_CONDITIONS;
    return {
      type: formState.type,
      name: formState.name.trim(),
      description: formState.description.trim() || undefined,
      status: formState.status,
      conditions: safeConditions,
      config: formState.config,
      benefits: formState.benefits,
      priority: formState.priority,
      startsAt: formState.startsAt || null,
      endsAt: formState.endsAt || null,
    };
  }, [formState]);

  const markClean = useCallback(() => {
    setClean(formState);
  }, [formState, setClean]);

  return {
    formState,
    updateField,
    resetForm,
    hydrateFromCampaign,
    buildPayload,
    isDirty,
    checkDirty,
    markClean,
  };
}
