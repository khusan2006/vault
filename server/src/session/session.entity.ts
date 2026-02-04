import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('sessions')
@Index('idx_session_shop_offline', ['shop', 'isOnline'], {
  where: '"isOnline" = false',
})
@Index('idx_session_shop_user_online', ['shop', 'userId', 'isOnline'], {
  where: '"isOnline" = true',
})
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  shop!: string;

  @Column({ type: 'varchar', nullable: true })
  userId!: string | null;

  @Column()
  accessToken!: string;

  @Column()
  scope!: string;

  @Column({ default: false })
  isOnline!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  onlineAccessInfo!: Record<string, unknown> | null;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
