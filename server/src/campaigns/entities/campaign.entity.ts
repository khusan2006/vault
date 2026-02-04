import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import type { ConditionGroup, Benefit } from '../../common/types/index.js';

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'archived';

@Entity('campaigns')
@Index('idx_campaigns_shop', ['shopId'])
@Index('idx_campaigns_shop_status', ['shopId', 'status'])
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'shop_id' })
  shopId!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'jsonb' })
  conditions!: ConditionGroup;

  @Column({ type: 'jsonb' })
  benefits!: Benefit[];

  @Column({ type: 'int', default: 0 })
  priority!: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'draft',
  })
  status!: CampaignStatus;

  @Column({ name: 'starts_at', type: 'timestamptz', nullable: true })
  startsAt!: Date | null;

  @Column({ name: 'ends_at', type: 'timestamptz', nullable: true })
  endsAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
