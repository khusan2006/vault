"use client";

import { useState, useCallback } from "react";
import {
  BlockStack,
  Text,
  Button,
  InlineStack,
} from "@shopify/polaris";
import { ChevronLeftIcon } from "@shopify/polaris-icons";
import type { DiscountConfig, TimerSaleDisplayConfig } from "@/types";
import type { SelectedResource } from "@/hooks/useResourcePicker";
import {
  NotificationConfig,
  ProductPageConfig,
  TimerDisplayConfigEditor,
  ThemeConfigEditor,
} from "../display";
import { StorefrontPreview } from "../preview/StorefrontPreview";
import type { HighlightZone } from "@/types/storefront-preview.types";
import { CustomizerShell } from "../customizer/CustomizerShell";
import { CustomizerPreviewPane } from "../customizer/CustomizerPreviewPane";
import { CustomizerMenuButton } from "../customizer/CustomizerMenuButton";

interface TimerSaleCustomizerModalProps {
  open: boolean;
  onClose: () => void;
  displayConfig: TimerSaleDisplayConfig;
  onDisplayConfigChange: (config: TimerSaleDisplayConfig) => void;
  onResetToDefaults?: () => void;
  products?: SelectedResource[];
  discount?: DiscountConfig;
}

export function TimerSaleCustomizerModal({
  open,
  onClose,
  displayConfig,
  onDisplayConfigChange,
  onResetToDefaults,
  products,
  discount,
}: TimerSaleCustomizerModalProps) {
  const resetKey = open ? JSON.stringify(displayConfig) : "closed";
  return (
    <TimerSaleCustomizerModalInner
      key={resetKey}
      open={open}
      onClose={onClose}
      displayConfig={displayConfig}
      onDisplayConfigChange={onDisplayConfigChange}
      onResetToDefaults={onResetToDefaults}
      products={products}
      discount={discount}
    />
  );
}

function TimerSaleCustomizerModalInner({
  open,
  onClose,
  displayConfig,
  onDisplayConfigChange,
  onResetToDefaults,
  products,
  discount,
}: TimerSaleCustomizerModalProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [draftConfig, setDraftConfig] =
    useState<TimerSaleDisplayConfig>(displayConfig);
  const [panel, setPanel] =
    useState<"menu" | "theme" | "notification" | "product" | "timer">("theme");
  const [highlightZone, setHighlightZone] = useState<HighlightZone>(null);

  const handleUpdateNotification = useCallback(
    (notification: TimerSaleDisplayConfig["notification"]) => {
      setDraftConfig((prev) => {
        const nextConfig = { ...prev, notification };
        onDisplayConfigChange(nextConfig);
        return nextConfig;
      });
    },
    [onDisplayConfigChange],
  );

  const handleUpdateProductPage = useCallback(
    (productPage: TimerSaleDisplayConfig["productPage"]) => {
      setDraftConfig((prev) => {
        const nextConfig = { ...prev, productPage };
        onDisplayConfigChange(nextConfig);
        return nextConfig;
      });
    },
    [onDisplayConfigChange],
  );

  const handleUpdateTimer = useCallback(
    (timer: TimerSaleDisplayConfig["timer"]) => {
      setDraftConfig((prev) => {
        const nextConfig = { ...prev, timer };
        onDisplayConfigChange(nextConfig);
        return nextConfig;
      });
    },
    [onDisplayConfigChange],
  );

  const handleDone = useCallback(() => {
    onDisplayConfigChange(draftConfig);
    onClose();
  }, [draftConfig, onDisplayConfigChange, onClose]);

  const handleReset = useCallback(() => {
    onResetToDefaults?.();
  }, [onResetToDefaults]);

  return (
    <CustomizerShell
      open={open}
      onClose={onClose}
      title="Customize appearance"
      onPrimaryAction={handleDone}
      sidebar={
        <BlockStack gap="500">
          <InlineStack align="space-between" blockAlign="center">
            <Text as="p" tone="subdued" variant="bodySm">
              Previewing: Timer sale
            </Text>
            {onResetToDefaults && (
              <Button size="slim" variant="plain" onClick={handleReset}>
                Reset to defaults
              </Button>
            )}
          </InlineStack>

          {panel === "menu" && (
            <BlockStack gap="200">
              <Text variant="headingMd" as="h2">
                Customize
              </Text>

              <div className="divide-y divide-[var(--p-color-border)]">
                <CustomizerMenuButton
                  label="Theme & styles"
                  onClick={() => setPanel("theme")}
                />

                <CustomizerMenuButton
                  label="Sale prompt"
                  onClick={() => setPanel("notification")}
                />

                <CustomizerMenuButton
                  label="Product page pricing"
                  onClick={() => setPanel("product")}
                />

                <CustomizerMenuButton
                  label="Countdown timer"
                  onClick={() => setPanel("timer")}
                />
              </div>
            </BlockStack>
          )}

          {panel !== "menu" && (
            <BlockStack gap="300">
              <InlineStack align="space-between" blockAlign="center">
                <Button
                  variant="plain"
                  icon={ChevronLeftIcon}
                  onClick={() => setPanel("menu")}
                >
                  Back to menu
                </Button>
              </InlineStack>

              {panel === "theme" && (
                <ThemeConfigEditor
                  value={draftConfig.theme ?? { preset: 'rounded', overrides: {} }}
                  onChange={(theme) => {
                    const next = { ...draftConfig, theme };
                    setDraftConfig(next);
                    onDisplayConfigChange(next);
                  }}
                  onHighlightChange={(zone) => setHighlightZone(zone as HighlightZone)}
                />
              )}

              {panel === "notification" && (
                <BlockStack gap="200">
                  <Text variant="headingMd" as="h2">
                    Sale prompt
                  </Text>
                  <Text as="p" tone="subdued">
                    Control the announcement customers see on the storefront.
                  </Text>
                  <NotificationConfig
                    value={draftConfig.notification}
                    onChange={handleUpdateNotification}
                    layout="plain"
                    showHeading={false}
                    grouping="flat"
                  />
                </BlockStack>
              )}

              {panel === "product" && (
                <BlockStack gap="200">
                  <Text variant="headingMd" as="h2">
                    Product page pricing
                  </Text>
                  <Text as="p" tone="subdued">
                    Configure how timed pricing appears on product pages.
                  </Text>
                  <ProductPageConfig
                    value={draftConfig.productPage}
                    onChange={handleUpdateProductPage}
                    layout="plain"
                    showHeading={false}
                  />
                </BlockStack>
              )}

              {panel === "timer" && (
                <BlockStack gap="200">
                  <Text variant="headingMd" as="h2">
                    Countdown timer
                  </Text>
                  <Text as="p" tone="subdued">
                    Control how the countdown timer appears next to the
                    product.
                  </Text>
                  <TimerDisplayConfigEditor
                    value={draftConfig.timer}
                    onChange={handleUpdateTimer}
                    layout="plain"
                    showHeading={false}
                  />
                </BlockStack>
              )}
            </BlockStack>
          )}
        </BlockStack>
      }
      preview={
        <CustomizerPreviewPane
          device={device}
          onDeviceChange={setDevice}
        >
          <StorefrontPreview
            config={draftConfig}
            device={device}
            products={products}
            view="product"
            discount={discount}
            highlightZone={highlightZone}
          />
        </CustomizerPreviewPane>
      }
    />
  );
}
