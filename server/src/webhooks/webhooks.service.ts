import { Injectable, Logger, RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { ShopifyService } from '../shopify/shopify.service.js';
import { SessionService } from '../session/session.service.js';
import { EvaluationService } from '../evaluation/evaluation.service.js';
import { CampaignsService } from '../campaigns/campaigns.service.js';

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
    private readonly evaluationService: EvaluationService,
    private readonly campaignsService: CampaignsService,
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
    await this.campaignsService.deleteByShop(shop);
    await this.evaluationService.deleteByShop(shop);
  }

  async handleCustomerUpdate(shop: string, payload: unknown): Promise<void> {
    const customer = payload as { id?: number };
    if (!customer?.id) {
      this.logger.warn('Customer update webhook missing customer ID');
      return;
    }

    const customerId = String(customer.id);
    this.logger.log(
      `Customer updated: ${customerId} on shop ${shop}, re-evaluating`,
    );

    try {
      await this.evaluationService.evaluateCustomer(shop, customerId);
    } catch (error) {
      this.logger.error(
        `Failed to re-evaluate customer ${customerId} on shop ${shop}`,
        error,
      );
    }
  }

  async handleOrderPaid(shop: string, payload: unknown): Promise<void> {
    const order = payload as {
      id?: number;
      customer?: { id?: number };
    };

    if (!order?.customer?.id) {
      this.logger.warn('Order paid webhook missing customer ID');
      return;
    }

    const customerId = String(order.customer.id);
    this.logger.log(
      `Order paid for customer ${customerId} on shop ${shop}`,
    );

    // Re-evaluate customer (order count / total spent may have changed)
    try {
      await this.evaluationService.evaluateCustomer(shop, customerId);
    } catch (error) {
      this.logger.error(
        `Failed to re-evaluate customer ${customerId} after order`,
        error,
      );
    }
  }
}
