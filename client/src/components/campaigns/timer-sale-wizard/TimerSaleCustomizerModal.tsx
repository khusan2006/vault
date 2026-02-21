"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
import {
  CustomizerShell,
  CustomizerPreviewPane,
  CustomizerMenuButton,
  useDisplayConfigDraft,
} from "../customizer";
import { getThemeConfig } from "@/utils/display-config";

interface TimerSaleCustomizerModalProps {
  open: boolean;
  onClose: () => void;
  displayConfig: TimerSaleDisplayConfig;
  onDisplayConfigChange: (config: TimerSaleDisplayConfig) => void;
  getDefaultDisplayConfig?: () => TimerSaleDisplayConfig;
  products?: SelectedResource[];
  discount?: DiscountConfig;
}

export function TimerSaleCustomizerModal({
  open,
  onClose,
  displayConfig,
  onDisplayConfigChange,
  getDefaultDisplayConfig,
  products,
  discount,
}: TimerSaleCustomizerModalProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const { draft: draftConfig, setDraft: setDraftConfig, isDirty, discard } =
    useDisplayConfigDraft(open, displayConfig);
  const [panel, setPanel] =
    useState<"menu" | "theme" | "notification" | "product" | "timer" >("menu");
  const previewRef = useRef<HTMLDivElement>(null);
  const themeValue = getThemeConfig(draftConfig.theme);

  useEffect(() => {
    if (open) {
      setPanel("menu");
    }
  }, [open]);
  const handleUpdateNotification = useCallback(
    (notification: TimerSaleDisplayConfig["notification"]) => {
      setDraftConfig((prev) => ({ ...prev, notification }));
    },
    [setDraftConfig],
  );

  const handleUpdateProductPage = useCallback(
    (productPage: TimerSaleDisplayConfig["productPage"]) => {
      setDraftConfig((prev) => ({ ...prev, productPage }));
    },
    [setDraftConfig],
  );

  const handleUpdateTimer = useCallback(
    (timer: TimerSaleDisplayConfig["timer"]) => {
      setDraftConfig((prev) => ({ ...prev, timer }));
    },
    [setDraftConfig],
  );

  const handleSave = useCallback(() => {
    onDisplayConfigChange(draftConfig);
    onClose();
  }, [draftConfig, onDisplayConfigChange, onClose]);

  const handleReset = useCallback(() => {
    if (!getDefaultDisplayConfig) return;
    const defaults = getDefaultDisplayConfig();
    setDraftConfig({ ...defaults, theme: draftConfig.theme });
  }, [getDefaultDisplayConfig, setDraftConfig, draftConfig.theme]);

  const handleDiscard = useCallback(() => {
    discard();
  }, [discard]);

  return (
    <CustomizerShell
      open={open}
      onClose={onClose}
      title="Customize appearance"
      primaryActionLabel="Save"
      onPrimaryAction={handleSave}
      secondaryActionLabel={isDirty ? "Discard" : undefined}
      onSecondaryAction={isDirty ? handleDiscard : undefined}
      sidebar={
        <BlockStack gap="500">
          <InlineStack align="space-between" blockAlign="center">
            <Text as="p" tone="subdued" variant="bodySm">
              Previewing: Timer sale
            </Text>
            {getDefaultDisplayConfig && (
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
                  value={themeValue}
                  onChange={(theme) => {
                    const next = { ...draftConfig, theme };
                    setDraftConfig(next);
                  }}
                  previewRef={previewRef}
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
            previewRef={previewRef}
          />
        </CustomizerPreviewPane>
      }
    />
  );
}
