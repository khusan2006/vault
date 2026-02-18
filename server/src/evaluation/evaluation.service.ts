import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluationCache } from './entities/evaluation-cache.entity.js';
import type { ComputedBenefit } from './entities/evaluation-cache.entity.js';
import { CampaignsService } from '../campaigns/campaigns.service.js';
import { CustomerDataService } from './customer-data.service.js';
import { ConditionEvaluator } from './condition-evaluator.js';
import { MetafieldSyncService } from './metafield-sync.service.js';
import type { Campaign } from '../campaigns/entities/campaign.entity.js';
import type { Benefit } from '../common/types/index.js';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class EvaluationService {
  private readonly logger = new Logger(EvaluationService.name);

  constructor(
    @InjectRepository(EvaluationCache)
    private readonly cacheRepository: Repository<EvaluationCache>,
    private readonly campaignsService: CampaignsService,
    private readonly customerDataService: CustomerDataService,
    private readonly conditionEvaluator: ConditionEvaluator,
    private readonly metafieldSyncService: MetafieldSyncService,
  ) {}

  async evaluateCustomer(
    shopId: string,
    customerId: string,
  ): Promise<ComputedBenefit[]> {
    // Check cache first (before fetching customer data for performance)
    const cached = await this.cacheRepository.findOne({
      where: { shopId, customerId: String(customerId) },
    });

    // Check if cached data has product handles (schema migration guard)
    const cacheHasHandles =
      cached?.computedBenefits?.every(
        (b) =>
          !b.productIds ||
          b.productIds.length === 0 ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((b as any).productHandles && (b as any).productHandles.length > 0),
      ) ?? false;

    if (
      cached &&
      cacheHasHandles &&
      Date.now() - cached.evaluatedAt.getTime() < CACHE_TTL_MS
    ) {
      this.logger.debug(
        `Cache hit for customer ${customerId} on shop ${shopId}`,
      );
      return cached.computedBenefits;
    }

    // Cache miss, expired, or missing handles — fetch fresh customer data
    const customerData =
      await this.customerDataService.fetchCustomerData(shopId, customerId);

    // Evaluate against active campaigns
    const activeCampaigns = await this.campaignsService.findActive(shopId);
    const eligibleCampaignIds: string[] = [];
    const allBenefits: ComputedBenefit[] = [];
    const seen = new Set<string>();

    for (const campaign of activeCampaigns) {
      const isEligible = this.conditionEvaluator.evaluate(
        customerData,
        campaign.conditions,
      );
      if (!isEligible) continue;

      eligibleCampaignIds.push(campaign.id);

    // Convert campaign config into benefit objects
    const benefits = this.extractBenefits(campaign);

      for (const benefit of benefits) {
        // Priority-based dedup: higher priority campaigns come first
        const productIds = benefit.productIds ?? ['__all__'];
        let isDuplicate = false;

        for (const pid of productIds) {
          const key = `${benefit.type}:${pid}`;
          if (seen.has(key)) {
            isDuplicate = true;
            break;
          }
        }

        if (isDuplicate) continue;

        for (const pid of productIds) {
          seen.add(`${benefit.type}:${pid}`);
        }

        // Strip GID prefixes so Liquid can match by numeric product.id
        const normalizedProductIds = (benefit.productIds ?? []).map((id) =>
          id.replace('gid://shopify/Product/', ''),
        );

        allBenefits.push({
          ...benefit,
          productIds:
            normalizedProductIds.length > 0
              ? normalizedProductIds
              : undefined,
          campaignId: campaign.id,
          campaignName: campaign.name,
          campaignType: campaign.type,
          campaignConfig: campaign.config,
          campaignEndsAt: campaign.endsAt?.toISOString() ?? null,
        });
      }
    }

    // Fetch product handles so Liquid can use all_products[handle]
    const allProductIds = new Set<string>();
    for (const benefit of allBenefits) {
      for (const pid of benefit.productIds ?? []) {
        allProductIds.add(pid);
      }
    }
    const handleMap = await this.customerDataService.fetchProductHandles(
      shopId,
      [...allProductIds],
    );

    // Enrich benefits with product handles
    for (const benefit of allBenefits) {
      if (benefit.productIds && benefit.productIds.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (benefit as any).productHandles = benefit.productIds
          .map((id) => handleMap.get(id))
          .filter((h): h is string => !!h);
      }
    }

    // Upsert cache
    if (cached) {
      cached.eligibleCampaignIds = eligibleCampaignIds;
      cached.computedBenefits = allBenefits;
      cached.customerDataHash = customerData.dataHash;
      cached.evaluatedAt = new Date();
      await this.cacheRepository.save(cached);
    } else {
      const entry = this.cacheRepository.create({
        shopId,
        customerId: String(customerId),
        eligibleCampaignIds,
        computedBenefits: allBenefits,
        customerDataHash: customerData.dataHash,
      });
      await this.cacheRepository.save(entry);
    }

    // Sync metafield — await to ensure Liquid can read the updated value
    try {
      await this.metafieldSyncService.syncCustomerMetafield(
        shopId,
        String(customerId),
        allBenefits,
      );
    } catch (err) {
      this.logger.error('Metafield sync failed', err);
    }

    this.logger.log(
      `Evaluated customer ${customerId} on ${shopId}: ${eligibleCampaignIds.length} campaigns, ${allBenefits.length} benefits`,
    );

    return allBenefits;
  }

  async getCachedBenefits(
    shopId: string,
    customerId: string,
  ): Promise<ComputedBenefit[] | null> {
    const cached = await this.cacheRepository.findOne({
      where: { shopId, customerId: String(customerId) },
    });

    if (!cached || Date.now() - cached.evaluatedAt.getTime() > CACHE_TTL_MS) {
      return null;
    }

    // Ensure cached data has product handles — if not, force re-evaluation
    const hasHandles = cached.computedBenefits.every(
      (b) =>
        !b.productIds ||
        b.productIds.length === 0 ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((b as any).productHandles && (b as any).productHandles.length > 0),
    );
    if (!hasHandles) {
      return null;
    }

    return cached.computedBenefits;
  }

  async deleteByShop(shopId: string): Promise<void> {
    await this.cacheRepository.delete({ shopId });
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Converts a campaign's `config` into an array of Benefit objects that the
   * rest of the pipeline expects.
   */
  private extractBenefits(campaign: Campaign): Benefit[] {
    if (!campaign.config || Object.keys(campaign.config).length === 0) {
      return [];
    }

    return [this.configToBenefit(campaign)];
  }

  /**
   * Maps campaign.type + campaign.config → a single Benefit object
   * that matches the existing storefront/metafield contract.
   */
  private configToBenefit(campaign: Campaign): Benefit {
    const config = campaign.config;

    switch (campaign.type) {
      case 'early_access':
        return {
          type: 'visibility',
          productIds: 'productIds' in config ? config.productIds : [],
          collectionIds: 'collectionIds' in config ? config.collectionIds : [],
        };

      case 'discounted_product':
        return {
          type: 'discount',
          productIds: 'productIds' in config ? config.productIds : [],
          collectionIds: 'collectionIds' in config ? config.collectionIds : [],
          discount:
            'discount' in config
              ? config.discount
              : { type: 'percentage', value: 0 },
        };

      case 'timer_sale':
        return {
          type: 'discount',
          productIds: 'productIds' in config ? config.productIds : [],
          collectionIds: 'collectionIds' in config ? config.collectionIds : [],
          discount:
            'discount' in config
              ? config.discount
              : { type: 'percentage', value: 0 },
        };

      default:
        this.logger.warn(
          `Unknown campaign type "${campaign.type}" for campaign ${campaign.id}`,
        );
        return {
          type: 'visibility',
          productIds: [],
          collectionIds: [],
        };
    }
  }
}
