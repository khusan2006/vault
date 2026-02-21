"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BlockStack,
  InlineStack,
  Text,
  Button,
  Banner,
  Card,
  Icon,
} from "@shopify/polaris";
import {
  PersonIcon,
  HomeIcon,
  LayoutPopupIcon,
  EditIcon,
  RefreshIcon,
  DesktopIcon,
  MobileIcon,
} from "@shopify/polaris-icons";
import type {
  EarlyAccessConfig,
  EarlyAccessStorefrontApproach,
  CampaignConfig,
  EarlyAccessDisplayConfig,
} from "@/types";
import type { CampaignFormState } from "@/hooks/useCampaignForm";
import type { SelectedResource } from "@/hooks/useResourcePicker";
import { DisplayCustomizerModal } from "./DisplayCustomizerModal";
import { StorefrontPreview } from "../preview/StorefrontPreview";
import {
  ensureEarlyAccessDisplayConfig,
  getDefaultEarlyAccessDisplayConfig,
} from "@/utils/display-config";

// =============================================================================
// Constants
// =============================================================================

interface ApproachOption {
  id: EarlyAccessStorefrontApproach;
  icon: typeof PersonIcon;
  title: string;
  description: string;
  details: string[];
  gradientClassName: string;
  iconTone: "info" | "success" | "caution";
}

const APPROACH_OPTIONS: ApproachOption[] = [
  {
    id: "customer_page",
    icon: PersonIcon,
    title: "Customer account page",
    description:
      "Show exclusive products in a dedicated section within the customer's account.",
    details: [
      "Products appear in the customer account area",
      "Customers navigate to their account to browse",
      "Clean, dedicated browsing experience",
    ],
    gradientClassName: "bg-gradient-to-br from-[#ede9fe] to-[#c4b5fd]",
    iconTone: "info",
  },
  {
    id: "storefront_section",
    icon: HomeIcon,
    title: "Home & product pages",
    description:
      "Display early access products as a banner or section on your storefront.",
    details: [
      "Banner or section on home/product pages",
      "Immediately visible to qualifying customers",
      "High visibility, great for promotions",
    ],
    gradientClassName: "bg-gradient-to-br from-[#dcfce7] to-[#86efac]",
    iconTone: "success",
  },
  {
    id: "modal",
    icon: LayoutPopupIcon,
    title: "Pop-up modal",
    description:
      "Show exclusive products in a popup overlay. Customers click a notification to browse products without leaving the page.",
    details: [
      "Products displayed in a modal popup",
      "Notification CTA opens the product gallery",
      "Great for showcasing without page navigation",
    ],
    gradientClassName: "bg-gradient-to-br from-[#fef3c7] to-[#fbbf24]",
    iconTone: "caution",
  },
];

// =============================================================================
// Helpers
// =============================================================================

function toTitle(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

// =============================================================================
// Types
// =============================================================================

interface StorefrontStepProps {
  formState: CampaignFormState;
  onFieldChange: <K extends keyof CampaignFormState>(
    field: K,
    value: CampaignFormState[K],
  ) => void;
  selectedProducts: SelectedResource[];
  approachColumns?: 2 | 3;
  showInlinePreview?: boolean;
}

// =============================================================================
// Approach card component
// =============================================================================

function ApproachCard({
  option,
  selected,
  onSelect,
}: {
  option: ApproachOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      className={`flex cursor-pointer flex-col overflow-hidden rounded-[var(--p-border-radius-300)] bg-[var(--p-color-bg-surface)] transition-[box-shadow,transform] duration-200 ease-out focus-visible:outline-none ${
        selected
          ? "shadow-[0_0_0_2px_var(--p-color-border-brand)] -translate-y-[2px]"
          : "shadow-[var(--p-shadow-100)] hover:shadow-[var(--p-shadow-300)] hover:-translate-y-[2px] focus-visible:shadow-[var(--p-shadow-300)]"
      }`}
    >
      {/* Gradient header with icon */}
      <div
        className={`relative flex items-center justify-center p-6 ${option.gradientClassName}`}
      >
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white/85"
        >
          <Icon source={option.icon} tone={option.iconTone} />
        </div>

        {/* Selection indicator */}
        {selected && (
          <div
            className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--p-color-bg-fill-brand)]"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.5 3.5L5.5 10.5L2.5 7.5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className="flex flex-1 flex-col gap-[var(--p-space-300)] p-[var(--p-space-400)]"
      >
        <BlockStack gap="100">
          <Text variant="headingMd" as="h3">
            {option.title}
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            {option.description}
          </Text>
        </BlockStack>

        <BlockStack gap="150">
          {option.details.map((detail) => (
            <InlineStack key={detail} gap="200" blockAlign="start">
              <div
                className="mt-[6px] h-[6px] w-[6px] shrink-0 rounded-full bg-[var(--p-color-icon-subdued)]"
              />
              <Text as="p" variant="bodySm" tone="subdued">
                {detail}
              </Text>
            </InlineStack>
          ))}
        </BlockStack>
      </div>
    </div>
  );
}

// =============================================================================
// Main component
// =============================================================================

export function StorefrontStep({
  formState,
  onFieldChange,
  selectedProducts,
  approachColumns = 3,
  showInlinePreview = true,
}: StorefrontStepProps) {
  const config = formState.config as EarlyAccessConfig;
  const selectedApproach = config.storefrontApproach ?? null;
  const [showCustomize, setShowCustomize] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">(
    "desktop",
  );

  const updateConfig = useCallback(
    (updates: Partial<EarlyAccessConfig>) => {
      onFieldChange("config", { ...config, ...updates } as CampaignConfig);
    },
    [config, onFieldChange],
  );

  const handleSelectApproach = useCallback(
    (approach: EarlyAccessStorefrontApproach) => {
      const defaults = getDefaultEarlyAccessDisplayConfig(approach);
      updateConfig({
        storefrontApproach: approach,
        displayConfig: { ...defaults, theme: config.displayConfig?.theme },
      });
      setShowCustomize(false);
    },
    [config.displayConfig?.theme, updateConfig],
  );

  const normalizedDisplayConfig = useMemo(() => {
    if (!selectedApproach) return null;
    return ensureEarlyAccessDisplayConfig(
      selectedApproach,
      config.displayConfig ?? undefined,
    );
  }, [selectedApproach, config.displayConfig]);

  useEffect(() => {
    if (!selectedApproach || !normalizedDisplayConfig) return;
    if (!config.displayConfig) {
      updateConfig({ displayConfig: normalizedDisplayConfig });
      return;
    }
    if (
      JSON.stringify(normalizedDisplayConfig) !==
      JSON.stringify(config.displayConfig)
    ) {
      updateConfig({ displayConfig: normalizedDisplayConfig });
    }
  }, [selectedApproach, normalizedDisplayConfig, config.displayConfig, updateConfig]);

  const handleUpdateDisplayConfig = useCallback(
    (updates: Partial<EarlyAccessDisplayConfig>) => {
      const current = normalizedDisplayConfig ?? config.displayConfig;
      if (!current) return;
      updateConfig({
        displayConfig: { ...current, ...updates },
      });
    },
    [config.displayConfig, normalizedDisplayConfig, updateConfig],
  );

  const handleResetDefaults = useCallback(() => {
    if (!selectedApproach) return;
    const defaults = getDefaultEarlyAccessDisplayConfig(selectedApproach);
    updateConfig({
      displayConfig: { ...defaults, theme: config.displayConfig?.theme },
    });
  }, [selectedApproach, config.displayConfig?.theme, updateConfig]);

  const summary = useMemo(() => {
    if (!normalizedDisplayConfig) return null;
    const { notification, landingPage } = normalizedDisplayConfig;

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

    return { notificationSummary, landingSummary };
  }, [normalizedDisplayConfig]);

  const displayConfigForRender =
    normalizedDisplayConfig ?? config.displayConfig ?? null;

  return (
    <BlockStack gap="500">
      {/* Header */}
      <BlockStack gap="200">
        <Text variant="headingLg" as="h2">
          How should it look on your storefront?
        </Text>
        <Text as="p" tone="subdued">
          Choose how qualifying customers will discover and access the exclusive
          products. You can customize the appearance after selecting an approach.
        </Text>
      </BlockStack>

      {/* Approach selection grid */}
      <div
        role="radiogroup"
        aria-label="Storefront display approach"
        className={`grid grid-cols-1 gap-[var(--p-space-400)] ${
          approachColumns === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
        }`}
      >
        {APPROACH_OPTIONS.map((option) => (
          <ApproachCard
            key={option.id}
            option={option}
            selected={selectedApproach === option.id}
            onSelect={() => handleSelectApproach(option.id)}
          />
        ))}
      </div>

      {/* Customize further section */}
      {selectedApproach && displayConfigForRender && (
        <>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <BlockStack gap="100">
                  <Text variant="headingMd" as="h2">
                    Customize appearance
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Fine-tune how the early access experience looks and behaves.
                  </Text>
                </BlockStack>
                <InlineStack gap="200">
                  <Button
                    icon={EditIcon}
                    onClick={() => setShowCustomize(true)}
                  >
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
                Click &quot;Customize&quot; to adjust the access prompt style,
                landing page layout, colors, and see a live preview.
              </Banner>

              {summary && (
                <BlockStack gap="200">
                  <Text as="p" variant="bodySm" fontWeight="semibold">
                    Current settings
                  </Text>
                  <BlockStack gap="100">
                    <Text as="p" variant="bodySm" tone="subdued">
                      Notification: {summary.notificationSummary}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Landing page: {summary.landingSummary}
                    </Text>
                  </BlockStack>
                </BlockStack>
              )}
            </BlockStack>
          </Card>

          <DisplayCustomizerModal
            open={showCustomize}
            onClose={() => setShowCustomize(false)}
            displayConfig={displayConfigForRender}
            onDisplayConfigChange={(newConfig) =>
              handleUpdateDisplayConfig(newConfig)
            }
            approach={selectedApproach}
            getDefaultDisplayConfig={() =>
              getDefaultEarlyAccessDisplayConfig(selectedApproach)
            }
            products={selectedProducts}
          />
        </>
      )}

      {showInlinePreview && selectedApproach && displayConfigForRender && (
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between" blockAlign="center">
              <BlockStack gap="100">
                <Text variant="headingMd" as="h2">
                  Live preview
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Preview how the early access experience will appear to
                  customers.
                </Text>
              </BlockStack>
              <InlineStack gap="100">
                <Button
                  icon={DesktopIcon}
                  size="slim"
                  variant={previewDevice === "desktop" ? "primary" : "secondary"}
                  onClick={() => setPreviewDevice("desktop")}
                >
                  Desktop
                </Button>
                <Button
                  icon={MobileIcon}
                  size="slim"
                  variant={previewDevice === "mobile" ? "primary" : "secondary"}
                  onClick={() => setPreviewDevice("mobile")}
                >
                  Mobile
                </Button>
              </InlineStack>
            </InlineStack>
            <div
              className="h-[520px] overflow-hidden rounded-[16px] border border-[var(--p-color-border)]"
            >
              <StorefrontPreview
                config={displayConfigForRender}
                device={previewDevice}
                products={selectedProducts}
                approach={selectedApproach}
              />
            </div>
          </BlockStack>
        </Card>
      )}
    </BlockStack>
  );
}
