"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  BlockStack,
  Text,
  Button,
  InlineStack,
  Banner,
} from "@shopify/polaris";
import { ChevronLeftIcon } from "@shopify/polaris-icons";
import type {
  EarlyAccessDisplayConfig,
  EarlyAccessStorefrontApproach,
} from "@/types";
import type { SelectedResource } from "@/hooks/useResourcePicker";
import { NotificationConfig } from "../display/NotificationConfig";
import { LandingPageConfig } from "../display/LandingPageConfig";
import { ThemeConfigEditor } from "../display";
import { StorefrontPreview } from "../preview/StorefrontPreview";
import { CustomizerShell } from "../customizer/CustomizerShell";
import { CustomizerPreviewPane } from "../customizer/CustomizerPreviewPane";
import { CustomizerMenuButton } from "../customizer/CustomizerMenuButton";

// =============================================================================
// Approach-aware labels & descriptions
// =============================================================================

interface PanelMeta {
  menuLabel: string;
  heading: string;
  description: string;
}

function getProductsPanelMeta(approach: EarlyAccessStorefrontApproach): PanelMeta {
  switch (approach) {
    case "customer_page":
      return {
        menuLabel: "Customer page",
        heading: "Customer page",
        description: "Settings for the customer account products page.",
      };
    case "modal":
      return {
        menuLabel: "Modal content",
        heading: "Modal content",
        description:
          "Configure the product popup that opens when customers click the notification.",
      };
    case "storefront_section":
    default:
      return {
        menuLabel: "Product page",
        heading: "Product page",
        description:
          "Configure the landing page layout, heading, and product cards.",
      };
  }
}

function getApproachLabel(approach: EarlyAccessStorefrontApproach): string {
  switch (approach) {
    case "modal":
      return "Pop-up modal";
    case "storefront_section":
      return "Storefront section";
    case "customer_page":
      return "Customer page";
    default:
      return approach;
  }
}

// =============================================================================
// Component
// =============================================================================

interface DisplayCustomizerModalProps {
  open: boolean;
  onClose: () => void;
  displayConfig: EarlyAccessDisplayConfig;
  onDisplayConfigChange: (config: EarlyAccessDisplayConfig) => void;
  approach: EarlyAccessStorefrontApproach;
  onResetToDefaults?: () => void;
  products?: SelectedResource[];
}

export function DisplayCustomizerModal({
  open,
  onClose,
  displayConfig,
  onDisplayConfigChange,
  approach,
  onResetToDefaults,
  products,
}: DisplayCustomizerModalProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [draftConfig, setDraftConfig] =
    useState<EarlyAccessDisplayConfig>(displayConfig);
  const [panel, setPanel] = useState<"menu" | "theme" | "prompt" | "landing">("menu");
  const previewRef = useRef<HTMLDivElement>(null);

  const productsPanelMeta = useMemo(
    () => getProductsPanelMeta(approach),
    [approach],
  );

  useEffect(() => {
    if (open) {
      setDraftConfig(displayConfig);
      setPanel("menu");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const hasChanges =
    JSON.stringify(draftConfig) !== JSON.stringify(displayConfig);

  const handleUpdateNotification = useCallback(
    (notification: EarlyAccessDisplayConfig["notification"]) => {
      setDraftConfig((prev) => ({ ...prev, notification }));
    },
    [],
  );

  const handleUpdateLandingPage = useCallback(
    (landingPage: EarlyAccessDisplayConfig["landingPage"]) => {
      setDraftConfig((prev) => ({ ...prev, landingPage }));
    },
    [],
  );

  const handleSave = useCallback(() => {
    onDisplayConfigChange(draftConfig);
    onClose();
  }, [draftConfig, onDisplayConfigChange, onClose]);

  const handleDiscard = useCallback(() => {
    setDraftConfig(displayConfig);
  }, [displayConfig]);

  const handleReset = useCallback(() => {
    onResetToDefaults?.();
  }, [onResetToDefaults]);

  return (
    <CustomizerShell
      open={open}
      onClose={onClose}
      title="Customize appearance"
      primaryActionLabel="Save"
      onPrimaryAction={handleSave}
      secondaryActionLabel={hasChanges ? "Discard" : undefined}
      onSecondaryAction={hasChanges ? handleDiscard : undefined}
      sidebar={
        <BlockStack gap="500">
          <InlineStack align="space-between" blockAlign="center">
            <Text as="p" tone="subdued" variant="bodySm">
              Approach: {getApproachLabel(approach)}
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
                  description="Colors, presets, and typography"
                  onClick={() => setPanel("theme")}
                />

                <CustomizerMenuButton
                  label="Notification"
                  description="How customers are notified"
                  onClick={() => setPanel("prompt")}
                />

                <CustomizerMenuButton
                  label={productsPanelMeta.menuLabel}
                  description={productsPanelMeta.description}
                  onClick={() => setPanel("landing")}
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
                    setDraftConfig((prev) => ({ ...prev, theme }));
                  }}
                  previewRef={previewRef}
                />
              )}

              {panel === "prompt" && (
                <BlockStack gap="200">
                  <Text variant="headingMd" as="h2">
                    Notification
                  </Text>
                  <Text as="p" tone="subdued">
                    How customers are notified about exclusive access.
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
                    {productsPanelMeta.heading}
                  </Text>
                  <Text as="p" tone="subdued">
                    {productsPanelMeta.description}
                  </Text>
                  {approach === "customer_page" && (
                    <Banner tone="info">
                      Product card styling is managed by Shopify's customer
                      account theme. Only layout and text settings apply here.
                    </Banner>
                  )}
                  <LandingPageConfig
                    value={draftConfig.landingPage}
                    onChange={handleUpdateLandingPage}
                    layout="plain"
                    showHeading={false}
                    grouping="flat"
                    approach={approach}
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
            previewRef={previewRef}
            approach={approach}
          />
        </CustomizerPreviewPane>
      }
    />
  );
}
