import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Removes legacy display settings/claims storage and benefits column,
 * and adds a durable metafield sync queue for campaign metafields.
 */
export class RemoveLegacyAndAddMetafieldSyncQueue1761000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    await queryRunner.query(`
      ALTER TABLE campaigns DROP COLUMN IF EXISTS benefits;
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS display_settings;
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS claims;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS metafield_sync_jobs (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        shop_id varchar NOT NULL,
        type varchar(30) NOT NULL,
        status varchar(20) NOT NULL DEFAULT 'pending',
        attempts int NOT NULL DEFAULT 0,
        next_run_at timestamptz NULL,
        last_error text NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_metafield_sync_shop_status
      ON metafield_sync_jobs (shop_id, status);
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_metafield_sync_shop_type
      ON metafield_sync_jobs (shop_id, type);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS metafield_sync_jobs;
    `);

    await queryRunner.query(`
      ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS benefits jsonb;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS display_settings (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        shop_id varchar NOT NULL UNIQUE,
        display_type varchar(20) NOT NULL DEFAULT 'banner',
        message_text text NOT NULL DEFAULT 'You have access to exclusive products!',
        button_text varchar(100) NOT NULL DEFAULT 'View Exclusive Products',
        button_url varchar(500) NOT NULL DEFAULT '/apps/vault/exclusive',
        visuals jsonb NOT NULL DEFAULT '{"primaryColor":"#7c3aed","textColor":"#ffffff","position":"top"}',
        behavior jsonb NOT NULL DEFAULT '{"autoDismissSeconds":null,"showFrequency":"once_per_day"}',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS claims (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        shop_id varchar NOT NULL,
        campaign_id uuid NOT NULL,
        customer_id varchar NOT NULL,
        product_id varchar NOT NULL,
        variant_id varchar NULL,
        status varchar(20) NOT NULL DEFAULT 'pending',
        order_id varchar NULL,
        claimed_at timestamptz NOT NULL DEFAULT now(),
        fulfilled_at timestamptz NULL
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_claims_shop ON claims (shop_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_claims_customer ON claims (shop_id, customer_id);
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_claims_shop_campaign_customer_product
      ON claims (shop_id, campaign_id, customer_id, product_id);
    `);
  }
}
