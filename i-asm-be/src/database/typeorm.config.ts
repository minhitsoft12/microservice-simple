import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { Device } from '@/modules/devices/entities/device.entity';
import { DeviceAssignment } from '@/modules/device-assignments/entities/device-assignment.entity';
import { DeviceTransaction } from '@/modules/device-transactions/entities/device-transaction.entity';
import { DeviceType } from '@/modules/device-types/entities/device-type.entity';
import { DeviceStatus } from '@/modules/device-status/entities/device-status.entity';
import { DeviceMaintenance } from '@/modules/device-maintenance/entities/device-maintenance.entity';

// Load environment variables
config();
const configService = new ConfigService();

export default new DataSource({
  type: 'mariadb',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 3306),
  username: configService.get('DB_USERNAME', 'root'),
  password: configService.get('DB_PASSWORD', ''),
  database: configService.get('DB_NAME', 'asm_management'),
  entities: [
    Device,
    DeviceAssignment,
    DeviceTransaction,
    DeviceType,
    DeviceStatus,
    DeviceMaintenance
  ],
  migrations: ['src/database/migrations/**/*.ts'],
  migrationsTableName: 'typeorm_migrations',
});