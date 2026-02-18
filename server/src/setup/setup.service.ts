import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SessionService } from '../session/session.service.js';
import { CampaignsService } from '../campaigns/campaigns.service.js';
import type { Campaign } from '../campaigns/entities/campaign.entity.js';

export interface SetupStatus {
  themeEmbedEnabled: boolean;
  hasCampaign: boolean;
  hasBenefits: boolean;
  hasActiveCampaign: boolean;
}

interface ThemeListResponse {
  themes: Array<{
    id: number;
    name: string;
    role: string;
  }>;
}

interface AssetResponse {
  asset: {
    key: string;
    value: string;
  };
}

@Injectable()
export class SetupService {
  private readonly logger = new Logger(SetupService.name);
  private readonly apiVersion: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
    private readonly campaignsService: CampaignsService,
  ) {
    this.apiVersion = '2025-01';
  }

  async getSetupStatus(shop: string): Promise<SetupStatus> {
    const [themeEmbedEnabled, campaignStatus] = await Promise.all([
      this.checkThemeEmbedStatus(shop),
      this.checkCampaignStatus(shop),
    ]);
    return {
      themeEmbedEnabled,
      ...campaignStatus,
    };
  }

  private async checkThemeEmbedStatus(shop: string): Promise<boolean> {
    try {
      const sessionData = await this.sessionService.findOfflineByShop(shop);
      if (!sessionData) {
        this.logger.warn(`No offline session found for shop ${shop}`);
        return false;
      }

      const { accessToken } = sessionData;

      // Step 1: Get the main/published theme
      const themesResponse = await this.shopifyRestGet<ThemeListResponse>(
        shop,
        accessToken,
        '/themes.json',
      );

      const mainTheme = themesResponse.themes.find(
        (t) => t.role === 'main',
      );

      if (!mainTheme) {
        this.logger.warn(`No main theme found for shop ${shop}`);
        return false;
      }

      // Step 2: Get the theme's settings_data.json
      const assetResponse = await this.shopifyRestGet<AssetResponse>(
        shop,
        accessToken,
        `/themes/${mainTheme.id}/assets.json?asset[key]=config/settings_data.json`,
      );

      // Step 3: Parse settings and check for our app embed block
      const settingsData = JSON.parse(assetResponse.asset.value);
      return this.isAppEmbedEnabled(settingsData);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to check theme embed status for ${shop}: ${message}`,
      );
      return false;
    }
  }

  /**
   * Check if our app embed block exists and is enabled in the theme settings.
   * The block type contains the extension UUID from the extension TOML config.
   */
  private isAppEmbedEnabled(settingsData: Record<string, unknown>): boolean {
    try {
      const current = settingsData.current as Record<string, unknown> | undefined;
      if (!current) return false;

      const blocks = current.blocks as
        | Record<string, { type?: string; disabled?: boolean }>
        | undefined;

      if (!blocks) return false;

      // Look for any block whose type references our app extension
      // The type pattern is: shopify://apps/{app_handle}/blocks/{block_name}/{extension_uid}
      for (const block of Object.values(blocks)) {
        if (!block.type) continue;

        // Match our extension by checking if the block type contains "vault" app reference
        const isOurBlock =
          block.type.includes('/apps/vault/') ||
          block.type.includes('/apps/the-vault/');

        if (isOurBlock) {
          // If disabled is explicitly true, the embed is off
          return block.disabled !== true;
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Check campaign-related setup status.
   */
  private async checkCampaignStatus(shop: string): Promise<{
    hasCampaign: boolean;
    hasBenefits: boolean;
    hasActiveCampaign: boolean;
  }> {
    try {
      const { campaigns } = await this.campaignsService.findAll(shop, {
        limit: 100,
      });

      const hasCampaign = campaigns.length > 0;
      const hasBenefits = campaigns.some((c) => this.hasTargetedBenefits(c));
      const hasActiveCampaign = campaigns.some((c) => c.status === 'active');

      return { hasCampaign, hasBenefits, hasActiveCampaign };
    } catch {
      return { hasCampaign: false, hasBenefits: false, hasActiveCampaign: false };
    }
  }

  private hasTargetedBenefits(campaign: { config: Campaign['config'] }): boolean {
    const { productIds, collectionIds } = campaign.config;
    return productIds.length > 0 || collectionIds.length > 0;
  }

  /**
   * Make a GET request to the Shopify Admin REST API.
   */
  private async shopifyRestGet<T>(
    shop: string,
    accessToken: string,
    path: string,
  ): Promise<T> {
    const url = `https://${shop}/admin/api/${this.apiVersion}${path}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Shopify API error: ${response.status} ${response.statusText}`,
      );
    }

    return response.json() as Promise<T>;
  }
}
