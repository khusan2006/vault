
// --- External URLs ---
export const EXTERNAL_URLS = {
  DOCUMENTATION: "https://docs.thevault.app",
  SUPPORT_EMAIL: "mailto:support@thevault.app",
  APP_STORE_LISTING: "https://apps.shopify.com/the-vault",
  THEME_EDITOR: "shopify://admin/themes/current/editor?context=apps",
} as const;

// --- LocalStorage Keys ---
export const STORAGE_KEYS = {
  GUIDE_DISMISSED: "vault:guide-dismissed",
  PREFER_FULL_FORM: "vault_prefer_full_form",
} as const;

// --- Campaign Defaults ---
export const CAMPAIGN_DEFAULTS = {
  PRIORITY: 10 as number,
  STATUS: "draft" as const,
  RECENT_CAMPAIGNS_LIMIT: 5,
} as const;

// --- API ---
export const API_ENDPOINTS = {
  CAMPAIGNS: "/api/campaigns",
  SETUP_STATUS: "/api/setup-status",
} as const;

export const SERVER_FETCH_TIMEOUT_MS = 10000;

// --- Display Settings Defaults ---
// --- Campaign Status Options ---
export const CAMPAIGN_STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Archived", value: "archived" },
] as const;
