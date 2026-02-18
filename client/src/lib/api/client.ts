"use client";

import { API_ENDPOINTS } from "@/constants";
import type {
  Campaign,
  CampaignListResponse,
  CampaignStatus,
  CampaignType,
  SetupStatus,
} from "@/types";
import { request } from "./fetcher";

// ---------------------------------------------------------------------------
// Client-side base URL (public env var, available in the browser)
// ---------------------------------------------------------------------------

const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

// ---------------------------------------------------------------------------
// Session token (resolved via Shopify App Bridge)
// ---------------------------------------------------------------------------

async function getSessionToken(): Promise<string> {
  const token = await window.shopify?.idToken();
  if (!token) {
    throw new Error("No session token available");
  }
  return token;
}

async function clientFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getSessionToken();
  return request<T>(`${BASE_URL}${path}`, token, options);
}

// ---------------------------------------------------------------------------
// Domain APIs
// ---------------------------------------------------------------------------

export const campaignsApi = {
  list: (params?: {
    status?: CampaignStatus;
    type?: CampaignType;
    limit?: number;
    offset?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.type) searchParams.set("type", params.type);
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());

    const query = searchParams.toString();
    return clientFetch<CampaignListResponse>(
      `${API_ENDPOINTS.CAMPAIGNS}${query ? `?${query}` : ""}`,
    );
  },

  get: (id: string) =>
    clientFetch<Campaign>(`${API_ENDPOINTS.CAMPAIGNS}/${id}`),

  create: (data: Partial<Campaign>) =>
    clientFetch<Campaign>(API_ENDPOINTS.CAMPAIGNS, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Campaign>) =>
    clientFetch<Campaign>(`${API_ENDPOINTS.CAMPAIGNS}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    clientFetch<void>(`${API_ENDPOINTS.CAMPAIGNS}/${id}`, {
      method: "DELETE",
    }),

  duplicate: (id: string) =>
    clientFetch<Campaign>(`${API_ENDPOINTS.CAMPAIGNS}/${id}/duplicate`, {
      method: "POST",
    }),
};

export const setupApi = {
  getStatus: () => clientFetch<SetupStatus>(API_ENDPOINTS.SETUP_STATUS),
};
