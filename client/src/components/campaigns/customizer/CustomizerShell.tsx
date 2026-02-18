"use client";

import { ReactNode } from "react";
import { Box, Scrollable } from "@shopify/polaris";
import { Modal as AppBridgeModal } from "@shopify/app-bridge-react";

interface CustomizerShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  sidebar: ReactNode;
  preview: ReactNode;
}

export function CustomizerShell({
  open,
  onClose,
  title,
  primaryActionLabel = "Done",
  onPrimaryAction,
  sidebar,
  preview,
}: CustomizerShellProps) {
  return (
    <AppBridgeModal open={open} onHide={onClose} variant="max">
      <ui-title-bar title={title}>
        <button variant="primary" onClick={onPrimaryAction ?? onClose}>
          {primaryActionLabel}
        </button>
      </ui-title-bar>

      <div
        className="flex h-screen w-full overflow-hidden"
      >
        {/* Left Sidebar */}
        <div
          className="sticky top-0 flex h-full w-[400px] shrink-0 flex-col overflow-hidden border-r border-r-[var(--p-color-border)] bg-[var(--p-color-bg-surface)]"
        >
          <Scrollable shadow className="h-full">
            <Box padding="400">{sidebar}</Box>
          </Scrollable>
        </div>

        {/* Right Panel */}
        <div
          className="flex h-full flex-1 flex-col overflow-hidden bg-[var(--p-color-bg-surface-secondary)]"
        >
          {preview}
        </div>
      </div>
    </AppBridgeModal>
  );
}
