import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateDeviceTypesTable1713772810001 implements MigrationInterface {
  name = 'CreateDeviceTypesTable1713772810001'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE device_types
        (
            id          VARCHAR(36)  NOT NULL,
            name        VARCHAR(100) NOT NULL,
            description TEXT NULL,
            isActive    TINYINT      NOT NULL DEFAULT 1,
            createdAt   TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            updatedAt   TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            UNIQUE INDEX IDX_device_types_name (name),
            PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS device_types`);
  }
}