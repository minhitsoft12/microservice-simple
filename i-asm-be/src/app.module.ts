// app.module.ts
import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ConfigModule, ConfigService} from '@nestjs/config';

import {DevicesModule} from '@/modules/devices/devices.module';
import {DeviceAssignmentsModule} from '@/modules/device-assignments/device-assignments.module';
import {DeviceTransactionsModule} from '@/modules/device-transactions/device-transactions.module';
import {DeviceTypesModule} from '@/modules/device-types/device-types.module';
import {DeviceStatusModule} from '@/modules/device-status/device-status.module';
import {DeviceMaintenanceModule} from '@/modules/device-maintenance/device-maintenance.module';
import {UsersModule} from "@/modules/users/users.module";

import {Device} from '@/modules/devices/entities/device.entity';
import {DeviceAssignment} from '@/modules/device-assignments/entities/device-assignment.entity';
import {DeviceTransaction} from '@/modules/device-transactions/entities/device-transaction.entity';
import {DeviceType} from '@/modules/device-types/entities/device-type.entity';
import {DeviceStatus} from '@/modules/device-status/entities/device-status.entity';
import {DeviceMaintenance} from '@/modules/device-maintenance/entities/device-maintenance.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mariadb',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3306),
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
        synchronize: configService.get('DB_SYNC', false),
        logging: configService.get('DB_LOGGING', false),
      }),
    }),
    UsersModule,
    DevicesModule,
    DeviceAssignmentsModule,
    DeviceTransactionsModule,
    DeviceTypesModule,
    DeviceStatusModule,
    DeviceMaintenanceModule,
  ],
})
export class AppModule {}