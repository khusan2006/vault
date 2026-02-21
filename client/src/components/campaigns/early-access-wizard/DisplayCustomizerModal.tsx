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
import {
  ThemePresetPicker,
  ThemeCardStyleSection,
  ThemeCardTypographySection,
  ThemeGridSpacingSection,
  ThemePageLayoutSection,
  ThemeSectionTypographySection,
  ThemeNotificationStyleSection,
} from "../display";
import { useDisplayConfigDraft } from "../customizer";
import { getThemeConfig } from "@/utils/display-config";
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

function getSectionPanelMeta(
  approach: EarlyAccessStorefrontApproach,
): PanelMeta {
  switch (approach) {
    case "modal":
      return {
        menuLabel: "Modal appearance",
        heading: "Modal appearance",
        description:
          "Layout, headings, and spacing for the modal content.",
      };
    case "customer_page":
      return {
        menuLabel: "Section settings",
        heading: "Section settings",
        description:
          "Layout and headings for the customer account products section.",
      };
    case "storefront_section":
    default:
      return {
        menuLabel: "Section settings",
        heading: "Section settings",
        description:
          "Layout and headings for the exclusive products section.",
      };
  }
}

function getCardsPanelMeta(
  approach: EarlyAccessStorefrontApproach,
): PanelMeta {
  switch (approach) {
    case "modal":
      return {
        menuLabel: "Product cards",
        heading: "Product cards",
        description: "Card layout and styling inside the modal.",
      };
    case "customer_page":
      return {
        menuLabel: "Product cards",
        heading: "Product cards",
        description: "Product card options for the customer account page.",
      };
    case "storefront_section":
    default:
      return {
        menuLabel: "Product cards",
        heading: "Product cards",
        description: "Card layout and styling for exclusive products.",
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
  getDefaultDisplayConfig?: () => EarlyAccessDisplayConfig;
  products?: SelectedResource[];
}

export function DisplayCustomizerModal({
  open,
  onClose,
  displayConfig,
  onDisplayConfigChange,
  approach,
  getDefaultDisplayConfig,
  products,
}: DisplayCustomizerModalProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const { draft: draftConfig, setDraft: setDraftConfig, isDirty, discard } =
    useDisplayConfigDraft(open, displayConfig);
  const [panel, setPanel] =
    useState<"menu" | "notification" | "section" | "cards">("menu");
  const previewRef = useRef<HTMLDivElement>(null);
  const themeValue = getThemeConfig(draftConfig.theme);

  const sectionPanelMeta = useMemo(
    () => getSectionPanelMeta(approach),
    [approach],
  );
  const cardsPanelMeta = useMemo(
    () => getCardsPanelMeta(approach),
    [approach],
  );

  useEffect(() => {
    if (open) {
      setPanel("menu");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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

  const handleUpdateTheme = useCallback((theme: EarlyAccessDisplayConfig["theme"]) => {
    setDraftConfig((prev) => ({ ...prev, theme }));
  }, []);

  const handleSave = useCallback(() => {
    onDisplayConfigChange(draftConfig);
    onClose();
  }, [draftConfig, onDisplayConfigChange, onClose]);

  const handleDiscard = useCallback(() => {
    discard();
  }, [discard]);

  const handleReset = useCallback(() => {
    if (!getDefaultDisplayConfig) return;
    const defaults = getDefaultDisplayConfig();
    setDraftConfig({ ...defaults, theme: draftConfig.theme });
  }, [getDefaultDisplayConfig, setDraftConfig, draftConfig.theme]);

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
              Approach: {getApproachLabel(approach)}
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
                  label="Notification"
                  description="How customers are notified"
                  onClick={() => setPanel("notification")}
                />

                <CustomizerMenuButton
                  label={sectionPanelMeta.menuLabel}
                  description={sectionPanelMeta.description}
                  onClick={() => setPanel("section")}
                />

                <CustomizerMenuButton
                  label={cardsPanelMeta.menuLabel}
                  description={cardsPanelMeta.description}
                  onClick={() => setPanel("cards")}
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

              {panel === "notification" && (
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
                  <ThemeNotificationStyleSection
                    value={themeValue}
                    onChange={handleUpdateTheme}
                    previewRef={previewRef}
                  />
                </BlockStack>
              )}

              {panel === "section" && (
                <BlockStack gap="200">
                  <Text variant="headingMd" as="h2">
                    {sectionPanelMeta.heading}
                  </Text>
                  <Text as="p" tone="subdued">
                    {sectionPanelMeta.description}
                  </Text>
                  <ThemePresetPicker
                    value={themeValue}
                    onChange={handleUpdateTheme}
                  />
                  <LandingPageConfig
                    value={draftConfig.landingPage}
                    onChange={handleUpdateLandingPage}
                    layout="plain"
                    showHeading={false}
                    grouping="flat"
                    approach={approach}
                    sections={["basics", "layout"]}
                  />
                  <ThemePageLayoutSection
                    value={themeValue}
                    onChange={handleUpdateTheme}
                    previewRef={previewRef}
                  />
                  <ThemeSectionTypographySection
                    value={themeValue}
                    onChange={handleUpdateTheme}
                    previewRef={previewRef}
                  />
                </BlockStack>
              )}

              {panel === "cards" && (
                <BlockStack gap="200">
                  <Text variant="headingMd" as="h2">
                    {cardsPanelMeta.heading}
                  </Text>
                  <Text as="p" tone="subdued">
                    {cardsPanelMeta.description}
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
                    sections={["badge", "items"]}
                  />
                  {approach !== "customer_page" && (
                    <>
                      <ThemeCardStyleSection
                        value={themeValue}
                        onChange={handleUpdateTheme}
                        previewRef={previewRef}
                        title="Card styles"
                      />
                      <ThemeCardTypographySection
                        value={themeValue}
                        onChange={handleUpdateTheme}
                        previewRef={previewRef}
                      />
                      <ThemeGridSpacingSection
                        value={themeValue}
                        onChange={handleUpdateTheme}
                        previewRef={previewRef}
                      />
                    </>
                  )}
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
