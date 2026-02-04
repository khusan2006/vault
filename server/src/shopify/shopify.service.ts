import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  shopifyApi,
  ApiVersion,
  type AuthQuery,
  type Shopify,
} from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';

const SHOP_DOMAIN_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;

@Injectable()
export class ShopifyService implements OnModuleInit {
  private shopifyClient!: Shopify;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly scopes: string;
  private readonly hostName: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.getOrThrow<string>('shopify.apiKey');
    this.apiSecret = this.configService.getOrThrow<string>('shopify.apiSecret');
    this.scopes = this.configService.getOrThrow<string>('shopify.scopes');
    this.hostName = this.configService.get<string>('shopify.hostName') || 'localhost';
  }

  onModuleInit(): void {
    this.shopifyClient = shopifyApi({
      apiKey: this.apiKey,
      apiSecretKey: this.apiSecret,
      scopes: this.scopes.split(','),
      hostName: this.hostName,
      apiVersion: ApiVersion.January25,
      isEmbeddedApp: true,
    });
  }

  getClient(): Shopify {
    return this.shopifyClient;
  }

  isValidShopDomain(shop: string): boolean {
    return SHOP_DOMAIN_PATTERN.test(shop);
  }

  async verifyHmac(query: AuthQuery): Promise<boolean> {
    try {
      return await this.shopifyClient.utils.validateHmac(query);
    } catch {
      return false;
    }
  }
}
