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
import { DEFAULT_CONFIGS } from "@/types";
import { useDirtyForm } from "./useDirtyForm";

export interface CampaignFormState {
  type: CampaignType;
  name: string;
  description: string;
  status: CampaignStatus;
  conditions: ConditionGroup;
  benefits: Benefit[];
  config: CampaignConfig;
  priority: number;
  startsAt: string;
  endsAt: string;
}

type FormAction =
  | { type: "SET_FIELD"; field: keyof CampaignFormState; value: CampaignFormState[keyof CampaignFormState] }
  | { type: "RESET"; state: CampaignFormState };


const DEFAULT_CONDITIONS: ConditionGroup = {
  operator: "AND",
  conditions: [],
};

function cloneConfig<T extends CampaignConfig>(config: T): T {
  return JSON.parse(JSON.stringify(config));
}

export const INITIAL_FORM_STATE: CampaignFormState = {
  type: "early_access",
  name: "",
  description: "",
  status: CAMPAIGN_DEFAULTS.STATUS,
  conditions: DEFAULT_CONDITIONS,
  benefits: [],
  config: cloneConfig(DEFAULT_CONFIGS.early_access),
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
    benefits: campaign.benefits ?? [],
    config: campaign.config
      ? cloneConfig(campaign.config)
      : cloneConfig(DEFAULT_CONFIGS[campaign.type ?? "early_access"]),
    priority: campaign.priority ?? CAMPAIGN_DEFAULTS.PRIORITY,
    startsAt: campaign.startsAt ? campaign.startsAt.split("T")[0] : "",
    endsAt: campaign.endsAt ? campaign.endsAt.split("T")[0] : "",
  };
}

export function createInitialFormState(
  campaignType: CampaignType,
): CampaignFormState {
  return {
    ...INITIAL_FORM_STATE,
    type: campaignType,
    config: cloneConfig(DEFAULT_CONFIGS[campaignType]),
  };
}


function formReducer(state: CampaignFormState, action: FormAction): CampaignFormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return action.state;
    default:
      return state;
  }
}

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
    const safeBenefits = formState.benefits?.length
      ? formState.benefits
      : null;
    return {
      type: formState.type,
      name: formState.name.trim(),
      description: formState.description.trim() || undefined,
      status: formState.status,
      conditions: safeConditions,
      benefits: safeBenefits,
      config: formState.config,
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
