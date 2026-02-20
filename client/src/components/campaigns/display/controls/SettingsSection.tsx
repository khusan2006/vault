import type { ReactNode } from "react";
import { Text, Divider } from "@shopify/polaris";

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
  open: _open,
  onToggle: _onToggle,
  disabled: _disabled = false,
  children,
  onMouseEnter,
  onMouseLeave,
}: SettingsSectionProps) {
  return (
    <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div className="py-2">
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
      <Divider />
      <div className="py-3">{children}</div>
    </div>
  );
}
