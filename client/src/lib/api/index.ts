/**
 * Public API barrel — re-exports everything client components need.
 *
 * Client components:  import { campaignsApi } from "@/lib/api";
 * Server components:  import { serverFetch }  from "@/lib/api/server";
 */
export { campaignsApi, setupApi } from "./client";
