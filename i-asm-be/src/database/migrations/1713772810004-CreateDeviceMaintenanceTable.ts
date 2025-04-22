import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateDeviceMaintenanceTable1713772810004 implements MigrationInterface {
  name = 'CreateDeviceMaintenanceTable1713772810004'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE device_maintenance
        (
            id              VARCHAR(36)  NOT NULL,
            deviceId        VARCHAR(36)  NOT NULL,
            maintenanceType ENUM('repair', 'upgrade', 'routine', 'inspection', 'other') NOT NULL DEFAULT 'other',
            status          ENUM('scheduled', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
            scheduledDate   TIMESTAMP    NOT NULL,
            completedDate   TIMESTAMP NULL,
            performedBy     VARCHAR(255) NULL,
            cost            DECIMAL(10, 2) NULL,
            description     TEXT NULL,
            results         TEXT NULL,
            notes           TEXT NULL,
            createdAt       TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            updatedAt       TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            PRIMARY KEY (id),
            CONSTRAINT FK_device_maintenance_deviceId FOREIGN KEY (deviceId) REFERENCES devices (id) ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS device_maintenance`);
  }
}