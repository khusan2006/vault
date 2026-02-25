"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { setupApi } from "@/lib/api";
import { STORAGE_KEYS, CAMPAIGN_DEFAULTS } from "@/constants";
import { getStoreName, computeCampaignStats } from "@/utils";
import type { Campaign, SetupStatus } from "@/types";
import { useCampaignsStore } from "@/features/campaigns/store/useCampaignsStore";

const DEFAULT_SETUP_STATUS: SetupStatus = {
  themeEmbedEnabled: false,
  hasCampaign: false,
  hasBenefits: false,
  hasActiveCampaign: false,
};

interface UseDashboardOptions {
  initialCampaigns: Campaign[] | null;
  initialSetupStatus: SetupStatus | null;
}

export function useDashboard({
  initialCampaigns,
  initialSetupStatus,
}: UseDashboardOptions) {
  const shouldFetchCampaigns = initialCampaigns === null;
  const shouldFetchStatus = initialSetupStatus === null;

  const [setupLoading, setSetupLoading] = useState(shouldFetchStatus);
  const [setupStatus, setSetupStatus] = useState<SetupStatus>(
    initialSetupStatus ?? DEFAULT_SETUP_STATUS,
  );
  const [storeName, setStoreName] = useState("");
  const [guideDismissed, setGuideDismissed] = useState(false);

  const {
    campaigns: storedCampaigns,
    loading: campaignsLoading,
    setFromInitial,
    fetchCampaigns,
  } = useCampaignsStore();

  const campaignsSource = initialCampaigns ?? storedCampaigns;

  useEffect(() => {
    setStoreName(getStoreName());
  }, []);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEYS.GUIDE_DISMISSED);
    if (dismissed === "true") setGuideDismissed(true);
  }, []);

  useEffect(() => {
    if (initialCampaigns !== null) {
      setFromInitial(initialCampaigns);
    }
  }, [initialCampaigns, setFromInitial]);

  useEffect(() => {
    if (!shouldFetchCampaigns) return;
    fetchCampaigns();
  }, [shouldFetchCampaigns, fetchCampaigns]);

  useEffect(() => {
    if (!shouldFetchStatus) return;
    let isActive = true;

    const fetchData = async () => {
      try {
        const status = await setupApi.getStatus();
        if (isActive) {
          setSetupStatus(status);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        if (isActive) {
          setSetupLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      isActive = false;
    };
  }, [shouldFetchStatus]);

  const refreshEmbedStatus = useCallback(async () => {
    try {
      const status = await setupApi.getStatus();
      setSetupStatus(status);
    } catch (err) {
      console.error("Failed to refresh embed status:", err);
    }
  }, []);

  const dismissGuide = useCallback(() => {
    setGuideDismissed(true);
    localStorage.setItem(STORAGE_KEYS.GUIDE_DISMISSED, "true");
  }, []);

  const campaigns = useMemo(
    () =>
      campaignsSource.slice(0, CAMPAIGN_DEFAULTS.RECENT_CAMPAIGNS_LIMIT),
    [campaignsSource],
  );

  const stats = useMemo(
    () => computeCampaignStats(campaignsSource),
    [campaignsSource],
  );

  return {
    loading: (shouldFetchCampaigns ? campaignsLoading : false) || setupLoading,
    campaigns,
    stats,
    setupStatus,
    storeName,
    guideDismissed,
    refreshEmbedStatus,
    dismissGuide,
  };
}
