import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds `timerType` field to existing timer_sale campaign configs.
 * Defaults to 'per_customer' (the existing behavior).
 *
 * Run with: npx typeorm migration:run
 */
export class AddTimerTypeToConfig1739100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE campaigns
      SET config = config || '{"timerType": "per_customer"}'::jsonb
      WHERE type = 'timer_sale'
        AND NOT (config ? 'timerType');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE campaigns
      SET config = config - 'timerType'
      WHERE type = 'timer_sale';
    `);
  }
}
