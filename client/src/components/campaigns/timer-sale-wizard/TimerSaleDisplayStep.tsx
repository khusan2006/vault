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
  TimerSaleConfig,
  TimerSaleDisplayConfig,
  NotificationDisplayConfig,
  ProductPageDisplayConfig,
  TimerDisplayConfig,
} from "@/types";
import type { CampaignFormState } from "@/hooks/useCampaignForm";
import type { SelectedResource } from "@/hooks/useResourcePicker";
import { TimerSaleCustomizerModal } from "./TimerSaleCustomizerModal";

const DEFAULT_NOTIFICATION: NotificationDisplayConfig = {
  type: "banner",
  message: "Limited-time price for qualifying customers!",
  buttonText: "Shop the sale",
  buttonUrl: "/collections/timer-sale",
  visuals: { primaryColor: "#b91c1c", textColor: "#ffffff", position: "top" },
  behavior: { autoDismissSeconds: null, showFrequency: "once_per_day" },
};

const DEFAULT_PRODUCT_PAGE: ProductPageDisplayConfig = {
  showStrikethroughPricing: true,
  discountBadge: { enabled: true, text: "Sale price", color: "#b91c1c" },
  banner: null,
};

const DEFAULT_TIMER_DISPLAY: TimerDisplayConfig = {
  timerType: "per_customer",
  position: "above_add_to_cart",
  expiredMessage: "This offer has expired",
  style: "urgent",
};

function buildDefaultDisplayConfig(timerType: TimerSaleConfig["timerType"]): TimerSaleDisplayConfig {
  return {
    notification: { ...DEFAULT_NOTIFICATION },
    productPage: { ...DEFAULT_PRODUCT_PAGE },
    timer: { ...DEFAULT_TIMER_DISPLAY, timerType },
  };
}

function toTitle(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

interface TimerSaleDisplayStepProps {
  formState: CampaignFormState;
  onFieldChange: <K extends keyof CampaignFormState>(
    field: K,
    value: CampaignFormState[K],
  ) => void;
  selectedProducts: SelectedResource[];
}

export function TimerSaleDisplayStep({
  formState,
  onFieldChange,
  selectedProducts,
}: TimerSaleDisplayStepProps) {
  const config = formState.config as TimerSaleConfig;
  const [showCustomize, setShowCustomize] = useState(false);

  const updateConfig = useCallback(
    (updates: Partial<TimerSaleConfig>) => {
      onFieldChange("config", { ...config, ...updates } as CampaignConfig);
    },
    [config, onFieldChange],
  );

  useEffect(() => {
    if (!config.displayConfig) {
      updateConfig({
        displayConfig: buildDefaultDisplayConfig(config.timerType),
      });
    }
  }, [config.displayConfig, config.timerType, updateConfig]);

  const handleUpdateDisplayConfig = useCallback(
    (updates: Partial<TimerSaleDisplayConfig>) => {
      const current = config.displayConfig;
      if (!current) return;
      updateConfig({ displayConfig: { ...current, ...updates } });
    },
    [config.displayConfig, updateConfig],
  );

  const handleResetDefaults = useCallback(() => {
    updateConfig({
      displayConfig: buildDefaultDisplayConfig(config.timerType),
    });
  }, [config.timerType, updateConfig]);

  const summary = useMemo(() => {
    if (!config.displayConfig) return null;
    const { notification, productPage, timer } = config.displayConfig;

    const notificationSummary = [
      toTitle(notification.type),
      notification.type === "banner" || notification.type === "toast"
        ? toTitle(notification.visuals.position)
        : null,
    ]
      .filter(Boolean)
      .join(" · ");

    const productSummary = [
      productPage.showStrikethroughPricing ? "Strikethrough" : "Standard price",
      productPage.discountBadge.enabled ? "Badge on" : "Badge off",
      productPage.banner ? "Banner on" : "No banner",
    ].join(" · ");

    const timerSummary = [
      toTitle(timer.position),
      toTitle(timer.style),
    ].join(" · ");

    return { notificationSummary, productSummary, timerSummary };
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
                Fine-tune how the timer sale appears on your storefront.
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
            Click &quot;Customize&quot; to adjust the sale prompt, product page
            pricing, and countdown timer with a live preview.
          </Banner>

          {summary && (
            <BlockStack gap="200">
              <Text as="p" variant="bodySm" fontWeight="semibold">
                Current settings
              </Text>
              <BlockStack gap="100">
                <Text as="p" variant="bodySm" tone="subdued">
                  Sale prompt: {summary.notificationSummary}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Product page: {summary.productSummary}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Countdown timer: {summary.timerSummary}
                </Text>
              </BlockStack>
            </BlockStack>
          )}
        </BlockStack>
      </Card>

      <TimerSaleCustomizerModal
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
