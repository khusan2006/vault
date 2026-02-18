import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign, CampaignStatus } from './entities/campaign.entity.js';
import { CreateCampaignDto } from './dto/create-campaign.dto.js';
import { UpdateCampaignDto } from './dto/update-campaign.dto.js';
import type {
  CampaignConfig,
  CampaignType,
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
import { validateCampaignConfig } from './campaign-config.validator.js';
import { MetafieldSyncQueueService } from '../shopify/metafield-sync-queue.service.js';
import { EvaluationCache } from '../evaluation/entities/evaluation-cache.entity.js';

export interface CampaignListOptions {
  status?: CampaignStatus;
  type?: CampaignType;
  limit?: number;
  offset?: number;
}

export interface CampaignListResult {
  campaigns: Campaign[];
  total: number;
}

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @InjectRepository(EvaluationCache)
    private readonly evaluationCacheRepository: Repository<EvaluationCache>,
    private readonly metafieldSyncQueue: MetafieldSyncQueueService,
  ) {}

  async create(shopId: string, dto: CreateCampaignDto): Promise<Campaign> {
    const campaign = this.campaignRepository.create({
      shopId,
      type: dto.type,
      name: dto.name,
      description: dto.description ?? null,
      conditions: dto.conditions ?? { operator: 'AND', conditions: [] },
      config: this.normalizeConfig(dto.type, dto.config),
      priority: dto.priority ?? 0,
      status: dto.status ?? 'draft',
      startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
    });

    validateCampaignConfig(dto.type, campaign.config);

    const saved = await this.campaignRepository.save(campaign);
    await this.invalidateEvaluationCache(shopId);
    await this.metafieldSyncQueue.enqueueCampaignSync(shopId);
    return saved;
  }

  async findAll(
    shopId: string,
    options: CampaignListOptions = {},
  ): Promise<CampaignListResult> {
    const { status, type, limit = 50, offset = 0 } = options;
    const queryBuilder = this.campaignRepository
      .createQueryBuilder('campaign')
      .where('campaign.shopId = :shopId', { shopId })
      .orderBy('campaign.priority', 'DESC')
      .addOrderBy('campaign.createdAt', 'DESC')
      .take(limit)
      .skip(offset);

    if (status) {
      queryBuilder.andWhere('campaign.status = :status', { status });
    }

    if (type) {
      queryBuilder.andWhere('campaign.type = :type', { type });
    }

    const [campaigns, total] = await queryBuilder.getManyAndCount();

    const normalized = campaigns.map((campaign) => ({
      ...campaign,
      config: this.normalizeConfig(campaign.type, campaign.config),
    }));

    return { campaigns: normalized, total };
  }

  async findActive(shopId: string): Promise<Campaign[]> {
    const now = new Date();

    const campaigns = await this.campaignRepository
      .createQueryBuilder('campaign')
      .where('campaign.shopId = :shopId', { shopId })
      .andWhere('campaign.status = :status', { status: 'active' })
      .andWhere(
        '(campaign.startsAt IS NULL OR campaign.startsAt <= :now)',
        { now },
      )
      .andWhere(
        '(campaign.endsAt IS NULL OR campaign.endsAt >= :now)',
        { now },
      )
      .orderBy('campaign.priority', 'DESC')
      .getMany();

    return campaigns.map((campaign) => ({
      ...campaign,
      config: this.normalizeConfig(campaign.type, campaign.config),
    }));
  }

  async findOne(shopId: string, id: string): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { id, shopId },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID "${id}" not found`);
    }

    campaign.config = this.normalizeConfig(campaign.type, campaign.config);
    return campaign;
  }

  async update(
    shopId: string,
    id: string,
    dto: UpdateCampaignDto,
  ): Promise<Campaign> {
    const campaign = await this.findOne(shopId, id);

    if (dto.name !== undefined) campaign.name = dto.name;
    if (dto.description !== undefined) campaign.description = dto.description ?? null;
    if (dto.conditions !== undefined) campaign.conditions = dto.conditions;
    if (dto.config !== undefined) {
      campaign.config = this.mergeConfig(
        campaign.type,
        campaign.config,
        dto.config,
      );
      validateCampaignConfig(campaign.type, campaign.config);
    }
    if (dto.priority !== undefined) campaign.priority = dto.priority;
    if (dto.status !== undefined) campaign.status = dto.status;
    if (dto.startsAt !== undefined) {
      campaign.startsAt = dto.startsAt ? new Date(dto.startsAt) : null;
    }
    if (dto.endsAt !== undefined) {
      campaign.endsAt = dto.endsAt ? new Date(dto.endsAt) : null;
    }

    const saved = await this.campaignRepository.save(campaign);
    await this.invalidateEvaluationCache(shopId);
    await this.metafieldSyncQueue.enqueueCampaignSync(shopId);
    return saved;
  }

  async remove(shopId: string, id: string): Promise<void> {
    const campaign = await this.findOne(shopId, id);
    await this.campaignRepository.remove(campaign);
    await this.invalidateEvaluationCache(shopId);
    await this.metafieldSyncQueue.enqueueCampaignSync(shopId);
  }

  async duplicate(shopId: string, id: string): Promise<Campaign> {
    const original = await this.findOne(shopId, id);

    const duplicate = this.campaignRepository.create({
      shopId,
      type: original.type,
      name: `${original.name} (Copy)`,
      description: original.description,
      conditions: original.conditions,
      config: this.normalizeConfig(original.type, original.config),
      priority: original.priority,
      status: 'draft',
      startsAt: null,
      endsAt: null,
    });

    const saved = await this.campaignRepository.save(duplicate);
    await this.invalidateEvaluationCache(shopId);
    await this.metafieldSyncQueue.enqueueCampaignSync(shopId);
    return saved;
  }

  async deleteByShop(shopId: string): Promise<void> {
    await this.campaignRepository.delete({ shopId });
    await this.invalidateEvaluationCache(shopId);
    await this.metafieldSyncQueue.enqueueCampaignSync(shopId);
  }

  private normalizeConfig(
    type: CampaignType,
    config: CampaignConfig,
  ): CampaignConfig {
    switch (type) {
      case 'early_access': {
        const cfg = config as EarlyAccessConfig;
        const displayConfig = normalizeDisplayConfig(
          'early_access',
          cfg.displayConfig,
        ) as EarlyAccessDisplayConfig;
        return { ...cfg, displayConfig };
      }
      case 'discounted_product': {
        const cfg = config as DiscountedProductConfig;
        const displayConfig = normalizeDisplayConfig(
          'discounted_product',
          cfg.displayConfig,
        ) as DiscountedProductDisplayConfig;
        return { ...cfg, displayConfig };
      }
      case 'timer_sale': {
        const cfg = config as TimerSaleConfig;
        const displayConfig = normalizeDisplayConfig(
          'timer_sale',
          cfg.displayConfig,
        ) as TimerSaleDisplayConfig;
        return { ...cfg, displayConfig };
      }
    }
  }

  private mergeConfig(
    type: CampaignType,
    existing: CampaignConfig | null | undefined,
    incoming: CampaignConfig,
  ): CampaignConfig {
    const base = existing ?? ({} as CampaignConfig);
    const merged = { ...base, ...incoming };
    switch (type) {
      case 'early_access': {
        const cfg = merged as EarlyAccessConfig;
        const baseCfg = base as EarlyAccessConfig;
        const incomingCfg = incoming as EarlyAccessConfig;
        const displayConfig = normalizeDisplayConfig(
          'early_access',
          incomingCfg.displayConfig ?? baseCfg.displayConfig,
        ) as EarlyAccessDisplayConfig;
        return { ...cfg, displayConfig };
      }
      case 'discounted_product': {
        const cfg = merged as DiscountedProductConfig;
        const baseCfg = base as DiscountedProductConfig;
        const incomingCfg = incoming as DiscountedProductConfig;
        const displayConfig = normalizeDisplayConfig(
          'discounted_product',
          incomingCfg.displayConfig ?? baseCfg.displayConfig,
        ) as DiscountedProductDisplayConfig;
        return { ...cfg, displayConfig };
      }
      case 'timer_sale': {
        const cfg = merged as TimerSaleConfig;
        const baseCfg = base as TimerSaleConfig;
        const incomingCfg = incoming as TimerSaleConfig;
        const displayConfig = normalizeDisplayConfig(
          'timer_sale',
          incomingCfg.displayConfig ?? baseCfg.displayConfig,
        ) as TimerSaleDisplayConfig;
        return { ...cfg, displayConfig };
      }
    }
  }

  private async invalidateEvaluationCache(shopId: string): Promise<void> {
    await this.evaluationCacheRepository.delete({ shopId });
  }
}
