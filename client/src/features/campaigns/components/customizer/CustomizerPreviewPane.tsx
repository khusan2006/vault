"use client";

import { ReactNode } from "react";
import { InlineStack, Button } from "@shopify/polaris";
import { DesktopIcon, MobileIcon } from "@shopify/polaris-icons";

interface CustomizerPreviewPaneProps {
  device: "desktop" | "mobile";
  onDeviceChange: (device: "desktop" | "mobile") => void;
  children: ReactNode;
}

export function CustomizerPreviewPane({
  device,
  onDeviceChange,
  children,
}: CustomizerPreviewPaneProps) {
  return (
    <>
      <div
        className="flex items-center justify-center gap-4 border-b border-b-[var(--p-color-border)] bg-[var(--p-color-bg-surface)] px-6 py-3"
      >
        <InlineStack gap="0" align="center">
          <Button
            icon={DesktopIcon}
            variant={device === "desktop" ? "primary" : "secondary"}
            onClick={() => onDeviceChange("desktop")}
            size="slim"
          >
            Desktop
          </Button>
          <Button
            icon={MobileIcon}
            variant={device === "mobile" ? "primary" : "secondary"}
            onClick={() => onDeviceChange("mobile")}
            size="slim"
          >
            Mobile
          </Button>
        </InlineStack>
      </div>

      {children}
    </>
  );
}
