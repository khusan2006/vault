"use client";

import { Text, BlockStack, InlineStack } from "@shopify/polaris";

interface StatBoxProps {
  label: string;
  value: number;
  subtitle?: string;
}

/**
 * A styled stat box for the dashboard overview section.
 */
export function StatBox({ label, value, subtitle }: StatBoxProps) {
  return (
    <div
      className="min-w-0 flex-1 rounded-[var(--p-border-radius-300)] border border-[var(--p-color-border)] bg-[var(--p-color-bg-surface-secondary)] p-[var(--p-space-400)]"
    >
      <BlockStack gap="100">
        <Text as="p" variant="bodySm" tone="subdued">
          {label}
        </Text>
        <InlineStack gap="200" blockAlign="baseline" wrap={false}>
          <Text as="p" variant="headingXl" fontWeight="bold">
            {value}
          </Text>
          {subtitle && (
            <Text as="span" variant="bodySm" tone="subdued">
              {subtitle}
            </Text>
          )}
        </InlineStack>
      </BlockStack>
    </div>
  );
}
