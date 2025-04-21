import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceMaintenance, MaintenanceStatus } from './entities/device-maintenance.entity';
import { DeviceTransaction, TransactionType } from '../device-transactions/entities/device-transaction.entity';
import { DevicesService } from '../devices/devices.service';
import { CreateDeviceMaintenanceDto } from './dto/create-device-maintenance.dto';
import { UpdateDeviceMaintenanceDto } from './dto/update-device-maintenance.dto';

@Injectable()
export class DeviceMaintenanceService {
  constructor(
    @InjectRepository(DeviceMaintenance)
    private readonly deviceMaintenanceRepository: Repository<DeviceMaintenance>,
    @InjectRepository(DeviceTransaction)
    private readonly deviceTransactionRepository: Repository<DeviceTransaction>,
    private readonly devicesService: DevicesService,
  ) {}

  async create(createMaintenanceDto: CreateDeviceMaintenanceDto): Promise<DeviceMaintenance> {
    const { deviceId } = createMaintenanceDto;

    // Check if device exists
    await this.devicesService.findOne(deviceId);

    // Create the maintenance record
    const maintenance = this.deviceMaintenanceRepository.create(createMaintenanceDto);
    const savedMaintenance = await this.deviceMaintenanceRepository.save(maintenance);

    // If status is IN_PROGRESS, update device status to "maintenance"
    if (maintenance.status === MaintenanceStatus.IN_PROGRESS) {
      await this.devicesService.updateStatus(deviceId, 'maintenance', maintenance.performedBy,
        `Device sent for maintenance: ${maintenance.description}`);
    }

    // Record the transaction
    const transaction = this.deviceTransactionRepository.create({
      deviceId,
      transactionType: TransactionType.MAINTENANCE,
      performedBy: maintenance.performedBy,
      notes: maintenance.description,
      metadata: {
        maintenanceId: savedMaintenance.id,
        maintenanceType: maintenance.maintenanceType,
        status: maintenance.status,
      },
    });

    await this.deviceTransactionRepository.save(transaction);

    return savedMaintenance;
  }

  async findAll(): Promise<DeviceMaintenance[]> {
    return this.deviceMaintenanceRepository.find({
      relations: ['device'],
      order: {
        scheduledDate: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<DeviceMaintenance> {
    const maintenance = await this.deviceMaintenanceRepository.findOne({
      where: { id },
      relations: ['device'],
    });

    if (!maintenance) {
      throw new NotFoundException(`Maintenance record with ID ${id} not found`);
    }

    return maintenance;
  }

  async findByDevice(deviceId: string): Promise<DeviceMaintenance[]> {
    return this.deviceMaintenanceRepository.find({
      where: { deviceId },
      order: {
        scheduledDate: 'DESC',
      },
    });
  }

  async getPendingMaintenance(): Promise<DeviceMaintenance[]> {
    return this.deviceMaintenanceRepository.find({
      where: [
        { status: MaintenanceStatus.SCHEDULED },
        { status: MaintenanceStatus.IN_PROGRESS }
      ],
      relations: ['device'],
      order: {
        scheduledDate: 'ASC',
      },
    });
  }

  async update(id: string, updateMaintenanceDto: UpdateDeviceMaintenanceDto): Promise<DeviceMaintenance> {
    const maintenance = await this.findOne(id);
    const oldStatus = maintenance.status;

    // Update properties
    Object.assign(maintenance, updateMaintenanceDto);
    const updatedMaintenance = await this.deviceMaintenanceRepository.save(maintenance);

    // Handle status change
    if (oldStatus !== maintenance.status) {
      // If status changed to COMPLETED, update device status to "available"
      if (maintenance.status === MaintenanceStatus.COMPLETED) {
        await this.devicesService.updateStatus(
          maintenance.deviceId,
          'available',
          maintenance.performedBy,
          `Maintenance completed: ${maintenance.results || 'Device returned to service'}`
        );

        // Update completed date if not provided
        if (!maintenance.completedDate) {
          maintenance.completedDate = new Date();
          await this.deviceMaintenanceRepository.save(maintenance);
        }
      }

      // If status changed to IN_PROGRESS, update device status to "maintenance"
      if (maintenance.status === MaintenanceStatus.IN_PROGRESS) {
        await this.devicesService.updateStatus(
          maintenance.deviceId,
          'maintenance',
          maintenance.performedBy,
          `Device sent for maintenance: ${maintenance.description}`
        );
      }
    }

    // Record the transaction
    const transaction = this.deviceTransactionRepository.create({
      deviceId: maintenance.deviceId,
      transactionType: TransactionType.MAINTENANCE,
      performedBy: maintenance.performedBy,
      notes: `Maintenance record updated: ${maintenance.status}`,
      metadata: {
        maintenanceId: maintenance.id,
        oldStatus,
        newStatus: maintenance.status,
        results: maintenance.results,
      },
    });

    await this.deviceTransactionRepository.save(transaction);

    return updatedMaintenance;
  }

  async remove(id: string): Promise<void> {
    const maintenance = await this.findOne(id);
    await this.deviceMaintenanceRepository.remove(maintenance);
  }
}