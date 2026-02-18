import {
  resolveCampaignForBenefit,
  type CampaignIndex,
  type ResolvableBenefit,
} from '../benefits/resolve.js';
import { NOTIFICATION_DEFAULTS } from './defaults.js';

/** Resolved notification settings ready for rendering. */
export interface NotificationSettings {
  displayType: string;
  messageText: string;
  buttonText: string;
  buttonUrl: string;
  visuals: {
    primaryColor: string;
    textColor: string;
    position: string;
  };
  behavior: {
    autoDismissSeconds: number | null;
    showFrequency: string;
  };
}

function val<T>(v: T | undefined | null, def: T): T {
  return v !== undefined && v !== null ? v : def;
}

/**
 * Resolve notification settings for a benefit.
 * Priority: per-campaign displayConfig > campaign-type defaults.
 */
export function resolveSettings(
  benefit: ResolvableBenefit,
  campaignsIndex: CampaignIndex | null | undefined,
): NotificationSettings {
  const resolved = resolveCampaignForBenefit(benefit, campaignsIndex);
  const dc = resolved.config?.displayConfig as
    | { notification?: Record<string, unknown> }
    | undefined;
  const n = dc?.notification;
  const type = resolved.type;
  const base =
    (type && NOTIFICATION_DEFAULTS[type]) || NOTIFICATION_DEFAULTS.early_access;

  if (n && n.type) {
    const cfg: NotificationSettings = {
      displayType: n.type as string,
      messageText: val(n.message as string | undefined, base.message),
      buttonText: val(n.buttonText as string | undefined, base.buttonText),
      buttonUrl: val(n.buttonUrl as string | undefined, base.buttonUrl),
      visuals: (n.visuals as NotificationSettings['visuals']) || base.visuals,
      behavior: (n.behavior as NotificationSettings['behavior']) || base.behavior,
    };

    // Early access: if storefrontApproach is customer_page, update button URL
    const campConfig = resolved.config;
    if (
      type === 'early_access' &&
      campConfig &&
      'storefrontApproach' in campConfig &&
      campConfig.storefrontApproach === 'customer_page'
    ) {
      if (!cfg.buttonUrl || cfg.buttonUrl === '/apps/vault/exclusive') {
        cfg.buttonUrl = '/account';
      }
    }

    return cfg;
  }

  // No per-campaign config — use type-specific defaults
  return {
    displayType: base.type,
    messageText: base.message,
    buttonText: base.buttonText,
    buttonUrl: base.buttonUrl,
    visuals: base.visuals,
    behavior: base.behavior,
  };
}
