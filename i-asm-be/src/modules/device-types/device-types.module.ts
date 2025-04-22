import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceType } from './entities/device-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceType])],
  providers: [],
  exports: [TypeOrmModule]
})
export class DeviceTypesModule {}