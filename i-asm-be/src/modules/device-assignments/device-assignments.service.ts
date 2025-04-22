import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceAssignment } from './entities/device-assignment.entity';
import { DeviceTransaction } from '../device-transactions/entities/device-transaction.entity';
import { TransactionType } from '../device-transactions/entities/device-transaction.entity';
import { DevicesService } from '../devices/devices.service';
import { UsersService } from '../users/users.service';
import { CreateDeviceAssignmentDto } from './dto/create-device-assignment.dto';
import { ReturnDeviceDto } from './dto/return-device.dto';

@Injectable()
export class DeviceAssignmentsService {
  constructor(
    @InjectRepository(DeviceAssignment)
    private readonly deviceAssignmentRepository: Repository<DeviceAssignment>,
    @InjectRepository(DeviceTransaction)
    private readonly deviceTransactionRepository: Repository<DeviceTransaction>,
    private readonly devicesService: DevicesService,
    private readonly usersService: UsersService,
  ) {}

  async assignDevice(createAssignmentDto: CreateDeviceAssignmentDto): Promise<DeviceAssignment> {
    const { deviceId, userId, assignmentNotes, assignedBy } = createAssignmentDto;

    // Check if device exists and is available
    const device = await this.devicesService.findOne(deviceId);
    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    if (device.statusId !== 'available') { // Assuming 'available' is the status ID for available devices
      throw new BadRequestException(`Device with ID ${deviceId} is not available for assignment`);
    }

    // Check if user exists
    try {
      const user = await this.usersService.findOne(userId);
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
    } catch (error) {
      throw new NotFoundException(`Error fetching user: ${error.message}`);
    }

    // Check if device is already assigned
    const activeAssignment = await this.deviceAssignmentRepository.findOne({
      where: {
        deviceId,
        isActive: true,
      },
    });

    if (activeAssignment) {
      throw new BadRequestException(`Device is already assigned to a user`);
    }

    // Create the assignment
    const assignment = this.deviceAssignmentRepository.create({
      deviceId,
      userId,
      assignedAt: new Date(),
      assignmentNotes,
      assignedBy,
      isActive: true,
    });

    await this.deviceAssignmentRepository.save(assignment);

    // Update device status
    await this.devicesService.updateStatus(deviceId, 'assigned'); // Assuming 'assigned' is the status ID for assigned devices

    // Record the transaction
    const transaction = this.deviceTransactionRepository.create({
      deviceId,
      transactionType: TransactionType.ASSIGNMENT,
      userId,
      performedBy: assignedBy,
      notes: assignmentNotes,
      metadata: {
        assignmentId: assignment.id,
      },
    });

    await this.deviceTransactionRepository.save(transaction);

    return assignment;
  }

  async returnDevice(assignmentId: string, returnData: ReturnDeviceDto): Promise<DeviceAssignment> {
    const { returnNotes, returnedBy } = returnData;

    const assignment = await this.deviceAssignmentRepository.findOne({
      where: { id: assignmentId, isActive: true },
    });

    if (!assignment) {
      throw new NotFoundException(`Active device assignment with ID ${assignmentId} not found`);
    }

    // Update the assignment
    assignment.returnedAt = new Date();
    assignment.returnNotes = returnNotes ?? "";
    assignment.returnedBy = returnedBy;
    assignment.isActive = false;

    await this.deviceAssignmentRepository.save(assignment);

    // Update device status
    await this.devicesService.updateStatus(assignment.deviceId, 'available'); // Assuming 'available' is the status ID for available devices

    // Record the transaction
    const transaction = this.deviceTransactionRepository.create({
      deviceId: assignment.deviceId,
      transactionType: TransactionType.RETURN,
      userId: assignment.userId,
      performedBy: returnedBy,
      notes: returnNotes,
      metadata: {
        assignmentId: assignment.id,
      },
    });

    await this.deviceTransactionRepository.save(transaction);

    return assignment;
  }

  async findActiveAssignments(): Promise<DeviceAssignment[]> {
    return this.deviceAssignmentRepository.find({
      where: { isActive: true },
      relations: ['device'],
    });
  }

  async findUserAssignments(userId: string): Promise<DeviceAssignment[]> {
    return this.deviceAssignmentRepository.find({
      where: { userId },
      relations: ['device'],
      order: {
        assignedAt: 'DESC',
      },
    });
  }

  async findDeviceAssignmentHistory(deviceId: string): Promise<DeviceAssignment[]> {
    return this.deviceAssignmentRepository.find({
      where: { deviceId },
      order: {
        assignedAt: 'DESC',
      },
    });
  }

  async getAssignmentWithUserDetails(assignmentId: string): Promise<any> {
    const assignment = await this.deviceAssignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['device'],
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
    }

    try {
      const user = await this.usersService.findOne(assignment.userId);

      return {
        ...assignment,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          status: user.status,
          roleId: user.roleId,
        },
      };
    } catch (error) {
      return {
        ...assignment,
        user: {
          id: assignment.userId,
          error: 'Failed to fetch user details',
        },
      };
    }
  }
}