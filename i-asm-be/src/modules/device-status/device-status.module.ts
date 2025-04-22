import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceStatus } from './entities/device-status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceStatus])],
  providers: [],
  exports: [TypeOrmModule]
})
export class DeviceStatusModule {}