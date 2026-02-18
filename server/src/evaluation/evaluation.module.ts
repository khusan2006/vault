import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationCache } from './entities/evaluation-cache.entity.js';
import { EvaluationService } from './evaluation.service.js';
import { ConditionEvaluator } from './condition-evaluator.js';
import { CustomerDataService } from './customer-data.service.js';
import { MetafieldSyncService } from './metafield-sync.service.js';
import { CampaignsModule } from '../campaigns/campaigns.module.js';
import { SessionModule } from '../session/session.module.js';
import { ShopifyModule } from '../shopify/shopify.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([EvaluationCache]),
    CampaignsModule,
    SessionModule,
    ShopifyModule,
  ],
  providers: [
    EvaluationService,
    ConditionEvaluator,
    CustomerDataService,
    MetafieldSyncService,
  ],
  exports: [EvaluationService],
})
export class EvaluationModule {}
