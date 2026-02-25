"use client";

import {
  Card,
  BlockStack,
  TextField,
  Select,
  Text,
  Divider,
} from "@shopify/polaris";
import type { TimerDisplayConfig, TimerPosition, TimerStyle } from "@/types";

const POSITION_OPTIONS = [
  { label: "Above add to cart", value: "above_add_to_cart" },
  { label: "Below price", value: "below_price" },
  { label: "Above title", value: "above_title" },
];

const STYLE_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Minimal", value: "minimal" },
  { label: "Urgent", value: "urgent" },
];

const TIMER_TYPE_LABELS: Record<string, string> = {
  per_customer: "Per customer",
  global: "Global",
};

interface TimerDisplayConfigEditorProps {
  value: TimerDisplayConfig;
  onChange: (value: TimerDisplayConfig) => void;
  layout?: "card" | "plain";
  showHeading?: boolean;
}

export function TimerDisplayConfigEditor({
  value,
  onChange,
  layout = "card",
  showHeading = true,
}: TimerDisplayConfigEditorProps) {
  const content = (
    <BlockStack gap="400">
      {showHeading && (
        <>
          <Text variant="headingMd" as="h2">
            Timer Display
          </Text>
          <Divider />
        </>
      )}
      <TextField
        label="Timer type"
        value={TIMER_TYPE_LABELS[value.timerType] ?? value.timerType}
        disabled
        autoComplete="off"
        helpText="Timer type is configured in the previous step."
      />
      <Select
        label="Position"
        options={POSITION_OPTIONS}
        value={value.position}
        onChange={(position) =>
          onChange({ ...value, position: position as TimerPosition })
        }
      />
      <TextField
        label="Expired message"
        value={value.expiredMessage}
        onChange={(expiredMessage) => onChange({ ...value, expiredMessage })}
        autoComplete="off"
      />
      <Select
        label="Style"
        options={STYLE_OPTIONS}
        value={value.style}
        onChange={(style) => onChange({ ...value, style: style as TimerStyle })}
      />
    </BlockStack>
  );

  if (layout === "plain") {
    return content;
  }

  return <Card>{content}</Card>;
}
