import { useCallback, useMemo, useState } from "react";
import {
  Popover,
  ColorPicker,
  TextField,
  InlineStack,
  hsbToHex,
  rgbToHsb,
  hexToRgb,
} from "@shopify/polaris";
import type { HSBAColor } from "@shopify/polaris";

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

function hexToHsb(hex: string): HSBAColor {
  const rgb = hexToRgb(normalizeHex(hex));
  const hsb = rgbToHsb(rgb);
  return { ...hsb, alpha: 1 };
}

export function ColorInput({
  label,
  value,
  onChange,
  placeholder = "#000000",
}: ColorInputProps) {
  const [popoverActive, setPopoverActive] = useState(false);

  const togglePopover = useCallback(
    () => setPopoverActive((prev) => !prev),
    [],
  );

  const hsbColor = useMemo<HSBAColor>(() => {
    const hex = value || placeholder;
    if (isValidHex(hex)) {
      return hexToHsb(hex);
    }
    return { hue: 0, saturation: 0, brightness: 0, alpha: 1 };
  }, [value, placeholder]);

  const handleColorPickerChange = useCallback(
    (hsba: HSBAColor) => {
      const hex = hsbToHex({
        hue: hsba.hue,
        saturation: hsba.saturation,
        brightness: hsba.brightness,
      });
      onChange(hex);
    },
    [onChange],
  );

  const handleTextChange = useCallback(
    (text: string) => {
      onChange(text);
    },
    [onChange],
  );

  const displayColor = value || placeholder;
  const swatchColor = isValidHex(displayColor)
    ? normalizeHex(displayColor)
    : "#000000";

  const activator = (
    <button
      type="button"
      onClick={togglePopover}
      className="h-8 w-8 shrink-0 cursor-pointer rounded-[var(--p-border-radius-200)] border border-[var(--p-color-border)] shadow-sm transition-shadow hover:shadow-md"
      style={{ backgroundColor: swatchColor }}
      aria-label={`Pick color for ${label}`}
    />
  );

  return (
    <InlineStack gap="200" blockAlign="center" wrap={false}>
      <Popover
        active={popoverActive}
        activator={activator}
        onClose={togglePopover}
        preferredAlignment="left"
      >
        <div className="p-3">
          <ColorPicker color={hsbColor} onChange={handleColorPickerChange} />
        </div>
      </Popover>
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
