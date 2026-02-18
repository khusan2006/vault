import { Suspense } from "react";
import type { Campaign, CampaignListResponse } from "@/types";
import { serverFetch } from "@/lib/api/server";
import { API_ENDPOINTS } from "@/constants";
import { CampaignsList } from "./campaigns-list";

interface CampaignsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CampaignsPage({
  searchParams,
}: CampaignsPageProps) {
  const params = await searchParams;
  const idToken = typeof params.id_token === "string" ? params.id_token : null;

  let initialCampaigns: Campaign[] | null = null;

  if (idToken) {
    try {
      const response = await serverFetch<CampaignListResponse>(
        API_ENDPOINTS.CAMPAIGNS,
        idToken,
      );
      initialCampaigns = response.campaigns;
    } catch {
      console.log("Failed to fetch campaigns for initial render");
    }
  }

  return (
    <Suspense fallback={null}>
      <CampaignsList initialCampaigns={initialCampaigns} />
    </Suspense>
  );
}
