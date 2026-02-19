import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
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

/**
 * Color input with inline expandable picker.
 * Avoids Polaris Popover which causes cross-origin SecurityError
 * in Shopify embedded app iframe contexts (App Bridge modals).
 * @see https://community.shopify.dev/t/polaris-react-popover-no-longer-working-local-dev/25094
 */
export function ColorInput({
  label,
  value,
  onChange,
  placeholder = "#000000",
}: ColorInputProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const togglePicker = useCallback(
    () => setPickerOpen((prev) => !prev),
    [],
  );

  // Close picker when clicking outside
  useEffect(() => {
    if (!pickerOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pickerOpen]);

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

  return (
    <div ref={containerRef}>
      <InlineStack gap="200" blockAlign="center" wrap={false}>
        <button
          type="button"
          onClick={togglePicker}
          className="h-8 w-8 shrink-0 cursor-pointer rounded-[var(--p-border-radius-200)] border border-[var(--p-color-border)] shadow-sm transition-shadow hover:shadow-md"
          style={{ backgroundColor: swatchColor }}
          aria-label={`Pick color for ${label}`}
          aria-expanded={pickerOpen}
        />
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
      {pickerOpen && (
        <div className="mt-2 rounded-[var(--p-border-radius-200)] border border-[var(--p-color-border)] bg-[var(--p-color-bg-surface)] p-3 shadow-md">
          <ColorPicker color={hsbColor} onChange={handleColorPickerChange} />
        </div>
      )}
    </div>
  );
}
