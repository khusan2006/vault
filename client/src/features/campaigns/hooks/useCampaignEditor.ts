"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { campaignsApi } from "@/lib/api";
import { useIdTokenNavigation } from "@/shared/hooks/useIdTokenNavigation";
import { useToast } from "@/shared/hooks/useToast";
import {
  campaignToFormState,
  useCampaignForm,
} from "@/features/campaigns/hooks/useCampaignForm";
import { seedSelectedResourcesFromCampaign } from "@/utils";
import type { Campaign } from "@/types";
import type { SelectedResource } from "@/features/campaigns/hooks/useResourcePicker";

interface UseCampaignEditorOptions {
  campaignId: string;
  initialCampaign: Campaign | null;
}

export function useCampaignEditor({
  campaignId,
  initialCampaign,
}: UseCampaignEditorOptions) {
  const { push } = useIdTokenNavigation();
  const { show: showToast } = useToast();

  const initialFormState = useMemo(
    () => (initialCampaign ? campaignToFormState(initialCampaign) : undefined),
    [initialCampaign],
  );
  const initialSelections = useMemo(() => {
    if (!initialCampaign) return { products: [], collections: [] };
    return seedSelectedResourcesFromCampaign(initialCampaign, {
      products: [],
      collections: [],
    });
  }, [initialCampaign]);

  const [loading, setLoading] = useState(initialCampaign === null);
  const [saving, setSaving] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<SelectedResource[]>(
    initialSelections.products,
  );
  const [selectedCollections, setSelectedCollections] = useState<
    SelectedResource[]
  >(initialSelections.collections);

  const selectedProductsRef = useRef<SelectedResource[]>([]);
  const selectedCollectionsRef = useRef<SelectedResource[]>([]);
  const hasInitialized = useRef(false);

  const {
    formState,
    updateField,
    hydrateFromCampaign,
    buildPayload,
    isDirty,
    checkDirty,
    markClean,
  } = useCampaignForm(initialFormState);

  useEffect(() => {
    if (!hasInitialized.current) return;
    checkDirty(formState);
  }, [formState, checkDirty]);

  useEffect(() => {
    selectedProductsRef.current = selectedProducts;
  }, [selectedProducts]);

  useEffect(() => {
    selectedCollectionsRef.current = selectedCollections;
  }, [selectedCollections]);

  useEffect(() => {
    if (!initialCampaign || hasInitialized.current) return;
    markClean();
    hasInitialized.current = true;
  }, [initialCampaign, markClean]);

  const hydrateCampaign = useCallback(
    (campaign: Campaign) => {
      hydrateFromCampaign(campaign);
      const seeded = seedSelectedResourcesFromCampaign(campaign, {
        products: selectedProductsRef.current,
        collections: selectedCollectionsRef.current,
      });
      setSelectedProducts(seeded.products);
      setSelectedCollections(seeded.collections);
      hasInitialized.current = true;
    },
    [hydrateFromCampaign],
  );

  const loadCampaign = useCallback(async () => {
    try {
      setLoading(true);
      const campaign = await campaignsApi.get(campaignId);
      hydrateCampaign(campaign);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load campaign");
    } finally {
      setLoading(false);
    }
  }, [campaignId, hydrateCampaign]);

  useEffect(() => {
    if (initialCampaign) return;
    loadCampaign();
  }, [initialCampaign, loadCampaign]);

  const handleSave = useCallback(async () => {
    if (!formState.name.trim()) {
      setError("Campaign name is required");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await campaignsApi.update(campaignId, buildPayload());
      markClean();
      showToast("Campaign saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save campaign");
    } finally {
      setSaving(false);
    }
  }, [campaignId, formState.name, buildPayload, markClean, showToast]);

  const handleDiscard = useCallback(() => {
    loadCampaign();
  }, [loadCampaign]);

  const handleDelete = useCallback(async () => {
    try {
      setDeleting(true);
      await campaignsApi.delete(campaignId);
      showToast("Campaign deleted");
      push("/campaigns");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete campaign");
      setDeleteModalOpen(false);
    } finally {
      setDeleting(false);
    }
  }, [campaignId, push, showToast]);

  const handleDuplicate = useCallback(async () => {
    try {
      setDuplicating(true);
      const duplicated = await campaignsApi.duplicate(campaignId);
      showToast("Campaign duplicated");
      push(`/campaigns/${duplicated.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to duplicate campaign",
      );
    } finally {
      setDuplicating(false);
    }
  }, [campaignId, push, showToast]);

  const handleFieldChange = useCallback(
    <K extends keyof typeof formState>(
      field: K,
      value: (typeof formState)[K],
    ) => {
      updateField(field, value);
      if (
        error === "Campaign name is required" &&
        field === "name" &&
        String(value).trim()
      ) {
        setError(null);
      }
    },
    [updateField, error],
  );

  const selectionProps = useMemo(
    () => ({
      selectedProducts,
      selectedCollections,
      onProductsChange: setSelectedProducts,
      onCollectionsChange: setSelectedCollections,
    }),
    [selectedProducts, selectedCollections],
  );

  const isActive = formState.status === "active";
  const isBusy = saving || duplicating;

  return {
    formState,
    isDirty,
    loading,
    saving,
    duplicating,
    deleting,
    deleteModalOpen,
    setDeleteModalOpen,
    error,
    setError,
    selectionProps,
    isActive,
    isBusy,
    handleSave,
    handleDiscard,
    handleDelete,
    handleDuplicate,
    handleFieldChange,
  };
}
