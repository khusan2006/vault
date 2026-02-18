"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Page,
  Layout,
  BlockStack,
  Text,
  Button,
  Banner,
  Box,
} from "@shopify/polaris";
import { SaveBar } from "@shopify/app-bridge-react";
import { PlusIcon } from "@shopify/polaris-icons";
import {
  EarlyAccessIllustration,
  DiscountIllustration,
  TimerSaleIllustration,
} from "@/components/home/illustrations";
import {
  useCampaignForm,
  createInitialFormState,
} from "@/hooks/useCampaignForm";
import type { CampaignFormState } from "@/hooks/useCampaignForm";
import { campaignsApi } from "@/lib/api";
import { CAMPAIGN_TYPE_LABELS, CAMPAIGN_TYPE_DESCRIPTIONS } from "@/utils";
import type { CampaignType } from "@/types";
import { useToast } from "@/hooks/useToast";
import { useIdTokenNavigation } from "@/hooks/useIdTokenNavigation";
import {
  DiscountedProductForm,
  TimerSaleForm,
} from "@/components/campaigns";

// =============================================================================
// Constants
// =============================================================================

const TYPE_CARDS: {
  type: CampaignType;
  illustration: React.ReactNode;
  gradientClassName: string;
}[] = [
  {
    type: "early_access",
    illustration: <EarlyAccessIllustration />,
    gradientClassName: "bg-gradient-to-br from-[#ede9fe] to-[#c4b5fd]",
  },
  {
    type: "discounted_product",
    illustration: <DiscountIllustration />,
    gradientClassName: "bg-gradient-to-br from-[#dcfce7] to-[#86efac]",
  },
  {
    type: "timer_sale",
    illustration: <TimerSaleIllustration />,
    gradientClassName: "bg-gradient-to-br from-[#fef3c7] to-[#fbbf24]",
  },
];

// =============================================================================
// Type selector card
// =============================================================================

interface TypeSelectorCardProps {
  type: CampaignType;
  illustration: React.ReactNode;
  gradientClassName: string;
  onClick: () => void;
}

function TypeSelectorCard({
  type,
  illustration,
  gradientClassName,
  onClick,
}: TypeSelectorCardProps) {
  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      role="button"
      tabIndex={0}
      className="flex cursor-pointer flex-col overflow-hidden rounded-[var(--p-border-radius-300)] bg-[var(--p-color-bg-surface)] shadow-[var(--p-shadow-100)] transition-[box-shadow,transform] duration-150 ease-out hover:-translate-y-[2px] hover:shadow-[var(--p-shadow-300)]"
    >
      {/* Illustration area */}
      <div
        className={`flex h-[140px] items-center justify-center px-5 py-3 ${gradientClassName}`}
      >
        {illustration}
      </div>

      {/* Content area */}
      <div
        className="flex flex-1 flex-col gap-[var(--p-space-200)] p-[var(--p-space-400)]"
      >
        <Text variant="headingMd" as="h3">
          {CAMPAIGN_TYPE_LABELS[type]}
        </Text>
        <Text as="p" variant="bodySm" tone="subdued">
          {CAMPAIGN_TYPE_DESCRIPTIONS[type]}
        </Text>
        <div className="mt-auto pt-[var(--p-space-200)]">
          <Button icon={PlusIcon} variant="primary" onClick={onClick}>
            Create campaign
          </Button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Type selection view
// =============================================================================

function TypeSelection({
  onSelect,
}: {
  onSelect: (type: CampaignType) => void;
}) {
  return (
    <Layout.Section>
      <BlockStack gap="400">
        <Text variant="headingMd" as="h2">
          Choose campaign type
        </Text>
        <Text as="p" tone="subdued">
          Select the type of campaign you want to create. This determines how
          products are displayed to qualifying customers.
        </Text>
        <div className="grid grid-cols-1 items-stretch gap-[var(--p-space-400)] md:grid-cols-3">
          {TYPE_CARDS.map(({ type, illustration, gradientClassName }) => (
            <TypeSelectorCard
              key={type}
              type={type}
              illustration={illustration}
              gradientClassName={gradientClassName}
              onClick={() => onSelect(type)}
            />
          ))}
        </div>
      </BlockStack>
    </Layout.Section>
  );
}

// =============================================================================
// Form renderer (delegates to type-specific form components)
// =============================================================================

function renderFormByType(
  type: CampaignType,
  formState: CampaignFormState,
  onFieldChange: <K extends keyof CampaignFormState>(
    field: K,
    value: CampaignFormState[K],
  ) => void,
  nameError?: string,
) {
  const props = { formState, onFieldChange, nameError, showArchived: false };

  switch (type) {
    case "discounted_product":
      return <DiscountedProductForm {...props} />;
    case "timer_sale":
      return <TimerSaleForm {...props} />;
    default:
      return null;
  }
}

// =============================================================================
// Route map for wizard-based campaign types
// =============================================================================

const WIZARD_ROUTES: Partial<Record<CampaignType, string>> = {
  early_access: "/campaigns/new/early-access",
  discounted_product: "/campaigns/new/discounted-product",
  timer_sale: "/campaigns/new/timer-sale",
};

// =============================================================================
// Main wizard component
// =============================================================================

export function CampaignCreationWizard() {
  const { push } = useIdTokenNavigation();
  const searchParams = useSearchParams();
  const toast = useToast();

  const [selectedType, setSelectedType] = useState<CampaignType | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasHandledTypeParam = useRef(false);

  const {
    formState,
    updateField,
    resetForm,
    buildPayload,
    isDirty,
    checkDirty,
    markClean,
  } = useCampaignForm();

  // Track dirty state on every form change
  useEffect(() => {
    if (selectedType) {
      checkDirty(formState);
    }
  }, [formState, selectedType, checkDirty]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleTypeSelect = useCallback(
    (type: CampaignType) => {
      // Types with dedicated wizard flows navigate to their own page
      const wizardRoute = WIZARD_ROUTES[type];
      if (wizardRoute) {
        push(wizardRoute);
        return;
      }

      // Fallback: render the legacy single-page form inline
      const initialState = createInitialFormState(type);
      resetForm(initialState);
      setError(null);
      setSelectedType(type);
    },
    [resetForm, push],
  );

  useEffect(() => {
    if (hasHandledTypeParam.current) return;

    const typeParam = searchParams.get("type");
    if (!typeParam) return;

    if (
      typeParam !== "early_access" &&
      typeParam !== "discounted_product" &&
      typeParam !== "timer_sale"
    ) {
      return;
    }

    hasHandledTypeParam.current = true;
    const wizardRoute = WIZARD_ROUTES[typeParam];
    if (wizardRoute) {
      push(wizardRoute);
      return;
    }

    handleTypeSelect(typeParam);
  }, [handleTypeSelect, push, searchParams]);

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

  const handleSave = useCallback(
    async (asDraft = false) => {
      if (!formState.name.trim()) {
        setError("Campaign name is required");
        return;
      }

      try {
        setSaving(true);
        setError(null);

        const payload = buildPayload();
        if (asDraft) {
          payload.status = "draft";
        }

        await campaignsApi.create(payload);
        markClean();
        push("/campaigns");
        toast.show(
          asDraft ? "Campaign saved as draft" : "Campaign created",
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create campaign",
        );
      } finally {
        setSaving(false);
      }
    },
    [formState.name, buildPayload, markClean, push, toast],
  );

  const handleDiscard = useCallback(() => {
    if (selectedType) {
      const initialState = createInitialFormState(selectedType);
      resetForm(initialState);
      setError(null);
    }
  }, [selectedType, resetForm]);

  const handleBack = useCallback(() => {
    setSelectedType(null);
    setError(null);
  }, []);

  // ---------------------------------------------------------------------------
  // Type selection view
  // ---------------------------------------------------------------------------

  if (!selectedType) {
    return (
      <Page
        title="Create campaign"
        backAction={{
          content: "Campaigns",
          onAction: () => push("/campaigns"),
        }}
      >
        <Layout>
          <TypeSelection onSelect={handleTypeSelect} />
        </Layout>
        <Box paddingBlockEnd="600" />
      </Page>
    );
  }

  // ---------------------------------------------------------------------------
  // Campaign form view (single-page layout with SaveBar)
  // Used for campaign types that don't have a dedicated wizard yet
  // ---------------------------------------------------------------------------

  return (
    <>
      <SaveBar id="campaign-create-bar" open={isDirty}>
        <button
          variant="primary"
          onClick={() => handleSave(false)}
          {...(saving ? { loading: "" } : {})}
        />
        <button onClick={handleDiscard} />
      </SaveBar>

      <Page
        title={`New ${CAMPAIGN_TYPE_LABELS[selectedType]} campaign`}
        subtitle={`Create a new ${CAMPAIGN_TYPE_LABELS[selectedType].toLowerCase()} campaign`}
        backAction={{
          content: "Choose type",
          onAction: handleBack,
        }}
      >
        <Layout>
          {error && (
            <Layout.Section>
              <Banner tone="critical" onDismiss={() => setError(null)}>
                {error}
              </Banner>
            </Layout.Section>
          )}

          {renderFormByType(
            selectedType,
            formState,
            handleFieldChange,
            error === "Campaign name is required" ? error : undefined,
          )}
        </Layout>

        <Box paddingBlockEnd="600" />
      </Page>
    </>
  );
}
