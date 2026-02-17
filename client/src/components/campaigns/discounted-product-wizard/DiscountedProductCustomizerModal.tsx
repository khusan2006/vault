"use client";

import { useState, useCallback, useMemo } from "react";
import {
  BlockStack,
  Text,
  Button,
  Divider,
  InlineStack,
} from "@shopify/polaris";
import { ChevronLeftIcon } from "@shopify/polaris-icons";
import type { DiscountConfig, DiscountedProductDisplayConfig } from "@/types";
import type { SelectedResource } from "@/hooks/useResourcePicker";
import {
  NotificationConfig,
  LandingPageConfig,
  ProductPageConfig,
  ThemeConfigEditor,
} from "../display";
import { StorefrontPreview } from "../preview/StorefrontPreview";
import { CustomizerShell } from "../customizer/CustomizerShell";
import { CustomizerPreviewPane } from "../customizer/CustomizerPreviewPane";
import { CustomizerMenuButton } from "../customizer/CustomizerMenuButton";

interface DiscountedProductCustomizerModalProps {
  open: boolean;
  onClose: () => void;
  displayConfig: DiscountedProductDisplayConfig;
  onDisplayConfigChange: (config: DiscountedProductDisplayConfig) => void;
  onResetToDefaults?: () => void;
  products?: SelectedResource[];
  discount?: DiscountConfig;
}

export function DiscountedProductCustomizerModal({
  open,
  onClose,
  displayConfig,
  onDisplayConfigChange,
  onResetToDefaults,
  products,
  discount,
}: DiscountedProductCustomizerModalProps) {
  const resetKey = open ? JSON.stringify(displayConfig) : "closed";
  return (
    <DiscountedProductCustomizerModalInner
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

function DiscountedProductCustomizerModalInner({
  open,
  onClose,
  displayConfig,
  onDisplayConfigChange,
  onResetToDefaults,
  products,
  discount,
}: DiscountedProductCustomizerModalProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [draftConfig, setDraftConfig] =
    useState<DiscountedProductDisplayConfig>(displayConfig);
  const [panel, setPanel] =
    useState<"menu" | "theme" | "notification" | "landing" | "product">("theme");

  const handleUpdateNotification = useCallback(
    (notification: DiscountedProductDisplayConfig["notification"]) => {
      setDraftConfig((prev) => {
        const nextConfig = { ...prev, notification };
        onDisplayConfigChange(nextConfig);
        return nextConfig;
      });
    },
    [onDisplayConfigChange],
  );

  const handleUpdateLandingPage = useCallback(
    (landingPage: DiscountedProductDisplayConfig["landingPage"]) => {
      setDraftConfig((prev) => {
        const nextConfig = { ...prev, landingPage };
        onDisplayConfigChange(nextConfig);
        return nextConfig;
      });
    },
    [onDisplayConfigChange],
  );

  const handleUpdateProductPage = useCallback(
    (productPage: DiscountedProductDisplayConfig["productPage"]) => {
      setDraftConfig((prev) => {
        const nextConfig = { ...prev, productPage };
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

  const previewView = useMemo(() => {
    if (panel === "landing") return "landing" as const;
    if (panel === "product") return "product" as const;
    return draftConfig.landingPage.enabled ? "landing" : "product";
  }, [panel, draftConfig.landingPage.enabled]);

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
              Previewing: Discounted pricing
            </Text>
            {onResetToDefaults && (
              <Button size="slim" variant="plain" onClick={handleReset}>
                Reset to defaults
              </Button>
            )}
          </InlineStack>

          {panel === "menu" && (
            <BlockStack gap="050">
              <Text variant="headingMd" as="h2">
                Customize
              </Text>

              <CustomizerMenuButton
                label="Theme & styles"
                onClick={() => setPanel("theme")}
              />

              <Divider />

              <CustomizerMenuButton
                label="Offer prompt"
                onClick={() => setPanel("notification")}
              />

              <Divider />

              <CustomizerMenuButton
                label="Exclusive landing page"
                onClick={() => setPanel("landing")}
              />

              <Divider />

              <CustomizerMenuButton
                label="Product page pricing"
                onClick={() => setPanel("product")}
              />
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
                />
              )}

              {panel === "notification" && (
                <BlockStack gap="200">
                  <Text variant="headingMd" as="h2">
                    Offer prompt
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

              {panel === "landing" && (
                <BlockStack gap="200">
                  <Text variant="headingMd" as="h2">
                    Exclusive landing page
                  </Text>
                  <Text as="p" tone="subdued">
                    Customize the landing page layout, headings, and badges.
                  </Text>
                  <LandingPageConfig
                    value={draftConfig.landingPage}
                    onChange={handleUpdateLandingPage}
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
                    Configure how discounted pricing appears on product pages.
                  </Text>
                  <ProductPageConfig
                    value={draftConfig.productPage}
                    onChange={handleUpdateProductPage}
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
            view={previewView}
            discount={discount}
          />
        </CustomizerPreviewPane>
      }
    />
  );
}
