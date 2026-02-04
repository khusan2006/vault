"use client";

import type { Campaign, CampaignListResponse, CampaignStatus } from "@/types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

async function getSessionToken(): Promise<string> {
  const token = await window.shopify?.idToken();
  if (!token) {
    throw new Error("No session token available");
  }
  return token;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const sessionToken = await getSessionToken();
  const url = `${BACKEND_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Campaign API
export const campaignsApi = {
  list: (params?: { status?: CampaignStatus; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());

    const query = searchParams.toString();
    return apiFetch<CampaignListResponse>(`/api/campaigns${query ? `?${query}` : ""}`);
  },

  get: (id: string) => {
    return apiFetch<Campaign>(`/api/campaigns/${id}`);
  },

  create: (data: Partial<Campaign>) => {
    return apiFetch<Campaign>("/api/campaigns", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: (id: string, data: Partial<Campaign>) => {
    return apiFetch<Campaign>(`/api/campaigns/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: (id: string) => {
    return apiFetch<void>(`/api/campaigns/${id}`, {
      method: "DELETE",
    });
  },

  duplicate: (id: string) => {
    return apiFetch<Campaign>(`/api/campaigns/${id}/duplicate`, {
      method: "POST",
    });
  },
};
