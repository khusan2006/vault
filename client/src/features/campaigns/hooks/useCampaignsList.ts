"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Campaign, CampaignStatus } from "@/types";
import { useCampaignsStore } from "@/features/campaigns/store/useCampaignsStore";

type TabStatus = "all" | CampaignStatus;

export const CAMPAIGN_TAB_IDS: TabStatus[] = [
  "all",
  "active",
  "draft",
  "paused",
  "archived",
];

interface UseCampaignsListResult {
  allCampaigns: Campaign[];
  filteredCampaigns: Campaign[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedTab: number;
  tabCounts: Record<TabStatus, number>;
  setError: (value: string | null) => void;
  setSearchQuery: (value: string) => void;
  setSelectedTab: (value: number) => void;
  refreshCampaigns: () => Promise<void>;
  deleteCampaigns: (ids: string[]) => Promise<void>;
}

export function useCampaignsList(
  initialCampaigns: Campaign[] | null,
): UseCampaignsListResult {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") as TabStatus | null;
  const initialIndex = initialStatus
    ? CAMPAIGN_TAB_IDS.indexOf(initialStatus)
    : 0;
  const safeInitialIndex = initialIndex >= 0 ? initialIndex : 0;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<number>(safeInitialIndex);

  const {
    campaigns: allCampaigns,
    loading: storeLoading,
    error: storeError,
    hasLoaded,
    setError,
    setFromInitial,
    fetchCampaigns,
    deleteCampaigns,
  } = useCampaignsStore();

  const loading =
    initialCampaigns === null
      ? storeLoading || (!hasLoaded && !storeError)
      : false;
  const error = initialCampaigns === null ? storeError : null;

  useEffect(() => {
    if (initialCampaigns !== null) {
      setFromInitial(initialCampaigns);
      return;
    }

    fetchCampaigns();
  }, [initialCampaigns, setFromInitial, fetchCampaigns]);

  const tabCounts = useMemo(() => {
    const counts: Record<TabStatus, number> = {
      all: allCampaigns.length,
      active: 0,
      draft: 0,
      paused: 0,
      archived: 0,
    };
    for (const campaign of allCampaigns) {
      counts[campaign.status]++;
    }
    return counts;
  }, [allCampaigns]);

  const filteredCampaigns = useMemo(() => {
    const tabStatus = CAMPAIGN_TAB_IDS[selectedTab] ?? "all";
    let filtered = allCampaigns;

    if (tabStatus !== "all") {
      filtered = filtered.filter((campaign) => campaign.status === tabStatus);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((campaign) =>
        campaign.name.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [allCampaigns, selectedTab, searchQuery]);

  const refreshCampaigns = useCallback(async () => {
    await fetchCampaigns({ force: true });
  }, [fetchCampaigns]);

  return {
    allCampaigns,
    filteredCampaigns,
    loading,
    error,
    searchQuery,
    selectedTab,
    tabCounts,
    setError,
    setSearchQuery,
    setSelectedTab,
    refreshCampaigns,
    deleteCampaigns,
  };
}
