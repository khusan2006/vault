import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller.js';
import { WebhooksService } from './webhooks.service.js';
import { WebhookQueueService } from './webhook-queue.service.js';
import { ShopifyModule } from '../shopify/shopify.module.js';
import { SessionModule } from '../session/session.module.js';
import { EvaluationModule } from '../evaluation/evaluation.module.js';
import { CampaignsModule } from '../campaigns/campaigns.module.js';
import { DiscountsModule } from '../discounts/discounts.module.js';

@Module({
  imports: [
    ShopifyModule,
    SessionModule,
    EvaluationModule,
    CampaignsModule,
    DiscountsModule,
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhookQueueService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
