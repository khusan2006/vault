import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Campaign } from '../../campaigns/entities/campaign.entity.js';

export type ClaimStatus = 'pending' | 'fulfilled' | 'cancelled';

@Entity('claims')
@Index('idx_claims_shop', ['shopId'])
@Index('idx_claims_customer', ['shopId', 'customerId'])
@Unique('uq_claims_shop_campaign_customer_product', [
  'shopId',
  'campaignId',
  'customerId',
  'productId',
])
export class Claim {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'shop_id' })
  shopId!: string;

  @Column({ name: 'campaign_id', type: 'uuid' })
  campaignId!: string;

  @ManyToOne(() => Campaign, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaign_id' })
  campaign!: Campaign;

  @Column({ name: 'customer_id' })
  customerId!: string;

  @Column({ name: 'product_id' })
  productId!: string;

  @Column({ name: 'variant_id', nullable: true })
  variantId!: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  status!: ClaimStatus;

  @Column({ name: 'order_id', nullable: true })
  orderId!: string | null;

  @CreateDateColumn({ name: 'claimed_at', type: 'timestamptz' })
  claimedAt!: Date;

  @Column({ name: 'fulfilled_at', type: 'timestamptz', nullable: true })
  fulfilledAt!: Date | null;
}
