import {Body, Controller, Get, Param, Post, Put} from '@nestjs/common';
import {MessagePattern, Payload} from '@nestjs/microservices';
import {DeviceAssignmentsService} from './device-assignments.service';
import {CreateDeviceAssignmentDto} from './dto/create-device-assignment.dto';
import {ReturnDeviceDto} from './dto/return-device.dto';
import {DeviceAssignment} from './entities/device-assignment.entity';

@Controller('device-assignments')
export class DeviceAssignmentsController {
  constructor(private readonly deviceAssignmentsService: DeviceAssignmentsService) {
  }

  @Post()
  assignDevice(@Body() createAssignmentDto: CreateDeviceAssignmentDto): Promise<DeviceAssignment> {
    return this.deviceAssignmentsService.assignDevice(createAssignmentDto);
  }

  @Put(':id/return')
  returnDevice(
    @Param('id') id: string,
    @Body() returnDeviceDto: ReturnDeviceDto,
  ): Promise<DeviceAssignment> {
    return this.deviceAssignmentsService.returnDevice(id, returnDeviceDto);
  }

  @Get('active')
  findActiveAssignments(): Promise<DeviceAssignment[]> {
    return this.deviceAssignmentsService.findActiveAssignments();
  }

  @Get('user/:userId')
  findUserAssignments(@Param('userId') userId: string): Promise<DeviceAssignment[]> {
    return this.deviceAssignmentsService.findUserAssignments(userId);
  }

  @Get('device/:deviceId')
  findDeviceAssignmentHistory(@Param('deviceId') deviceId: string): Promise<DeviceAssignment[]> {
    return this.deviceAssignmentsService.findDeviceAssignmentHistory(deviceId);
  }

  @Get(':id/with-user')
  getAssignmentWithUserDetails(@Param('id') id: string): Promise<any> {
    return this.deviceAssignmentsService.getAssignmentWithUserDetails(id);
  }

  // TCP microservice endpoints
  @MessagePattern({cmd: 'findActiveAssignments'})
  findActiveAssignmentsMicroservice(): Promise<DeviceAssignment[]> {
    return this.deviceAssignmentsService.findActiveAssignments();
  }

  @MessagePattern({cmd: 'findUserAssignments'})
  findUserAssignmentsMicroservice(@Payload() data: { userId: string }): Promise<DeviceAssignment[]> {
    return this.deviceAssignmentsService.findUserAssignments(data.userId);
  }

  @MessagePattern({cmd: 'assignDevice'})
  assignDeviceMicroservice(@Payload() createAssignmentDto: CreateDeviceAssignmentDto): Promise<DeviceAssignment> {
    return this.deviceAssignmentsService.assignDevice(createAssignmentDto);
  }

  @MessagePattern({cmd: 'returnDevice'})
  returnDeviceMicroservice(@Payload() data: { assignmentId: string; returnData: ReturnDeviceDto }): Promise<DeviceAssignment> {
    return this.deviceAssignmentsService.returnDevice(data.assignmentId, data.returnData);
  }
}