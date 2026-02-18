"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  BlockStack,
  InlineStack,
  TextField,
  Select,
  Text,
  Divider,
  Checkbox,
} from "@shopify/polaris";
import type {
  NotificationDisplayConfig,
  DisplayType,
  DisplayPosition,
  ShowFrequency,
} from "@/types";
import { AccordionSection } from "./AccordionSection";

const DISPLAY_TYPE_OPTIONS = [
  { label: "Banner", value: "banner" },
  { label: "Modal", value: "modal" },
  { label: "Toast", value: "toast" },
  { label: "Badge", value: "badge" },
];

const POSITION_OPTIONS_BANNER = [
  { label: "Top", value: "top" },
  { label: "Bottom", value: "bottom" },
];

const POSITION_OPTIONS_TOAST = [
  { label: "Bottom right", value: "bottom-right" },
  { label: "Bottom left", value: "bottom-left" },
  { label: "Bottom center", value: "bottom" },
  { label: "Top center", value: "top" },
];

const FREQUENCY_OPTIONS = [
  { label: "Every visit", value: "every_visit" },
  { label: "Once per session", value: "once_per_session" },
  { label: "Once per day", value: "once_per_day" },
  { label: "Once per week", value: "once_per_week" },
];

interface NotificationConfigProps {
  value: NotificationDisplayConfig;
  onChange: (value: NotificationDisplayConfig) => void;
  layout?: "card" | "plain";
  showHeading?: boolean;
  grouping?: "accordion" | "flat";
}

export function NotificationConfig({
  value,
  onChange,
  layout = "card",
  showHeading = true,
  grouping = "accordion",
}: NotificationConfigProps) {
  const showPosition = value.type === "banner" || value.type === "toast";
  const showAutoDismiss = value.type === "banner" || value.type === "toast";
  const supportsButton = value.type !== "badge";
  const [sectionsOpen, setSectionsOpen] = useState({
    basics: true,
    cta: true,
    appearance: true,
    behavior: false,
  });

  const positionOptions = useMemo(() => {
    if (value.type === "banner") return POSITION_OPTIONS_BANNER;
    if (value.type === "toast") return POSITION_OPTIONS_TOAST;
    return POSITION_OPTIONS_BANNER;
  }, [value.type]);

  const lastButtonRef = useRef({
    text: "View exclusive products",
    url: "/apps/vault/exclusive",
  });

  useEffect(() => {
    if (value.buttonText || value.buttonUrl) {
      lastButtonRef.current = {
        text: value.buttonText || lastButtonRef.current.text,
        url: value.buttonUrl || lastButtonRef.current.url,
      };
    }
  }, [value.buttonText, value.buttonUrl]);

  const showButton =
    supportsButton &&
    (value.buttonText.trim() !== "" || value.buttonUrl.trim() !== "");

  const handleToggleButton = (enabled: boolean) => {
    if (!enabled) {
      onChange({ ...value, buttonText: "", buttonUrl: "" });
      return;
    }
    onChange({
      ...value,
      buttonText: lastButtonRef.current.text,
      buttonUrl: lastButtonRef.current.url,
    });
  };

  const buttonUrlError =
    showButton && value.buttonText.trim() !== "" && value.buttonUrl.trim() === ""
      ? "Add a URL or turn off the button"
      : undefined;

  const basicsFields = (
    <BlockStack gap="300">
      <Select
        label="Display type"
        options={DISPLAY_TYPE_OPTIONS}
        value={value.type}
        onChange={(selected) => {
          const nextType = selected as DisplayType;
          const validBannerPositions = new Set<DisplayPosition>([
            "top",
            "bottom",
          ]);
          const nextPosition =
            nextType === "banner" &&
            !validBannerPositions.has(value.visuals.position)
              ? "top"
              : value.visuals.position;

          onChange({
            ...value,
            type: nextType,
            visuals: { ...value.visuals, position: nextPosition },
          });
        }}
      />
      <TextField
        label="Message"
        value={value.message}
        onChange={(message) => onChange({ ...value, message })}
        autoComplete="off"
      />
    </BlockStack>
  );

  const ctaFields = supportsButton ? (
    <BlockStack gap="300">
      <Checkbox
        label="Show call-to-action button"
        checked={showButton}
        onChange={handleToggleButton}
      />
      {showButton && (
        <>
          <TextField
            label="Button text"
            value={value.buttonText}
            onChange={(buttonText) => onChange({ ...value, buttonText })}
            autoComplete="off"
          />
          <TextField
            label="Button URL"
            value={value.buttonUrl}
            onChange={(buttonUrl) => onChange({ ...value, buttonUrl })}
            autoComplete="off"
            error={buttonUrlError}
          />
        </>
      )}
    </BlockStack>
  ) : null;

  const appearanceFields = (
    <BlockStack gap="300">
      <InlineStack gap="200" blockAlign="center">
        <div
          aria-hidden
          className="h-7 w-7 rounded-[var(--p-border-radius-100)] border border-[var(--p-color-border)]"
          style={{ backgroundColor: value.visuals.primaryColor }}
        />
        <div className="flex-1">
          <TextField
            label="Primary color"
            value={value.visuals.primaryColor}
            onChange={(primaryColor) =>
              onChange({
                ...value,
                visuals: { ...value.visuals, primaryColor },
              })
            }
            placeholder="#7c3aed"
            autoComplete="off"
          />
        </div>
      </InlineStack>

      <InlineStack gap="200" blockAlign="center">
        <div
          aria-hidden
          className="h-7 w-7 rounded-[var(--p-border-radius-100)] border border-[var(--p-color-border)]"
          style={{ backgroundColor: value.visuals.textColor }}
        />
        <div className="flex-1">
          <TextField
            label="Text color"
            value={value.visuals.textColor}
            onChange={(textColor) =>
              onChange({
                ...value,
                visuals: { ...value.visuals, textColor },
              })
            }
            placeholder="#ffffff"
            autoComplete="off"
          />
        </div>
      </InlineStack>

      {showPosition && (
        <Select
          label="Position"
          options={positionOptions}
          value={value.visuals.position}
          onChange={(position) =>
            onChange({
              ...value,
              visuals: {
                ...value.visuals,
                position: position as DisplayPosition,
              },
            })
          }
        />
      )}
    </BlockStack>
  );

  const behaviorFields = (
    <BlockStack gap="300">
      {showAutoDismiss && (
        <TextField
          label="Auto-dismiss (seconds)"
          type="number"
          value={
            value.behavior.autoDismissSeconds != null
              ? String(value.behavior.autoDismissSeconds)
              : ""
          }
          onChange={(val) =>
            onChange({
              ...value,
              behavior: {
                ...value.behavior,
                autoDismissSeconds: val === "" ? null : Number(val),
              },
            })
          }
          helpText="Leave empty to never auto-dismiss"
          autoComplete="off"
        />
      )}
      <Select
        label="Show frequency"
        options={FREQUENCY_OPTIONS}
        value={value.behavior.showFrequency}
        onChange={(frequency) =>
          onChange({
            ...value,
            behavior: {
              ...value.behavior,
              showFrequency: frequency as ShowFrequency,
            },
          })
        }
      />
    </BlockStack>
  );

  const content = (
    <BlockStack gap="400">
      {showHeading && (
        <>
          <Text variant="headingMd" as="h2">
            Notification
          </Text>
          <Divider />
        </>
      )}

      {grouping === "accordion" ? (
        <BlockStack gap="300">
          <AccordionSection
            title="Basics"
            description="Type and message customers will see"
            open={sectionsOpen.basics}
            onToggle={() =>
              setSectionsOpen((prev) => ({ ...prev, basics: !prev.basics }))
            }
          >
            {basicsFields}
          </AccordionSection>

          {supportsButton && (
            <AccordionSection
              title="Call to action"
              description="Optional button that drives clicks"
              open={sectionsOpen.cta}
              onToggle={() =>
                setSectionsOpen((prev) => ({ ...prev, cta: !prev.cta }))
              }
            >
              {ctaFields}
            </AccordionSection>
          )}

          <AccordionSection
            title="Appearance"
            description="Colors and placement"
            open={sectionsOpen.appearance}
            onToggle={() =>
              setSectionsOpen((prev) => ({
                ...prev,
                appearance: !prev.appearance,
              }))
            }
          >
            {appearanceFields}
          </AccordionSection>

          <AccordionSection
            title="Behavior"
            description="Frequency and timing"
            open={sectionsOpen.behavior}
            onToggle={() =>
              setSectionsOpen((prev) => ({ ...prev, behavior: !prev.behavior }))
            }
          >
            {behaviorFields}
          </AccordionSection>
        </BlockStack>
      ) : (
        <BlockStack gap="400">
          <BlockStack gap="200">
            <Text as="p" variant="bodyMd" fontWeight="semibold">
              Basics
            </Text>
            {basicsFields}
          </BlockStack>

          {supportsButton && (
            <BlockStack gap="200">
              <Text as="p" variant="bodyMd" fontWeight="semibold">
                Call to action
              </Text>
              {ctaFields}
            </BlockStack>
          )}

          <BlockStack gap="200">
            <Text as="p" variant="bodyMd" fontWeight="semibold">
              Appearance
            </Text>
            {appearanceFields}
          </BlockStack>

          <BlockStack gap="200">
            <Text as="p" variant="bodyMd" fontWeight="semibold">
              Behavior
            </Text>
            {behaviorFields}
          </BlockStack>
        </BlockStack>
      )}
    </BlockStack>
  );

  if (layout === "plain") {
    return content;
  }

  return <Card>{content}</Card>;
}
