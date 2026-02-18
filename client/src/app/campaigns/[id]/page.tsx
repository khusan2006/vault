import type { Campaign } from "@/types";
import { serverFetch } from "@/lib/api/server";
import { API_ENDPOINTS } from "@/constants";
import EditCampaignClient from "./edit-campaign-client";

interface EditCampaignPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EditCampaignPage({
  params,
  searchParams,
}: EditCampaignPageProps) {
  const [routeParams, query] = await Promise.all([params, searchParams]);
  const idToken = typeof query.id_token === "string" ? query.id_token : null;

  let initialCampaign: Campaign | null = null;
  if (idToken) {
    try {
      initialCampaign = await serverFetch<Campaign>(
        `${API_ENDPOINTS.CAMPAIGNS}/${routeParams.id}`,
        idToken,
      );
    } catch {
      console.log("Failed to fetch campaign for initial render");
    }
  }

  return (
    <EditCampaignClient
      campaignId={routeParams.id}
      initialCampaign={initialCampaign}
    />
  );
}
