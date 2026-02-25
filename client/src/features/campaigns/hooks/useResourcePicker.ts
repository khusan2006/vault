"use client";

import { useCallback } from "react";

// =============================================================================
// Types
// =============================================================================

interface ResourcePickerOptions {
  type: "product" | "collection";
  multiple?: boolean;
  initialSelectionIds?: string[];
}

/** Lightweight resource info returned by the detailed picker methods */
export interface SelectedResource {
  id: string;
  title: string;
  imageUrl?: string;
}

// =============================================================================
// Hook
// =============================================================================

export function useResourcePicker() {
  /** Low-level picker — returns raw Shopify selections */
  const openPickerRaw = useCallback(
    async (options: ResourcePickerOptions) => {
      if (typeof window === "undefined" || !window.shopify) {
        console.error("Shopify App Bridge not available");
        return null;
      }

      try {
        const result = await window.shopify.resourcePicker({
          type: options.type,
          multiple: options.multiple ?? true,
          selectionIds:
            options.initialSelectionIds?.map((id) => ({ id })) ?? [],
        });

        if (!result || result.length === 0) {
          return null; // user cancelled
        }

        return result;
      } catch (error) {
        console.error("Resource picker error:", error);
        return null;
      }
    },
    [],
  );

  // ---------------------------------------------------------------------------
  // ID-only methods (backwards compatible)
  // ---------------------------------------------------------------------------

  const openPicker = useCallback(
    async (options: ResourcePickerOptions): Promise<string[]> => {
      const result = await openPickerRaw(options);
      if (!result) return options.initialSelectionIds ?? [];
      return result.map((item) => item.id);
    },
    [openPickerRaw],
  );

  const selectProducts = useCallback(
    (initialIds?: string[]) =>
      openPicker({
        type: "product",
        multiple: true,
        initialSelectionIds: initialIds,
      }),
    [openPicker],
  );

  const selectCollections = useCallback(
    (initialIds?: string[]) =>
      openPicker({
        type: "collection",
        multiple: true,
        initialSelectionIds: initialIds,
      }),
    [openPicker],
  );

  // ---------------------------------------------------------------------------
  // Detailed methods — return id + title + image
  // ---------------------------------------------------------------------------

  const selectProductsDetailed = useCallback(
    async (
      initialIds?: string[],
      existingDetails?: SelectedResource[],
    ): Promise<SelectedResource[]> => {
      const result = await openPickerRaw({
        type: "product",
        multiple: true,
        initialSelectionIds: initialIds,
      });

      if (!result) return existingDetails ?? [];

      return result.map((item) => ({
        id: item.id,
        title: item.title ?? "Untitled product",
        imageUrl: item.images?.[0]?.originalSrc,
      }));
    },
    [openPickerRaw],
  );

  const selectCollectionsDetailed = useCallback(
    async (
      initialIds?: string[],
      existingDetails?: SelectedResource[],
    ): Promise<SelectedResource[]> => {
      const result = await openPickerRaw({
        type: "collection",
        multiple: true,
        initialSelectionIds: initialIds,
      });

      if (!result) return existingDetails ?? [];

      return result.map((item) => ({
        id: item.id,
        title: item.title ?? "Untitled collection",
        imageUrl: item.image?.originalSrc ?? undefined,
      }));
    },
    [openPickerRaw],
  );

  return {
    selectProducts,
    selectCollections,
    selectProductsDetailed,
    selectCollectionsDetailed,
    openPicker,
  };
}
