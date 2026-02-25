"use client";

import { ReactNode } from "react";
import { Text, Icon } from "@shopify/polaris";
import { ChevronRightIcon } from "@shopify/polaris-icons";

interface CustomizerMenuButtonProps {
  label: string;
  description?: string;
  onClick: () => void;
  rightIcon?: ReactNode;
}

export function CustomizerMenuButton({
  label,
  description,
  onClick,
  rightIcon,
}: CustomizerMenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full border-0 border-b-1 border-[var(--p-color-border)] cursor-pointer bg-transparent py-3 text-left transition-colors duration-100 hover:bg-[var(--p-color-bg-surface-hover)]"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Text as="p" variant="bodyMd" fontWeight="semibold">
            {label}
          </Text>
          {description && (
            <Text as="p" variant="bodySm" tone="subdued" truncate>
              {description}
            </Text>
          )}
        </div>
        {rightIcon ?? <Icon source={ChevronRightIcon} tone="subdued" />}
      </div>
    </button>
  );
}
