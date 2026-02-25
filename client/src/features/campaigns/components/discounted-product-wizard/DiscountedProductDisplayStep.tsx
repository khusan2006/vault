"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BlockStack,
  InlineStack,
  Text,
  Button,
  Banner,
  Card,
} from "@shopify/polaris";
import { EditIcon, RefreshIcon } from "@shopify/polaris-icons";
import type {
  CampaignConfig,
  DiscountedProductConfig,
  DiscountedProductDisplayConfig,
} from "@/types";
import type { CampaignFormState } from "@/features/campaigns/hooks/useCampaignForm";
import type { SelectedResource } from "@/features/campaigns/hooks/useResourcePicker";
import { DiscountedProductCustomizerModal } from "./DiscountedProductCustomizerModal";
import {
  ensureDiscountedDisplayConfig,
  getDefaultDiscountedDisplayConfig,
} from "@/utils/display-config";

function toTitle(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

interface DiscountedProductDisplayStepProps {
  formState: CampaignFormState;
  onFieldChange: <K extends keyof CampaignFormState>(
    field: K,
    value: CampaignFormState[K],
  ) => void;
  selectedProducts: SelectedResource[];
}

export function DiscountedProductDisplayStep({
  formState,
  onFieldChange,
  selectedProducts,
}: DiscountedProductDisplayStepProps) {
  const config = formState.config as DiscountedProductConfig;
  const [showCustomize, setShowCustomize] = useState(false);

  const updateConfig = useCallback(
    (updates: Partial<DiscountedProductConfig>) => {
      onFieldChange("config", { ...config, ...updates } as CampaignConfig);
    },
    [config, onFieldChange],
  );

  useEffect(() => {
    const normalized = ensureDiscountedDisplayConfig(config.displayConfig);
    if (!config.displayConfig) {
      updateConfig({ displayConfig: normalized });
      return;
    }
    if (JSON.stringify(normalized) !== JSON.stringify(config.displayConfig)) {
      updateConfig({ displayConfig: normalized });
    }
  }, [config.displayConfig, updateConfig]);

  const normalizedDisplayConfig = useMemo(
    () => ensureDiscountedDisplayConfig(config.displayConfig),
    [config.displayConfig],
  );

  const handleUpdateDisplayConfig = useCallback(
    (updates: Partial<DiscountedProductDisplayConfig>) => {
      const current = normalizedDisplayConfig;
      if (!current) return;
      updateConfig({ displayConfig: { ...current, ...updates } });
    },
    [normalizedDisplayConfig, updateConfig],
  );

  const handleResetDefaults = useCallback(() => {
    const defaults = getDefaultDiscountedDisplayConfig();
    updateConfig({
      displayConfig: { ...defaults, theme: config.displayConfig?.theme },
    });
  }, [config.displayConfig?.theme, updateConfig]);

  const summary = useMemo(() => {
    if (!normalizedDisplayConfig) return null;
    const { notification, landingPage, productPage } = normalizedDisplayConfig;

    const notificationSummary = [
      toTitle(notification.type),
      notification.type === "banner" || notification.type === "toast"
        ? toTitle(notification.visuals.position)
        : null,
    ]
      .filter(Boolean)
      .join(" · ");

    const landingSummary = landingPage.enabled
      ? `${landingPage.gridColumns} columns · ${landingPage.badgeText || "No badge"}`
      : "Landing page disabled";

    const productSummary = [
      productPage.showStrikethroughPricing ? "Strikethrough" : "Standard price",
      productPage.discountBadge.enabled ? "Badge on" : "Badge off",
      productPage.banner ? "Banner on" : "No banner",
    ].join(" · ");

    return { notificationSummary, landingSummary, productSummary };
  }, [normalizedDisplayConfig]);

  if (!normalizedDisplayConfig) return null;

  return (
    <BlockStack gap="500">
      <Card>
        <BlockStack gap="400">
          <InlineStack align="space-between" blockAlign="center">
            <BlockStack gap="100">
              <Text variant="headingMd" as="h2">
                Customize appearance
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Fine-tune how discounted pricing appears on your storefront.
              </Text>
            </BlockStack>
            <InlineStack gap="200">
              <Button icon={EditIcon} onClick={() => setShowCustomize(true)}>
                Customize
              </Button>
              <Button
                icon={RefreshIcon}
                variant="plain"
                onClick={handleResetDefaults}
              >
                Reset defaults
              </Button>
            </InlineStack>
          </InlineStack>

          <Banner tone="info">
            Click &quot;Customize&quot; to adjust the offer prompt, landing page
            layout, and product page pricing with a live preview.
          </Banner>

          {summary && (
            <BlockStack gap="200">
              <Text as="p" variant="bodySm" fontWeight="semibold">
                Current settings
              </Text>
              <BlockStack gap="100">
                <Text as="p" variant="bodySm" tone="subdued">
                  Offer prompt: {summary.notificationSummary}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Landing page: {summary.landingSummary}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Product page: {summary.productSummary}
                </Text>
              </BlockStack>
            </BlockStack>
          )}
        </BlockStack>
      </Card>

      <DiscountedProductCustomizerModal
        open={showCustomize}
        onClose={() => setShowCustomize(false)}
        displayConfig={normalizedDisplayConfig}
        onDisplayConfigChange={(newConfig) =>
          handleUpdateDisplayConfig(newConfig)
        }
        getDefaultDisplayConfig={getDefaultDiscountedDisplayConfig}
        products={selectedProducts}
        discount={config.discount}
      />
    </BlockStack>
  );
}
