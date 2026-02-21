import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { configuration } from './config/configuration.js';
import { Session } from './session/session.entity.js';
import { SessionModule } from './session/session.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ShopifyModule } from './shopify/shopify.module.js';
import { WebhooksModule } from './webhooks/webhooks.module.js';
import { CommonModule } from './common/common.module.js';
import { ShopThrottlerGuard } from './common/guards/shop-throttler.guard.js';
import { AppController } from './app.controller.js';
import { Campaign } from './campaigns/entities/campaign.entity.js';
import { CampaignsModule } from './campaigns/campaigns.module.js';
import { EvaluationCache } from './evaluation/entities/evaluation-cache.entity.js';
import { EvaluationModule } from './evaluation/evaluation.module.js';
import { ProxyModule } from './proxy/proxy.module.js';
import { SetupModule } from './setup/setup.module.js';
import { MetafieldSyncJob } from './shopify/entities/metafield-sync-job.entity.js';
import { DiscountsModule } from './discounts/discounts.module.js';
import { TimerSaleCode } from './discounts/entities/timer-sale-code.entity.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 50,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 200,
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('database.host', 'localhost'),
        port: configService.get<number>('database.port', 5432),
        username: configService.get<string>('database.username', 'postgres'),
        password: configService.get<string>('database.password', ''),
        database: configService.get<string>('database.name', 'shopify_app'),
        entities: [
          Session,
          Campaign,
          EvaluationCache,
          MetafieldSyncJob,
          TimerSaleCode,
        ],
        synchronize: configService.get<string>('nodeEnv') !== 'production',
        ssl: configService.get<boolean>('database.ssl', false)
          ? { rejectUnauthorized: false }
          : false,
      }),
    }),
    CommonModule,
    SessionModule,
    AuthModule,
    ShopifyModule,
    WebhooksModule,
    CampaignsModule,
    EvaluationModule,
    ProxyModule,
    SetupModule,
    DiscountsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ShopThrottlerGuard,
    },
  ],
})
export class AppModule {}
