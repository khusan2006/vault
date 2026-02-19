"use client";

import { ReactNode } from "react";
import { InlineStack, Text, Icon } from "@shopify/polaris";
import { ChevronRightIcon } from "@shopify/polaris-icons";

interface CustomizerMenuButtonProps {
  label: string;
  onClick: () => void;
  rightIcon?: ReactNode;
}

export function CustomizerMenuButton({
  label,
  onClick,
  rightIcon,
}: CustomizerMenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full cursor-pointer bg-transparent py-3 text-left transition-colors duration-100 hover:bg-[var(--p-color-bg-surface-hover)] rounded-[var(--p-border-radius-200)]"
    >
      <InlineStack align="space-between" blockAlign="center">
        <Text as="p" variant="bodyMd" fontWeight="semibold">
          {label}
        </Text>
        {rightIcon ?? <Icon source={ChevronRightIcon} tone="subdued" />}
      </InlineStack>
    </button>
  );
}
