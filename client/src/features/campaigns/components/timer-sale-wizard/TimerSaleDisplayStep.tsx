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
} from "@/types";
import type { CampaignFormState } from "@/features/campaigns/hooks/useCampaignForm";
import type { SelectedResource } from "@/features/campaigns/hooks/useResourcePicker";
import { TimerSaleCustomizerModal } from "./TimerSaleCustomizerModal";
import {
  ensureTimerSaleDisplayConfig,
  getDefaultTimerSaleDisplayConfig,
} from "@/utils/display-config";

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
    const normalized = ensureTimerSaleDisplayConfig(
      config.timerType,
      config.displayConfig,
    );
    if (!config.displayConfig) {
      updateConfig({ displayConfig: normalized });
      return;
    }
    if (JSON.stringify(normalized) !== JSON.stringify(config.displayConfig)) {
      updateConfig({ displayConfig: normalized });
    }
  }, [config.displayConfig, config.timerType, updateConfig]);

  const normalizedDisplayConfig = useMemo(
    () => ensureTimerSaleDisplayConfig(config.timerType, config.displayConfig),
    [config.timerType, config.displayConfig],
  );

  const handleUpdateDisplayConfig = useCallback(
    (updates: Partial<TimerSaleDisplayConfig>) => {
      const current = normalizedDisplayConfig;
      if (!current) return;
      updateConfig({ displayConfig: { ...current, ...updates } });
    },
    [normalizedDisplayConfig, updateConfig],
  );

  const handleResetDefaults = useCallback(() => {
    const defaults = getDefaultTimerSaleDisplayConfig(config.timerType);
    updateConfig({
      displayConfig: { ...defaults, theme: config.displayConfig?.theme },
    });
  }, [config.timerType, config.displayConfig?.theme, updateConfig]);

  const summary = useMemo(() => {
    if (!normalizedDisplayConfig) return null;
    const { notification, productPage, timer } = normalizedDisplayConfig;

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
        displayConfig={normalizedDisplayConfig}
        onDisplayConfigChange={(newConfig) =>
          handleUpdateDisplayConfig(newConfig)
        }
        getDefaultDisplayConfig={() =>
          getDefaultTimerSaleDisplayConfig(config.timerType)
        }
        products={selectedProducts}
        discount={config.discount}
      />
    </BlockStack>
  );
}
