"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  BlockStack,
  Text,
  Button,
  InlineStack,
} from "@shopify/polaris";
import { ChevronLeftIcon } from "@shopify/polaris-icons";
import type { DiscountConfig, DiscountedProductDisplayConfig } from "@/types";
import type { SelectedResource } from "@/features/campaigns/hooks/useResourcePicker";
import {
  NotificationConfig,
  LandingPageConfig,
  ProductPageConfig,
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

interface DiscountedProductCustomizerModalProps {
  open: boolean;
  onClose: () => void;
  displayConfig: DiscountedProductDisplayConfig;
  onDisplayConfigChange: (config: DiscountedProductDisplayConfig) => void;
  getDefaultDisplayConfig?: () => DiscountedProductDisplayConfig;
  products?: SelectedResource[];
  discount?: DiscountConfig;
}

export function DiscountedProductCustomizerModal({
  open,
  onClose,
  displayConfig,
  onDisplayConfigChange,
  getDefaultDisplayConfig,
  products,
  discount,
}: DiscountedProductCustomizerModalProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const { draft: draftConfig, setDraft: setDraftConfig, isDirty, discard } =
    useDisplayConfigDraft(open, displayConfig);
  const [panel, setPanel] =
    useState<"menu" | "theme" | "notification" | "landing" | "product">("menu");
  const previewRef = useRef<HTMLDivElement>(null);
  const themeValue = getThemeConfig(draftConfig.theme);

  useEffect(() => {
    if (open) {
      setPanel("menu");
    }
  }, [open]);

  const handleUpdateNotification = useCallback(
    (notification: DiscountedProductDisplayConfig["notification"]) => {
      setDraftConfig((prev) => ({ ...prev, notification }));
    },
    [setDraftConfig],
  );

  const handleUpdateLandingPage = useCallback(
    (landingPage: DiscountedProductDisplayConfig["landingPage"]) => {
      setDraftConfig((prev) => ({ ...prev, landingPage }));
    },
    [setDraftConfig],
  );

  const handleUpdateProductPage = useCallback(
    (productPage: DiscountedProductDisplayConfig["productPage"]) => {
      setDraftConfig((prev) => ({ ...prev, productPage }));
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
      primaryActionLabel="Save"
      onPrimaryAction={handleSave}
      secondaryActionLabel={isDirty ? "Discard" : undefined}
      onSecondaryAction={isDirty ? handleDiscard : undefined}
      sidebar={
        <BlockStack gap="500">
          <InlineStack align="space-between" blockAlign="center">
            <Text as="p" tone="subdued" variant="bodySm">
              Previewing: Discounted pricing
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
                  label="Notification"
                  description="How customers are notified about offers"
                  onClick={() => setPanel("notification")}
                />

                <CustomizerMenuButton
                  label="Exclusive landing page"
                  onClick={() => setPanel("landing")}
                />

                <CustomizerMenuButton
                  label="Product page pricing"
                  onClick={() => setPanel("product")}
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
            previewRef={previewRef}
          />
        </CustomizerPreviewPane>
      }
    />
  );
}
