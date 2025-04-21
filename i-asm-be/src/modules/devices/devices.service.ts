import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Device} from './entities/device.entity';
import {DeviceTransaction, TransactionType} from '../device-transactions/entities/device-transaction.entity';
import {CreateDeviceDto} from './dto/create-device.dto';
import {UpdateDeviceDto} from './dto/update-device.dto';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @InjectRepository(DeviceTransaction)
    private readonly deviceTransactionRepository: Repository<DeviceTransaction>,
  ) {
  }

  async create(createDeviceDto: CreateDeviceDto, createdBy: string): Promise<Device> {
    const device = this.deviceRepository.create(createDeviceDto);
    const savedDevice = await this.deviceRepository.save(device);

    // Record the transaction
    const transaction = this.deviceTransactionRepository.create({
      deviceId: savedDevice.id,
      transactionType: TransactionType.PURCHASE,
      performedBy: createdBy,
      notes: `Device added to inventory`,
      metadata: {
        purchasePrice: createDeviceDto.purchasePrice,
        purchaseDate: createDeviceDto.purchaseDate,
      },
    });

    await this.deviceTransactionRepository.save(transaction);

    return savedDevice;
  }

  async findAll(): Promise<Device[]> {
    return this.deviceRepository.find({
      relations: ['deviceType', 'status'],
    });
  }

  async findOne(id: string): Promise<Device> {
    const device = await this.deviceRepository.findOne({
      where: {id},
      relations: ['deviceType', 'status'],
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    return device;
  }

  async findByStatus(statusId: string): Promise<Device[]> {
    return this.deviceRepository.find({
      where: {statusId},
      relations: ['deviceType', 'status'],
    });
  }

  async findByType(typeId: string): Promise<Device[]> {
    return this.deviceRepository.find({
      where: {deviceTypeId: typeId},
      relations: ['deviceType', 'status'],
    });
  }

  async update(id: string, updateDeviceDto: UpdateDeviceDto, updatedBy: string): Promise<Device> {
    const device = await this.findOne(id);
    const oldData = {...device};

    // Update device properties
    Object.assign(device, updateDeviceDto);
    const updatedDevice = await this.deviceRepository.save(device);

    // Record the transaction
    const transaction = this.deviceTransactionRepository.create({
      deviceId: device.id,
      transactionType: TransactionType.OTHER,
      performedBy: updatedBy,
      notes: `Device information updated`,
      metadata: {
        oldData,
        newData: updateDeviceDto,
      },
    });

    await this.deviceTransactionRepository.save(transaction);

    return updatedDevice;
  }

  async updateStatus(id: string, statusId: string, updatedBy?: string, notes?: string): Promise<Device> {
    const device = await this.findOne(id);
    const oldStatusId = device.statusId;

    if (oldStatusId === statusId) {
      return device; // No change needed
    }

    device.statusId = statusId;
    const updatedDevice = await this.deviceRepository.save(device);

    // Record the transaction
    const transaction = this.deviceTransactionRepository.create({
      deviceId: device.id,
      transactionType: TransactionType.STATUS_CHANGE,
      performedBy: updatedBy,
      notes: notes || `Device status changed from ${oldStatusId} to ${statusId}`,
      metadata: {
        oldStatusId,
        newStatusId: statusId,
      },
    });

    await this.deviceTransactionRepository.save(transaction);

    return updatedDevice;
  }

  async remove(id: string, removedBy: string, notes?: string): Promise<void> {
    const device = await this.findOne(id);

    // Record the transaction before removal
    const transaction = this.deviceTransactionRepository.create({
      deviceId: device.id,
      transactionType: TransactionType.DISPOSAL,
      performedBy: removedBy,
      notes: notes || `Device removed from inventory`,
      metadata: {
        deviceDetails: device,
      },
    });

    await this.deviceTransactionRepository.save(transaction);

    await this.deviceRepository.remove(device);
  }

  async getDeviceStatistics(): Promise<any> {
    const totalDevices = await this.deviceRepository.count();

    // Count devices by status
    const statusCounts = await this.deviceRepository
      .createQueryBuilder('device')
      .select('device.statusId, COUNT(device.id) as count')
      .groupBy('device.statusId')
      .getRawMany();

    // Count devices by type
    const typeCounts = await this.deviceRepository
      .createQueryBuilder('device')
      .select('device.deviceTypeId, COUNT(device.id) as count')
      .groupBy('device.deviceTypeId')
      .getRawMany();

    // Convert to an easy-to-use format
    const statusMap = {};
    statusCounts.forEach(item => {
      statusMap[item.statusId] = parseInt(item.count);
    });

    const typeMap = {};
    typeCounts.forEach(item => {
      typeMap[item.deviceTypeId] = parseInt(item.count);
    });

    return {
      totalDevices,
      assignedDevices: statusMap['assigned'] || 0,
      availableDevices: statusMap['available'] || 0,
      underMaintenanceDevices: statusMap['maintenance'] || 0,
      disposedDevices: statusMap['disposed'] || 0,
      byStatus: statusMap,
      byType: typeMap,
    };
  }
}