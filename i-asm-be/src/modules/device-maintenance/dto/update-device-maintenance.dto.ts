import { PartialType } from '@nestjs/mapped-types';
import { CreateDeviceMaintenanceDto } from './create-device-maintenance.dto';

export class UpdateDeviceMaintenanceDto extends PartialType(CreateDeviceMaintenanceDto) {}