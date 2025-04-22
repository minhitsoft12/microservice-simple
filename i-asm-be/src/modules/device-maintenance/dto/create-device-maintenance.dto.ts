import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { MaintenanceType, MaintenanceStatus } from '@/modules/device-maintenance/entities/device-maintenance.entity';

export class CreateDeviceMaintenanceDto {
  @IsNotEmpty()
  @IsString()
  deviceId: string;

  @IsNotEmpty()
  @IsEnum(MaintenanceType)
  maintenanceType: MaintenanceType;

  @IsNotEmpty()
  @IsEnum(MaintenanceStatus)
  status: MaintenanceStatus;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  scheduledDate: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  completedDate?: Date;

  @IsNotEmpty()
  @IsString()
  performedBy: string;

  @IsOptional()
  @IsNumber()
  cost?: number;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  results?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
