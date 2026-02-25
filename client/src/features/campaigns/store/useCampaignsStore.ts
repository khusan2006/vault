"use client";

import { create } from "zustand";
import type { Campaign } from "@/types";
import { campaignsApi } from "@/lib/api";

interface CampaignsStoreState {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
  hasLoaded: boolean;
  setError: (error: string | null) => void;
  setCampaigns: (campaigns: Campaign[]) => void;
  setFromInitial: (campaigns: Campaign[]) => void;
  fetchCampaigns: (options?: { force?: boolean }) => Promise<void>;
  deleteCampaigns: (ids: string[]) => Promise<void>;
}

export const useCampaignsStore = create<CampaignsStoreState>((set, get) => ({
  campaigns: [],
  loading: false,
  error: null,
  hasLoaded: false,
  setError: (error) => set({ error }),
  setCampaigns: (campaigns) => set({ campaigns, hasLoaded: true }),
  setFromInitial: (campaigns) =>
    set({ campaigns, loading: false, error: null, hasLoaded: true }),
  fetchCampaigns: async (options) => {
    const { loading, hasLoaded } = get();
    const shouldSkip = !options?.force && (loading || hasLoaded);
    if (shouldSkip) return;

    set({ loading: true, error: null });
    try {
      const response = await campaignsApi.list();
      set({ campaigns: response.campaigns, hasLoaded: true });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load campaigns",
      });
    } finally {
      set({ loading: false });
    }
  },
  deleteCampaigns: async (ids) => {
    if (ids.length === 0) return;

    set({ error: null });
    try {
      await Promise.all(ids.map((id) => campaignsApi.delete(id)));
      set((state) => ({
        campaigns: state.campaigns.filter(
          (campaign) => !ids.includes(campaign.id),
        ),
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete campaigns";
      set({ error: message });
      throw err;
    }
  },
}));
