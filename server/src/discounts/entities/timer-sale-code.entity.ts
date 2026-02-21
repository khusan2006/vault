import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';

@Entity('timer_sale_codes')
@Index('idx_timer_sale_codes_shop', ['shopId'])
@Index('idx_timer_sale_codes_shop_campaign', ['shopId', 'campaignId'])
@Index('idx_timer_sale_codes_shop_customer', ['shopId', 'customerId'])
@Unique('uq_timer_sale_codes_shop_campaign_customer', [
  'shopId',
  'campaignId',
  'customerId',
])
export class TimerSaleCode {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'shop_id' })
  shopId!: string;

  @Column({ name: 'campaign_id', type: 'uuid' })
  campaignId!: string;

  @Column({ name: 'customer_id' })
  customerId!: string;

  @Column({ name: 'code' })
  code!: string;

  @Column({ name: 'price_rule_id', type: 'varchar', nullable: true })
  priceRuleId!: string | null;

  @Column({ name: 'discount_code_id', type: 'varchar', nullable: true })
  discountCodeId!: string | null;

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt!: Date;

  @Column({ name: 'ends_at', type: 'timestamptz' })
  endsAt!: Date;

  @Column({ name: 'used_at', type: 'timestamptz', nullable: true })
  usedAt!: Date | null;

  @Column({ name: 'used_order_id', type: 'varchar', nullable: true })
  usedOrderId!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
