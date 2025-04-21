import {Module} from '@nestjs/common';
import {DeviceMaintenanceController} from "@/modules/device-maintenance/device-maintenance.controller";
import {DeviceMaintenanceService} from "@/modules/device-maintenance/device-maintenance.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {DeviceMaintenance} from "@/modules/device-maintenance/entities/device-maintenance.entity";
import {DeviceTransaction} from "@/modules/device-transactions/entities/device-transaction.entity";

@Module({
  imports: [TypeOrmModule.forFeature([DeviceMaintenance, DeviceTransaction])],
  controllers: [DeviceMaintenanceController],
  providers: [DeviceMaintenanceService]
})
export class DeviceMaintenanceModule {
}
