import { BlockStack, Text, Select } from "@shopify/polaris";
import { ColorInput } from "./ColorInput";
import { SizeSlider } from "./SizeSlider";

interface TextStyleGroupProps {
  label: string;
  color: { value: string; onChange: (v: string) => void; placeholder?: string };
  size: {
    value: number | "";
    onChange: (v: number | "") => void;
    placeholder?: number;
    min?: number;
    max?: number;
  };
  weight: { value: string; onChange: (v: string) => void; placeholder?: string };
}

const WEIGHT_OPTIONS = [
  { label: "Normal", value: "400" },
  { label: "Medium", value: "500" },
  { label: "Semibold", value: "600" },
  { label: "Bold", value: "700" },
];

export function TextStyleGroup({
  label,
  color,
  size,
  weight,
}: TextStyleGroupProps) {
  return (
    <BlockStack gap="300">
      <Text as="span" variant="bodyMd" fontWeight="semibold">
        {label}
      </Text>
      <ColorInput
        label="Color"
        value={color.value}
        onChange={color.onChange}
        placeholder={color.placeholder}
      />
      <SizeSlider
        label="Font size"
        value={size.value}
        onChange={size.onChange}
        placeholder={size.placeholder}
        min={size.min ?? 12}
        max={size.max ?? 48}
      />
      <Select
        label="Font weight"
        options={WEIGHT_OPTIONS}
        value={weight.value || weight.placeholder || "400"}
        onChange={weight.onChange}
      />
    </BlockStack>
  );
}
