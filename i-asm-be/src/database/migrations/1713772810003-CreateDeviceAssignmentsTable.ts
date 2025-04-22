import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateDeviceAssignmentsTable1713772810003 implements MigrationInterface {
  name = 'CreateDeviceAssignmentsTable1713772810003'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE device_assignments
        (
            id              VARCHAR(36)  NOT NULL,
            deviceId        VARCHAR(36)  NOT NULL,
            userId          VARCHAR(100) NOT NULL,
            assignedAt      TIMESTAMP    NOT NULL,
            returnedAt      TIMESTAMP NULL,
            assignmentNotes TEXT NULL,
            returnNotes     TEXT NULL,
            isActive        TINYINT      NOT NULL DEFAULT 1,
            assignedBy      VARCHAR(255) NULL,
            returnedBy      VARCHAR(255) NULL,
            createdAt       TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            updatedAt       TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            PRIMARY KEY (id),
            CONSTRAINT FK_device_assignments_deviceId FOREIGN KEY (deviceId) REFERENCES devices (id) ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS device_assignments`);
  }
}