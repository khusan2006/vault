"use client";

import { useCallback } from "react";

export function useToast() {
  const show = useCallback(
    (
      content: string,
      options?: {
        error?: boolean;
        action?: { content: string; onAction: () => void };
      },
    ) => {
      window.shopify?.toast?.show(content, {
        isError: options?.error,
      });
    },
    [],
  );

  return { show };
}
