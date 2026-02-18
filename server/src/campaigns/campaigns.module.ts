import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign } from './entities/campaign.entity.js';
import { CampaignsService } from './campaigns.service.js';
import { CampaignsController } from './campaigns.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { ShopifyModule } from '../shopify/shopify.module.js';
import { EvaluationCache } from '../evaluation/entities/evaluation-cache.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Campaign, EvaluationCache]),
    AuthModule,
    ShopifyModule,
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {}
