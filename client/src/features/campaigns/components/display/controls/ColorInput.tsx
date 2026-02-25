import { useCallback } from "react";
import { TextField, InlineStack } from "@shopify/polaris";

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  placeholder?: string;
}

function isValidHex(hex: string): boolean {
  return /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex);
}

function normalizeHex(hex: string): string {
  const clean = hex.replace(/^#/, "");
  return `#${clean}`;
}

/**
 * Color input with native HTML color picker.
 *
 * Avoids both Polaris Popover (cross-origin SecurityError in App Bridge modals)
 * and Polaris ColorPicker (rapid onChange causes React scheduler crash).
 *
 * Uses <input type="color"> which is native, zero-dependency, and
 * only fires onChange on commit (not during drag).
 */
export function ColorInput({
  label,
  value,
  onChange,
  placeholder = "#000000",
}: ColorInputProps) {
  const displayColor = value || placeholder;
  const swatchColor = isValidHex(displayColor)
    ? normalizeHex(displayColor)
    : "#000000";

  const handleNativeColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  const handleTextChange = useCallback(
    (text: string) => {
      onChange(text);
    },
    [onChange],
  );

  return (
    <InlineStack gap="200" blockAlign="center" wrap={false}>
      <label
        className="relative h-8 w-8 shrink-0 cursor-pointer rounded-[var(--p-border-radius-200)] border border-[var(--p-color-border)] shadow-sm transition-shadow hover:shadow-md"
        style={{ backgroundColor: swatchColor }}
        aria-label={`Pick color for ${label}`}
      >
        <input
          type="color"
          value={swatchColor}
          onChange={handleNativeColorChange}
          className="absolute inset-0 cursor-pointer opacity-0"
          tabIndex={-1}
        />
      </label>
      <div className="flex-1">
        <TextField
          label={label}
          value={value}
          onChange={handleTextChange}
          placeholder={placeholder}
          autoComplete="off"
          labelHidden={false}
        />
      </div>
    </InlineStack>
  );
}
