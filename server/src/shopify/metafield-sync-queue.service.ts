import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, Repository } from 'typeorm';
import { AppMetafieldsService } from './app-metafields.service.js';
import {
  MetafieldSyncJob,
  MetafieldSyncJobStatus,
  type MetafieldSyncJobType,
} from './entities/metafield-sync-job.entity.js';
import { Campaign } from '../campaigns/entities/campaign.entity.js';
import type {
  DiscountedProductConfig,
  EarlyAccessConfig,
  TimerSaleConfig,
} from '../common/types/index.js';
import {
  normalizeDisplayConfig,
} from '../common/types/display-config.types.js';
import type {
  DiscountedProductDisplayConfig,
  EarlyAccessDisplayConfig,
  TimerSaleDisplayConfig,
} from '../common/types/display-config.types.js';

const POLL_INTERVAL_MS = 5000;
const MAX_ATTEMPTS = 5;
const BASE_RETRY_DELAY_MS = 5000;
const MAX_RETRY_DELAY_MS = 5 * 60 * 1000;

@Injectable()
export class MetafieldSyncQueueService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(MetafieldSyncQueueService.name);
  private processing = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(
    @InjectRepository(MetafieldSyncJob)
    private readonly jobRepository: Repository<MetafieldSyncJob>,
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    private readonly appMetafieldsService: AppMetafieldsService,
  ) {}

  onModuleInit(): void {
    this.intervalId = setInterval(() => {
      void this.processQueue();
    }, POLL_INTERVAL_MS);
  }

  onModuleDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async enqueueCampaignSync(shopId: string): Promise<void> {
    await this.enqueueJob(shopId, 'campaigns');
  }

  private async enqueueJob(
    shopId: string,
    type: MetafieldSyncJobType,
  ): Promise<void> {
    const now = new Date();

    await this.jobRepository
      .createQueryBuilder()
      .insert()
      .values({
        shopId,
        type,
        status: 'pending',
        attempts: 0,
        nextRunAt: now,
        lastError: null,
      })
      .onConflict(
        `("shop_id","type") DO UPDATE SET status = 'pending', attempts = 0, next_run_at = EXCLUDED.next_run_at, last_error = NULL`,
      )
      .execute();
  }

  private async processQueue(): Promise<void> {
    if (this.processing) {
      return;
    }

    this.processing = true;

    try {
      const now = new Date();
      const job = await this.jobRepository.findOne({
        where: {
          status: In(['pending', 'failed'] as MetafieldSyncJobStatus[]),
          nextRunAt: LessThanOrEqual(now),
        },
        order: { nextRunAt: 'ASC', createdAt: 'ASC' },
      });

      if (!job) {
        return;
      }

      job.status = 'processing';
      await this.jobRepository.save(job);

      try {
        await this.handleJob(job);
        await this.jobRepository.delete({ id: job.id });
      } catch (error) {
        await this.markJobFailed(job, error);
      }
    } catch (error) {
      this.logger.error('Failed to process metafield sync queue', error);
    } finally {
      this.processing = false;
    }
  }

  private async handleJob(job: MetafieldSyncJob): Promise<void> {
    switch (job.type) {
      case 'campaigns':
        await this.syncCampaignMetafields(job.shopId);
        return;
    }
  }

  private async syncCampaignMetafields(shopId: string): Promise<void> {
    const campaigns = await this.campaignRepository.find({
      where: { shopId, status: 'active' },
      order: { priority: 'DESC', createdAt: 'DESC' },
    });

    const normalized = campaigns.map((campaign) => {
      switch (campaign.type) {
        case 'early_access': {
          const config = campaign.config as EarlyAccessConfig;
          return {
            ...campaign,
            config: {
              ...config,
              displayConfig: normalizeDisplayConfig(
                'early_access',
                config.displayConfig,
              ) as EarlyAccessDisplayConfig,
            },
          };
        }
        case 'discounted_product': {
          const config = campaign.config as DiscountedProductConfig;
          return {
            ...campaign,
            config: {
              ...config,
              displayConfig: normalizeDisplayConfig(
                'discounted_product',
                config.displayConfig,
              ) as DiscountedProductDisplayConfig,
            },
          };
        }
        case 'timer_sale': {
          const config = campaign.config as TimerSaleConfig;
          return {
            ...campaign,
            config: {
              ...config,
              displayConfig: normalizeDisplayConfig(
                'timer_sale',
                config.displayConfig,
              ) as TimerSaleDisplayConfig,
            },
          };
        }
      }
    });

    await this.appMetafieldsService.syncCampaigns(shopId, normalized);
  }

  private async markJobFailed(
    job: MetafieldSyncJob,
    error: unknown,
  ): Promise<void> {
    job.attempts += 1;
    job.status = 'failed';
    job.lastError = error instanceof Error ? error.message : 'Unknown error';

    if (job.attempts >= MAX_ATTEMPTS) {
      job.nextRunAt = null;
      this.logger.error(
        `Metafield sync job ${job.id} exceeded max attempts; leaving failed`,
      );
    } else {
      const delay = Math.min(
        BASE_RETRY_DELAY_MS * job.attempts,
        MAX_RETRY_DELAY_MS,
      );
      job.nextRunAt = new Date(Date.now() + delay);
      this.logger.warn(
        `Metafield sync job ${job.id} failed; retrying in ${delay}ms`,
      );
    }

    await this.jobRepository.save(job);
  }
}
