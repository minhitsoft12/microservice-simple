import {Body, Controller, Delete, Get, Param, Post, Put} from '@nestjs/common';
import {MessagePattern, Payload} from '@nestjs/microservices';
import {DevicesService} from './devices.service';
import {CreateDeviceDto} from './dto/create-device.dto';
import {UpdateDeviceDto} from './dto/update-device.dto';
import {Device} from './entities/device.entity';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {
  }

  @Post()
  create(
    @Body() createDeviceDto: CreateDeviceDto,
    @Body('createdBy') createdBy: string,
  ): Promise<Device> {
    return this.devicesService.create(createDeviceDto, createdBy);
  }

  @Get()
  findAll(): Promise<Device[]> {
    return this.devicesService.findAll();
  }

  @Get('status/:statusId')
  findByStatus(@Param('statusId') statusId: string): Promise<Device[]> {
    return this.devicesService.findByStatus(statusId);
  }

  @Get('type/:typeId')
  findByType(@Param('typeId') typeId: string): Promise<Device[]> {
    return this.devicesService.findByType(typeId);
  }

  @Get('statistics')
  getDeviceStatistics(): Promise<any> {
    return this.devicesService.getDeviceStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Device> {
    return this.devicesService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
    @Body('updatedBy') updatedBy: string,
  ): Promise<Device> {
    return this.devicesService.update(id, updateDeviceDto, updatedBy);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('statusId') statusId: string,
    @Body('updatedBy') updatedBy: string,
    @Body('notes') notes?: string,
  ): Promise<Device> {
    return this.devicesService.updateStatus(id, statusId, updatedBy, notes);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Body('removedBy') removedBy: string,
    @Body('notes') notes?: string,
  ): Promise<void> {
    return this.devicesService.remove(id, removedBy, notes);
  }

  // TCP microservice endpoints
  @MessagePattern({cmd: 'findAllDevices'})
  findAllDevicesMicroservice(): Promise<Device[]> {
    return this.devicesService.findAll();
  }

  @MessagePattern({cmd: 'findOneDevice'})
  findOneDeviceMicroservice(@Payload() data: { id: string }): Promise<Device> {
    return this.devicesService.findOne(data.id);
  }

  @MessagePattern({cmd: 'createDevice'})
  createDeviceMicroservice(@Payload() data: { createDeviceDto: CreateDeviceDto; createdBy: string }): Promise<Device> {
    return this.devicesService.create(data.createDeviceDto, data.createdBy);
  }

  @MessagePattern({cmd: 'updateDevice'})
  updateDeviceMicroservice(@Payload() data: { id: string; updateDeviceDto: UpdateDeviceDto; updatedBy: string }): Promise<Device> {
    return this.devicesService.update(data.id, data.updateDeviceDto, data.updatedBy);
  }

  @MessagePattern({cmd: 'updateDeviceStatus'})
  updateDeviceStatusMicroservice(@Payload() data: { id: string; statusId: string; updatedBy: string; notes?: string }): Promise<Device> {
    return this.devicesService.updateStatus(data.id, data.statusId, data.updatedBy, data.notes);
  }

  @MessagePattern({cmd: 'getDeviceStatistics'})
  getDeviceStatisticsMicroservice(): Promise<any> {
    return this.devicesService.getDeviceStatistics();
  }
}