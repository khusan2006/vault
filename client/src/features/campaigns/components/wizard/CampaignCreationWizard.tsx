"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Page, Layout, Box } from "@shopify/polaris";
import type { CampaignType } from "@/types";
import { useIdTokenNavigation } from "@/shared/hooks/useIdTokenNavigation";
import { CampaignTypeSelector } from "@/features/campaigns/components/wizard/CampaignTypeSelector";


const WIZARD_ROUTES: Partial<Record<CampaignType, string>> = {
  early_access: "/campaigns/new/early-access",
  discounted_product: "/campaigns/new/discounted-product",
  timer_sale: "/campaigns/new/timer-sale",
};

export function CampaignCreationWizard() {
  const { push } = useIdTokenNavigation();
  const searchParams = useSearchParams();
  const hasHandledTypeParam = useRef(false);

  const handleTypeSelect = useCallback(
    (type: CampaignType) => {
      const wizardRoute = WIZARD_ROUTES[type];
      if (wizardRoute) {
        push(wizardRoute);
      }
    },
    [push],
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
    }
  }, [handleTypeSelect, push, searchParams]);

  return (
    <Page
      title="Create campaign"
      backAction={{
        content: "Campaigns",
        onAction: () => push("/campaigns"),
      }}
    >
      <Layout>
        <CampaignTypeSelector onSelect={handleTypeSelect} />
      </Layout>
      <Box paddingBlockEnd="600" />
    </Page>
  );
}
