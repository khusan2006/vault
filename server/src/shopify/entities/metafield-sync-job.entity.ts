import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';

export type MetafieldSyncJobType = 'campaigns';

export type MetafieldSyncJobStatus = 'pending' | 'processing' | 'failed';

@Entity('metafield_sync_jobs')
@Index('idx_metafield_sync_shop_status', ['shopId', 'status'])
@Unique('uq_metafield_sync_shop_type', ['shopId', 'type'])
export class MetafieldSyncJob {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'shop_id' })
  shopId!: string;

  @Column({ type: 'varchar', length: 30 })
  type!: MetafieldSyncJobType;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: MetafieldSyncJobStatus;

  @Column({ type: 'int', default: 0 })
  attempts!: number;

  @Column({ name: 'next_run_at', type: 'timestamptz', nullable: true })
  nextRunAt!: Date | null;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
