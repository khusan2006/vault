import { useCallback } from "react";
import {
  RangeSlider,
  TextField,
  BlockStack,
  InlineStack,
  Text,
} from "@shopify/polaris";

interface SizeSliderProps {
  label: string;
  value: number | "";
  onChange: (val: number | "") => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  placeholder?: number;
}

export function SizeSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 48,
  step = 1,
  unit = "px",
  placeholder,
}: SizeSliderProps) {
  const numericValue = value === "" ? (placeholder ?? min) : value;

  const handleSliderChange = useCallback(
    (newValue: number | [number, number]) => {
      if (typeof newValue === "number") {
        onChange(newValue);
      }
    },
    [onChange],
  );

  const handleTextChange = useCallback(
    (text: string) => {
      if (text === "") {
        onChange("");
        return;
      }
      const n = parseFloat(text);
      if (!isNaN(n)) {
        const clamped = Math.min(Math.max(n, min), max);
        onChange(clamped);
      }
    },
    [onChange, min, max],
  );

  return (
    <BlockStack gap="100">
      <Text as="span" variant="bodyMd">
        {label}
      </Text>
      <InlineStack gap="300" blockAlign="center" wrap={false}>
        <div style={{ flex: 1 }}>
          <RangeSlider
            label={label}
            labelHidden
            value={numericValue}
            min={min}
            max={max}
            step={step}
            output={value !== ""}
            onChange={handleSliderChange}
          />
        </div>
        <div style={{ width: 72 }}>
          <TextField
            label={label}
            labelHidden
            value={value === "" ? "" : String(value)}
            onChange={handleTextChange}
            type="number"
            min={min}
            max={max}
            suffix={unit}
            autoComplete="off"
            placeholder={
              placeholder !== undefined ? String(placeholder) : undefined
            }
          />
        </div>
      </InlineStack>
    </BlockStack>
  );
}
