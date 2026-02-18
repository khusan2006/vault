import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds `type` and `config` columns to the campaigns table.
 * Migrates existing `benefits` array data into the new `config` object format.
 *
 * Run with: npx typeorm migration:run
 *
 * Note: In development, TypeORM's `synchronize: true` handles column creation
 * automatically. This migration is for production deployments and data reshaping.
 */
export class AddCampaignTypeAndConfig1739000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add new columns
    await queryRunner.query(`
      ALTER TABLE campaigns
      ADD COLUMN IF NOT EXISTS type varchar(30) NOT NULL DEFAULT 'early_access';
    `);

    await queryRunner.query(`
      ALTER TABLE campaigns
      ADD COLUMN IF NOT EXISTS config jsonb NOT NULL DEFAULT '{}';
    `);

    // Step 2: Migrate existing benefits data into type + config
    // Campaigns with visibility benefits → early_access
    await queryRunner.query(`
      UPDATE campaigns
      SET
        type = 'early_access',
        config = jsonb_build_object(
          'productIds', COALESCE(benefits->0->'productIds', '[]'::jsonb),
          'collectionIds', COALESCE(benefits->0->'collectionIds', '[]'::jsonb)
        )
      WHERE benefits IS NOT NULL
        AND jsonb_array_length(benefits) > 0
        AND benefits->0->>'type' = 'visibility'
        AND config = '{}'::jsonb;
    `);

    // Campaigns with discount benefits → discounted_product
    await queryRunner.query(`
      UPDATE campaigns
      SET
        type = 'discounted_product',
        config = jsonb_build_object(
          'productIds', COALESCE(benefits->0->'productIds', '[]'::jsonb),
          'collectionIds', COALESCE(benefits->0->'collectionIds', '[]'::jsonb),
          'discount', COALESCE(benefits->0->'discount', '{"type":"percentage","value":0}'::jsonb)
        )
      WHERE benefits IS NOT NULL
        AND jsonb_array_length(benefits) > 0
        AND benefits->0->>'type' = 'discount'
        AND config = '{}'::jsonb;
    `);

    // Campaigns with free_product benefits → timer_sale
    await queryRunner.query(`
      UPDATE campaigns
      SET
        type = 'timer_sale',
        config = jsonb_build_object(
          'productIds', COALESCE(benefits->0->'productIds', '[]'::jsonb),
          'collectionIds', COALESCE(benefits->0->'collectionIds', '[]'::jsonb),
          'discount', '{"type":"percentage","value":0}'::jsonb,
          'discountMethod', '"price_change"'::jsonb,
          'timerDurationMinutes', '60'::jsonb,
          'showCountdown', 'true'::jsonb
        )
      WHERE benefits IS NOT NULL
        AND jsonb_array_length(benefits) > 0
        AND benefits->0->>'type' = 'free_product'
        AND config = '{}'::jsonb;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE campaigns DROP COLUMN IF EXISTS config;
    `);
    await queryRunner.query(`
      ALTER TABLE campaigns DROP COLUMN IF EXISTS type;
    `);
  }
}
