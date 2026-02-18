import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import type { Benefit, CampaignType, CampaignConfig } from '../../common/types/index.js';

/**
 * A computed benefit is the evaluation output stored in the cache and synced
 * to Shopify metafields. It carries the campaign context alongside the config
 * so the storefront extension knows how to render.
 *
 * The `type` field here refers to the legacy BenefitType ('visibility' | 'discount')
 * for backward compatibility with existing storefront code.
 * `campaignType` is the new discriminant ('early_access' | 'discounted_product' | 'timer_sale').
 */
export type ComputedBenefit = Benefit & {
  campaignId: string;
  campaignName: string;
  campaignType?: CampaignType;
  campaignConfig?: CampaignConfig;
  campaignEndsAt?: string | null;
};

@Entity('evaluation_cache')
@Index('idx_evaluation_cache_shop', ['shopId'])
@Unique('uq_evaluation_cache_shop_customer', ['shopId', 'customerId'])
export class EvaluationCache {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'shop_id' })
  shopId!: string;

  @Column({ name: 'customer_id' })
  customerId!: string;

  @Column({ name: 'eligible_campaign_ids', type: 'jsonb', default: [] })
  eligibleCampaignIds!: string[];

  @Column({ name: 'computed_benefits', type: 'jsonb', default: [] })
  computedBenefits!: ComputedBenefit[];

  @Column({ name: 'customer_data_hash', type: 'varchar', nullable: true })
  customerDataHash!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'evaluated_at', type: 'timestamptz' })
  evaluatedAt!: Date;
}
