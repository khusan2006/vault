import { SERVER_FETCH_TIMEOUT_MS } from "@/constants";
import { request } from "./fetcher";

/**
 * Server-side fetch for authenticated API calls during SSR.
 *
 * Uses `BACKEND_URL` (private env var — may point to an internal network
 * address) and enforces a timeout so slow responses don't block page loads.
 */

const BASE_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function serverFetch<T = unknown>(
  path: string,
  sessionToken: string,
): Promise<T> {
  return request<T>(`${BASE_URL}${path}`, sessionToken, {
    cache: "no-store",
    timeout: SERVER_FETCH_TIMEOUT_MS,
  });
}
