import type { Campaign, CampaignListResponse, SetupStatus } from "@/types";
import { serverFetch } from "@/lib/api/server";
import { API_ENDPOINTS } from "@/constants";
import { HomeContent } from "./home-content";

interface HomePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const idToken = typeof params.id_token === "string" ? params.id_token : null;

  let initialCampaigns: Campaign[] | null = null;
  let initialSetupStatus: SetupStatus | null = null;
  if (idToken) {
    const [campaignsResult, setupResult] = await Promise.allSettled([
      serverFetch<CampaignListResponse>(API_ENDPOINTS.CAMPAIGNS, idToken),
      serverFetch<SetupStatus>(API_ENDPOINTS.SETUP_STATUS, idToken),
    ]);
    console.log("Fetch results", { campaignsResult, setupResult });
    if (campaignsResult.status === "fulfilled") {
      initialCampaigns = campaignsResult.value.campaigns;
    }

    if (setupResult.status === "fulfilled") {
      initialSetupStatus = setupResult.value;
    }
  }

  return (
    <HomeContent
      initialCampaigns={initialCampaigns}
      initialSetupStatus={initialSetupStatus}
    />
  );
}
