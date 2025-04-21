import {Module} from '@nestjs/common';
import {DevicesService} from '@/modules/devices/devices.service';
import {DevicesController} from '@/modules/devices/devices.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Device} from "@/modules/devices/entities/device.entity";
import {DeviceTransaction} from "@/modules/device-transactions/entities/device-transaction.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Device, DeviceTransaction])],
  controllers: [DevicesController],
  providers: [DevicesService],
})
export class DevicesModule {
}
