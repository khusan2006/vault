import { Injectable, Logger } from '@nestjs/common';
import { ShopifyService } from './shopify.service.js';
import { SessionService } from '../session/session.service.js';
import {
  METAFIELD_NAMESPACE,
  METAFIELD_KEYS,
} from '../common/constants/metafields.js';
import type { Campaign } from '../campaigns/entities/campaign.entity.js';

interface AppCampaignPayload {
  id: string;
  name: string;
  description: string | null;
  type: Campaign['type'];
  status: Campaign['status'];
  priority: number;
  startsAt: string | null;
  endsAt: string | null;
  config: Campaign['config'];
  updatedAt: string | null;
}

interface AppCampaignsPayload {
  schemaVersion: number;
  campaigns: AppCampaignPayload[];
}

interface CachedAppInstallation {
  id: string;
  cachedAt: number;
}

const APP_INSTALLATION_TTL_MS = 10 * 60 * 1000;

@Injectable()
export class AppMetafieldsService {
  private readonly logger = new Logger(AppMetafieldsService.name);
  private readonly appInstallationCache = new Map<string, CachedAppInstallation>();

  constructor(
    private readonly sessionService: SessionService,
    private readonly shopifyService: ShopifyService,
  ) {}

  async syncCampaigns(shopId: string, campaigns: Campaign[]): Promise<void> {
    const payload: AppCampaignsPayload = {
      schemaVersion: 1,
      campaigns: campaigns.map((campaign) => ({
        id: campaign.id,
        name: campaign.name,
        description: campaign.description ?? null,
        type: campaign.type,
        status: campaign.status,
        priority: campaign.priority,
        startsAt: campaign.startsAt?.toISOString() ?? null,
        endsAt: campaign.endsAt?.toISOString() ?? null,
        config: campaign.config,
        updatedAt: campaign.updatedAt?.toISOString() ?? null,
      })),
    };

    await this.setAppMetafields(shopId, [
      {
        key: METAFIELD_KEYS.APP_CAMPAIGNS,
        value: JSON.stringify(payload),
      },
    ]);
  }

  private async setAppMetafields(
    shopId: string,
    metafields: Array<{ key: string; value: string; type?: string }>,
  ): Promise<void> {
    const sessionResult = await this.sessionService.findOfflineByShop(shopId);
    if (!sessionResult) {
      this.logger.warn(
        `No offline session for shop ${shopId}, skipping app metafield sync`,
      );
      return;
    }

    const shopify = this.shopifyService.getClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = new shopify.clients.Graphql({
      session: {
        shop: shopId,
        accessToken: sessionResult.accessToken,
      } as any,
    });

    const ownerId = await this.getAppInstallationId(shopId, client);
    if (!ownerId) {
      this.logger.warn(
        `Unable to resolve app installation id for ${shopId}, skipping app metafield sync`,
      );
      return;
    }

    try {
      const response = await client.request(
        `mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafields) {
            metafields { id namespace key }
            userErrors { field message }
          }
        }`,
        {
          variables: {
            metafields: metafields.map((metafield) => ({
              ownerId,
              namespace: METAFIELD_NAMESPACE,
              key: metafield.key,
              type: metafield.type ?? 'json',
              value: metafield.value,
            })),
          },
        },
      );

      const userErrors = response?.data?.metafieldsSet?.userErrors ?? [];
      if (userErrors.length > 0) {
        this.logger.warn(
          `App metafield sync userErrors for ${shopId}: ${userErrors
            .map((e: { message?: string }) => e.message)
            .filter(Boolean)
            .join('; ')}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to sync app metafields for shop ${shopId}`,
        error,
      );
    }
  }

  private async getAppInstallationId(
    shopId: string,
    client: { request: (query: string, opts?: Record<string, unknown>) => Promise<any> },
  ): Promise<string | null> {
    const cached = this.appInstallationCache.get(shopId);
    if (cached && Date.now() - cached.cachedAt < APP_INSTALLATION_TTL_MS) {
      return cached.id;
    }

    try {
      const response = await client.request(
        `query AppInstallationId {
          currentAppInstallation { id }
        }`,
      );

      const id = response?.data?.currentAppInstallation?.id as
        | string
        | undefined;

      if (id) {
        this.appInstallationCache.set(shopId, {
          id,
          cachedAt: Date.now(),
        });
        return id;
      }
    } catch (error) {
      this.logger.error(
        `Failed to fetch app installation id for shop ${shopId}`,
        error,
      );
    }

    return null;
  }
}
