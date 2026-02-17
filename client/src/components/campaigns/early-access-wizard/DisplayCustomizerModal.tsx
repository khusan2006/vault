"use client";

import { useState, useCallback, useEffect } from "react";
import {
  BlockStack,
  Text,
  Button,
  Divider,
  InlineStack,
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
  const [panel, setPanel] = useState<"menu" | "theme" | "prompt" | "landing">("theme");


  // Keep draft in sync when modal opens or when parent config changes.
  // Keep draft in sync when modal opens.
  // We do NOT want to reset on displayConfig change, because that happens
  // on every keystroke/edit in the child components, which would reset the panel.
  useEffect(() => {
    if (open) {
      setDraftConfig(displayConfig);
      setPanel("theme");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleUpdateNotification = useCallback(
    (notification: EarlyAccessDisplayConfig["notification"]) => {
      const nextConfig = { ...draftConfig, notification };
      setDraftConfig(nextConfig);
      onDisplayConfigChange(nextConfig);
    },
    [draftConfig, onDisplayConfigChange],
  );

  const handleUpdateLandingPage = useCallback(
    (landingPage: EarlyAccessDisplayConfig["landingPage"]) => {
      const nextConfig = { ...draftConfig, landingPage };
      setDraftConfig(nextConfig);
      onDisplayConfigChange(nextConfig);
    },
    [draftConfig, onDisplayConfigChange],
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
              Previewing:{" "}
              {approach === "modal"
                ? "Pop-up modal"
                : approach === "storefront_section"
                  ? "Storefront banner"
                  : "Customer page"}
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
                label="Access prompt"
                onClick={() => setPanel("prompt")}
              />

              <Divider />

              <CustomizerMenuButton
                label="Exclusive landing page"
                onClick={() => setPanel("landing")}
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

              {panel === "prompt" && (
                <BlockStack gap="200">
                  <Text variant="headingMd" as="h2">
                    Access prompt
                  </Text>
                  <Text as="p" tone="subdued">
                    Choose how to announce early access and what customers will
                    see.
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
                    Customize the page layout, heading, and badges.
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
          />
        </CustomizerPreviewPane>
      }
    />
  );
}
