import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateDeviceTransactionsTable1713772810005 implements MigrationInterface {
  name = 'CreateDeviceTransactionsTable1713772810005'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE device_transactions
        (
            id              VARCHAR(36)  NOT NULL,
            deviceId        VARCHAR(36)  NOT NULL,
            transactionType ENUM('purchase', 'assignment', 'return', 'maintenance', 'disposal', 'status_change', 'other') NOT NULL DEFAULT 'other',
            userId          VARCHAR(255) NULL,
            performedBy     VARCHAR(255) NULL,
            notes           TEXT NULL,
            metadata        JSON NULL,
            createdAt       TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            PRIMARY KEY (id),
            CONSTRAINT FK_device_transactions_deviceId FOREIGN KEY (deviceId) REFERENCES devices (id) ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS device_transactions`);
  }
}