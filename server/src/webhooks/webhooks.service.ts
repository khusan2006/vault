import { Injectable, Logger, RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { ShopifyService } from '../shopify/shopify.service.js';
import { SessionService } from '../session/session.service.js';

export interface WebhookValidationResult {
  valid: boolean;
  topic?: string;
  shop?: string;
  payload?: unknown;
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly shopifyService: ShopifyService,
    private readonly sessionService: SessionService,
  ) {}

  async validateWebhook(request: RawBodyRequest<Request>): Promise<WebhookValidationResult> {
    const shopify = this.shopifyService.getClient();

    const topic = request.headers['x-shopify-topic'] as string;
    const shop = request.headers['x-shopify-shop-domain'] as string;
    const hmac = request.headers['x-shopify-hmac-sha256'] as string;

    if (!topic || !shop || !hmac || !request.rawBody) {
      return { valid: false };
    }

    try {
      const isValid = await shopify.webhooks.validate({
        rawBody: request.rawBody.toString('utf8'),
        rawRequest: request,
        rawResponse: {} as any,
      });

      if (!isValid) {
        return { valid: false };
      }

      const payload = JSON.parse(request.rawBody.toString('utf8'));

      return {
        valid: true,
        topic,
        shop,
        payload,
      };
    } catch (error) {
      this.logger.error('Webhook validation failed', error);
      return { valid: false };
    }
  }

  async handleAppUninstalled(shop: string): Promise<void> {
    this.logger.log(`App uninstalled from shop: ${shop}`);
    await this.sessionService.deleteByShop(shop);
  }
}
