"use client";

import { useCallback, useEffect, useState } from "react";
import { campaignsApi, setupApi } from "@/lib/api";
import { STORAGE_KEYS, CAMPAIGN_DEFAULTS } from "@/constants";
import { getStoreName, computeCampaignStats } from "@/utils";
import type { Campaign, SetupStatus } from "@/types";
import type { CampaignStats } from "@/utils/compute-campaign-stats";

const DEFAULT_SETUP_STATUS: SetupStatus = {
  themeEmbedEnabled: false,
  hasCampaign: false,
  hasBenefits: false,
  hasActiveCampaign: false,
};

const DEFAULT_STATS: CampaignStats = {
  activeCampaigns: 0,
  totalCampaigns: 0,
  draftCampaigns: 0,
};

interface UseDashboardOptions {
  initialCampaigns: Campaign[] | null;
  initialSetupStatus: SetupStatus | null;
}

export function useDashboard({
  initialCampaigns,
  initialSetupStatus,
}: UseDashboardOptions) {
  const needsClientFetch =
    initialCampaigns === null || initialSetupStatus === null;

  const [loading, setLoading] = useState(needsClientFetch);
  const [campaigns, setCampaigns] = useState<Campaign[]>(
    initialCampaigns?.slice(0, CAMPAIGN_DEFAULTS.RECENT_CAMPAIGNS_LIMIT) ?? [],
  );
  const [stats, setStats] = useState<CampaignStats>(() =>
    initialCampaigns ? computeCampaignStats(initialCampaigns) : DEFAULT_STATS,
  );
  const [setupStatus, setSetupStatus] = useState<SetupStatus>(
    initialSetupStatus ?? DEFAULT_SETUP_STATUS,
  );
  const [storeName, setStoreName] = useState("");
  const [guideDismissed, setGuideDismissed] = useState(false);

  useEffect(() => {
    setStoreName(getStoreName());
  }, []);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEYS.GUIDE_DISMISSED);
    if (dismissed === "true") setGuideDismissed(true);
  }, []);

  useEffect(() => {
    if (!needsClientFetch) return;

    const fetchData = async () => {
      try {
        const [campaignsResponse, statusResponse] = await Promise.allSettled([
          initialCampaigns === null
            ? campaignsApi.list()
            : Promise.resolve(null),
          initialSetupStatus === null
            ? setupApi.getStatus()
            : Promise.resolve(null),
        ]);

        if (
          campaignsResponse.status === "fulfilled" &&
          campaignsResponse.value
        ) {
          const all = campaignsResponse.value.campaigns;
          setCampaigns(
            all.slice(0, CAMPAIGN_DEFAULTS.RECENT_CAMPAIGNS_LIMIT),
          );
          setStats(computeCampaignStats(all));
        }

        if (statusResponse.status === "fulfilled" && statusResponse.value) {
          setSetupStatus(statusResponse.value);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [needsClientFetch, initialCampaigns, initialSetupStatus]);

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

  return {
    loading,
    campaigns,
    stats,
    setupStatus,
    storeName,
    guideDismissed,
    refreshEmbedStatus,
    dismissGuide,
  };
}
