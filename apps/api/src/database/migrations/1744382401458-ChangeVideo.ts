import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeVideo1744382401458 implements MigrationInterface {
    name = 'ChangeVideo1744382401458'

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE videos 
        ALTER COLUMN display_order DROP NOT NULL,
        ALTER COLUMN display_order SET DEFAULT NULL;
      `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE videos 
        ALTER COLUMN display_order SET NOT NULL,
        ALTER COLUMN display_order SET DEFAULT 0;
      `);
    }
} 