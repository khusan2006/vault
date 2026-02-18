"use client";

import type { ReactNode } from "react";
import { BlockStack, InlineStack, Text, Icon } from "@shopify/polaris";
import { ChevronDownIcon } from "@shopify/polaris-icons";

interface AccordionSectionProps {
  title: string;
  description?: string;
  open: boolean;
  onToggle: () => void;
  disabled?: boolean;
  children: ReactNode;
}

export function AccordionSection({
  title,
  description,
  open,
  onToggle,
  disabled,
  children,
}: AccordionSectionProps) {
  return (
    <div
      className={`overflow-hidden rounded-[var(--p-border-radius-200)] border border-[var(--p-color-border)] bg-[var(--p-color-bg-surface)] ${
        disabled ? "opacity-60" : "opacity-100"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        disabled={disabled}
        className={`w-full bg-transparent px-4 py-3 text-left ${
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <InlineStack align="space-between" blockAlign="center" gap="200">
          <BlockStack gap="050">
            <Text as="p" variant="bodyMd" fontWeight="semibold">
              {title}
            </Text>
            {description && (
              <Text as="p" variant="bodySm" tone="subdued">
                {description}
              </Text>
            )}
          </BlockStack>
          <div
            className={`transition-transform duration-150 ease-out ${open ? "rotate-180" : "rotate-0"}`}
          >
            <Icon source={ChevronDownIcon} tone="subdued" />
          </div>
        </InlineStack>
      </button>
      {open && (
        <div className="border-t border-t-[var(--p-color-border)] px-4 py-3">
          {children}
        </div>
      )}
    </div>
  );
}
