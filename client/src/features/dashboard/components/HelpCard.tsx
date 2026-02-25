"use client";

import { Text, BlockStack, Button, Icon } from "@shopify/polaris";
import { ExternalIcon } from "@shopify/polaris-icons";
import type { IconProps } from "@shopify/polaris";

interface HelpCardProps {
  icon: IconProps["source"];
  title: string;
  description: string;
  linkLabel: string;
  linkUrl: string;
  /** CSS color for the icon badge background */
  iconColor?: string;
}

export function HelpCard({
  icon,
  title,
  description,
  linkLabel,
  linkUrl,
  iconColor = "var(--p-color-bg-surface-secondary)",
}: HelpCardProps) {
  return (
    <div
      className="flex flex-col gap-[var(--p-space-300)] rounded-[var(--p-border-radius-300)] bg-[var(--p-color-bg-surface)] p-[var(--p-space-500)] shadow-[var(--p-shadow-100)] transition-shadow duration-150 ease-out hover:shadow-[var(--p-shadow-200)]"
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-[var(--p-border-radius-300)]"
        style={{ backgroundColor: iconColor }}
      >
        <Icon source={icon} tone="base" />
      </div>
      <BlockStack gap="100">
        <Text variant="headingSm" as="h3">
          {title}
        </Text>
        <Text as="p" variant="bodySm" tone="subdued">
          {description}
        </Text>
      </BlockStack>
      <div className="mt-auto">
        <Button
          variant="plain"
          icon={ExternalIcon}
          onClick={() => window.open(linkUrl, "_blank")}
        >
          {linkLabel}
        </Button>
      </div>
    </div>
  );
}
