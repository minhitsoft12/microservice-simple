import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateDevicesTable1713772810002 implements MigrationInterface {
  name = 'CreateDevicesTable1713772810002'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE devices
        (
            id                 VARCHAR(36)  NOT NULL,
            name               VARCHAR(100) NOT NULL,
            serialNumber       VARCHAR(100) NOT NULL,
            model              VARCHAR(255) NULL,
            manufacturer       VARCHAR(255) NULL,
            purchaseDate       DATE NULL,
            purchasePrice      DECIMAL(10, 2) NULL,
            warrantyExpiryDate DATE NULL,
            notes              TEXT NULL,
            deviceTypeId       VARCHAR(36)  NOT NULL,
            statusId           VARCHAR(36)  NOT NULL,
            createdAt          TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            updatedAt          TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            UNIQUE INDEX IDX_devices_serialNumber (serialNumber),
            PRIMARY KEY (id),
            CONSTRAINT FK_devices_deviceTypeId FOREIGN KEY (deviceTypeId) REFERENCES device_types (id) ON DELETE RESTRICT ON UPDATE CASCADE,
            CONSTRAINT FK_devices_statusId FOREIGN KEY (statusId) REFERENCES device_statuses (id) ON DELETE RESTRICT ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS devices`);
  }
}