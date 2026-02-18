import type { ReactNode } from "react";
import { InlineStack, Text, Icon } from "@shopify/polaris";
import { ChevronRightIcon } from "@shopify/polaris-icons";

interface SettingsSectionProps {
  title: string;
  description?: string;
  open: boolean;
  onToggle: () => void;
  disabled?: boolean;
  children: ReactNode;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function SettingsSection({
  title,
  description,
  open,
  onToggle,
  disabled = false,
  children,
  onMouseEnter,
  onMouseLeave,
}: SettingsSectionProps) {
  return (
    <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className="mx-[-8px] flex w-[calc(100%+16px)] cursor-pointer items-center justify-between border-b border-[var(--p-color-border)] bg-transparent px-2 py-3 text-left transition-colors duration-100 hover:rounded-[var(--p-border-radius-200)] hover:bg-[var(--p-color-bg-surface-hover)]"
      >
        <div>
          <Text as="span" variant="bodyMd" fontWeight="semibold">
            {title}
          </Text>
          {description && (
            <div>
              <Text as="span" variant="bodySm" tone="subdued">
                {description}
              </Text>
            </div>
          )}
        </div>
        <div
          className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        >
          <Icon source={ChevronRightIcon} tone="subdued" />
        </div>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="py-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
