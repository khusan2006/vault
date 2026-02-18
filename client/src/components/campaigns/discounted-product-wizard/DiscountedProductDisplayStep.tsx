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
  NotificationDisplayConfig,
  LandingPageDisplayConfig,
  ProductPageDisplayConfig,
} from "@/types";
import type { CampaignFormState } from "@/hooks/useCampaignForm";
import type { SelectedResource } from "@/hooks/useResourcePicker";
import { DiscountedProductCustomizerModal } from "./DiscountedProductCustomizerModal";

const DEFAULT_NOTIFICATION: NotificationDisplayConfig = {
  type: "banner",
  message: "Member pricing unlocked just for you!",
  buttonText: "Shop discounted items",
  buttonUrl: "/collections/discounted",
  visuals: { primaryColor: "#0f766e", textColor: "#ffffff", position: "top" },
  behavior: { autoDismissSeconds: null, showFrequency: "once_per_day" },
};

const DEFAULT_LANDING_PAGE: LandingPageDisplayConfig = {
  enabled: true,
  heading: "Member pricing",
  subheading: "Exclusive discounted products for qualifying customers",
  gridColumns: 3,
  badgeText: "Member price",
  badgeColor: "#0f766e",
  itemLayout: "card",
  showAddToCart: true,
  showCategory: true,
  showCompareAt: true,
  showRatings: true,
};

const DEFAULT_PRODUCT_PAGE: ProductPageDisplayConfig = {
  showStrikethroughPricing: true,
  discountBadge: { enabled: true, text: "Member price", color: "#0f766e" },
  banner: null,
};

function buildDefaultDisplayConfig(): DiscountedProductDisplayConfig {
  return {
    notification: { ...DEFAULT_NOTIFICATION },
    landingPage: { ...DEFAULT_LANDING_PAGE },
    productPage: { ...DEFAULT_PRODUCT_PAGE },
  };
}

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
    if (!config.displayConfig) {
      updateConfig({ displayConfig: buildDefaultDisplayConfig() });
    }
  }, [config.displayConfig, updateConfig]);

  const handleUpdateDisplayConfig = useCallback(
    (updates: Partial<DiscountedProductDisplayConfig>) => {
      const current = config.displayConfig;
      if (!current) return;
      updateConfig({ displayConfig: { ...current, ...updates } });
    },
    [config.displayConfig, updateConfig],
  );

  const handleResetDefaults = useCallback(() => {
    updateConfig({ displayConfig: buildDefaultDisplayConfig() });
  }, [updateConfig]);

  const summary = useMemo(() => {
    if (!config.displayConfig) return null;
    const { notification, landingPage, productPage } = config.displayConfig;

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
  }, [config.displayConfig]);

  if (!config.displayConfig) return null;

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
        displayConfig={config.displayConfig}
        onDisplayConfigChange={(newConfig) =>
          handleUpdateDisplayConfig(newConfig)
        }
        onResetToDefaults={handleResetDefaults}
        products={selectedProducts}
        discount={config.discount}
      />
    </BlockStack>
  );
}
