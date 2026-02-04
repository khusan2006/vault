import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign, CampaignStatus } from './entities/campaign.entity.js';
import { CreateCampaignDto } from './dto/create-campaign.dto.js';
import { UpdateCampaignDto } from './dto/update-campaign.dto.js';

export interface CampaignListOptions {
  status?: CampaignStatus;
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
  ) {}

  async create(shopId: string, dto: CreateCampaignDto): Promise<Campaign> {
    const campaign = this.campaignRepository.create({
      shopId,
      name: dto.name,
      description: dto.description ?? null,
      conditions: dto.conditions,
      benefits: dto.benefits,
      priority: dto.priority ?? 0,
      status: dto.status ?? 'draft',
      startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
    });

    return this.campaignRepository.save(campaign);
  }

  async findAll(
    shopId: string,
    options: CampaignListOptions = {},
  ): Promise<CampaignListResult> {
    const { status, limit = 50, offset = 0 } = options;

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

    const [campaigns, total] = await queryBuilder.getManyAndCount();

    return { campaigns, total };
  }

  async findActive(shopId: string): Promise<Campaign[]> {
    const now = new Date();

    return this.campaignRepository
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
  }

  async findOne(shopId: string, id: string): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { id, shopId },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID "${id}" not found`);
    }

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
    if (dto.benefits !== undefined) campaign.benefits = dto.benefits;
    if (dto.priority !== undefined) campaign.priority = dto.priority;
    if (dto.status !== undefined) campaign.status = dto.status;
    if (dto.startsAt !== undefined) {
      campaign.startsAt = dto.startsAt ? new Date(dto.startsAt) : null;
    }
    if (dto.endsAt !== undefined) {
      campaign.endsAt = dto.endsAt ? new Date(dto.endsAt) : null;
    }

    return this.campaignRepository.save(campaign);
  }

  async remove(shopId: string, id: string): Promise<void> {
    const campaign = await this.findOne(shopId, id);
    await this.campaignRepository.remove(campaign);
  }

  async duplicate(shopId: string, id: string): Promise<Campaign> {
    const original = await this.findOne(shopId, id);

    const duplicate = this.campaignRepository.create({
      shopId,
      name: `${original.name} (Copy)`,
      description: original.description,
      conditions: original.conditions,
      benefits: original.benefits,
      priority: original.priority,
      status: 'draft',
      startsAt: null,
      endsAt: null,
    });

    return this.campaignRepository.save(duplicate);
  }

  async deleteByShop(shopId: string): Promise<void> {
    await this.campaignRepository.delete({ shopId });
  }
}
