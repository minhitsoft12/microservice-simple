import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceTransaction } from './entities/device-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceTransaction])],
  providers: [],
  exports: [TypeOrmModule]
})
export class DeviceTransactionsModule {}