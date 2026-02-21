import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimerSaleCodes1762000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS timer_sale_codes (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        shop_id varchar NOT NULL,
        campaign_id uuid NOT NULL,
        customer_id varchar NOT NULL,
        code varchar NOT NULL,
        price_rule_id varchar NULL,
        discount_code_id varchar NULL,
        starts_at timestamptz NOT NULL,
        ends_at timestamptz NOT NULL,
        used_at timestamptz NULL,
        used_order_id varchar NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_timer_sale_codes_shop
      ON timer_sale_codes (shop_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_timer_sale_codes_shop_campaign
      ON timer_sale_codes (shop_id, campaign_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_timer_sale_codes_shop_customer
      ON timer_sale_codes (shop_id, customer_id);
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_timer_sale_codes_shop_campaign_customer
      ON timer_sale_codes (shop_id, campaign_id, customer_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS timer_sale_codes;
    `);
  }
}
