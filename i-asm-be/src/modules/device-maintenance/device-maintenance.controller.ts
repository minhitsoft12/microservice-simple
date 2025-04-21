// device-maintenance/device-maintenance.controller.ts
import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DeviceMaintenanceService } from './device-maintenance.service';
import { CreateDeviceMaintenanceDto } from './dto/create-device-maintenance.dto';
import { UpdateDeviceMaintenanceDto } from './dto/update-device-maintenance.dto';
import { DeviceMaintenance } from './entities/device-maintenance.entity';

@Controller('device-maintenance')
export class DeviceMaintenanceController {
  constructor(private readonly deviceMaintenanceService: DeviceMaintenanceService) {}

  @Post()
  create(@Body() createMaintenanceDto: CreateDeviceMaintenanceDto): Promise<DeviceMaintenance> {
    return this.deviceMaintenanceService.create(createMaintenanceDto);
  }

  @Get()
  findAll(): Promise<DeviceMaintenance[]> {
    return this.deviceMaintenanceService.findAll();
  }

  @Get('pending')
  getPendingMaintenance(): Promise<DeviceMaintenance[]> {
    return this.deviceMaintenanceService.getPendingMaintenance();
  }

  @Get('device/:deviceId')
  findByDevice(@Param('deviceId') deviceId: string): Promise<DeviceMaintenance[]> {
    return this.deviceMaintenanceService.findByDevice(deviceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<DeviceMaintenance> {
    return this.deviceMaintenanceService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateMaintenanceDto: UpdateDeviceMaintenanceDto,
  ): Promise<DeviceMaintenance> {
    return this.deviceMaintenanceService.update(id, updateMaintenanceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.deviceMaintenanceService.remove(id);
  }

  // TCP microservice endpoints
  @MessagePattern({ cmd: 'createMaintenance' })
  createMaintenanceMicroservice(@Payload() createMaintenanceDto: CreateDeviceMaintenanceDto): Promise<DeviceMaintenance> {
    return this.deviceMaintenanceService.create(createMaintenanceDto);
  }

  @MessagePattern({ cmd: 'findAllMaintenance' })
  findAllMaintenanceMicroservice(): Promise<DeviceMaintenance[]> {
    return this.deviceMaintenanceService.findAll();
  }

  @MessagePattern({ cmd: 'findOneMaintenance' })
  findOneMaintenanceMicroservice(@Payload() data: { id: string }): Promise<DeviceMaintenance> {
    return this.deviceMaintenanceService.findOne(data.id);
  }

  @MessagePattern({ cmd: 'findMaintenanceByDevice' })
  findMaintenanceByDeviceMicroservice(@Payload() data: { deviceId: string }): Promise<DeviceMaintenance[]> {
    return this.deviceMaintenanceService.findByDevice(data.deviceId);
  }

  @MessagePattern({ cmd: 'getPendingMaintenance' })
  getPendingMaintenanceMicroservice(): Promise<DeviceMaintenance[]> {
    return this.deviceMaintenanceService.getPendingMaintenance();
  }

  @MessagePattern({ cmd: 'updateMaintenance' })
  updateMaintenanceMicroservice(@Payload() data: { id: string; updateMaintenanceDto: UpdateDeviceMaintenanceDto }): Promise<DeviceMaintenance> {
    return this.deviceMaintenanceService.update(data.id, data.updateMaintenanceDto);
  }
}