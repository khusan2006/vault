import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import type { Benefit } from '../../common/types/index.js';

export type ComputedBenefit = Benefit & {
  campaignId: string;
  campaignName: string;
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

  @Column({ name: 'customer_data_hash', nullable: true })
  customerDataHash!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'evaluated_at', type: 'timestamptz' })
  evaluatedAt!: Date;
}
