import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionModule } from '../session/session.module.js';
import { Campaign } from '../campaigns/entities/campaign.entity.js';
import { ShopifyService } from './shopify.service.js';
import { AppMetafieldsService } from './app-metafields.service.js';
import { MetafieldSyncQueueService } from './metafield-sync-queue.service.js';
import { MetafieldSyncJob } from './entities/metafield-sync-job.entity.js';

@Module({
  imports: [
    SessionModule,
    TypeOrmModule.forFeature([Campaign, MetafieldSyncJob]),
  ],
  providers: [
    ShopifyService,
    AppMetafieldsService,
    MetafieldSyncQueueService,
  ],
  exports: [
    ShopifyService,
    AppMetafieldsService,
    MetafieldSyncQueueService,
  ],
})
export class ShopifyModule {}
