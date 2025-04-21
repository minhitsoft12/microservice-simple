import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { DeviceType } from '@/modules/device-types/entities/device-type.entity';
import { DeviceStatus } from '@/modules/device-status/entities/device-status.entity';
import { DeviceAssignment } from '@/modules/device-assignments/entities/device-assignment.entity';
import { DeviceTransaction } from '@/modules/device-transactions/entities/device-transaction.entity';
import { DeviceMaintenance } from '@/modules/device-maintenance/entities/device-maintenance.entity';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, unique: true })
  serialNumber: string;

  @Column({ length: 255, nullable: true })
  model: string;

  @Column({ length: 255, nullable: true })
  manufacturer: string;

  @Column({ type: 'date', nullable: true })
  purchaseDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  purchasePrice: number;

  @Column({ type: 'date', nullable: true })
  warrantyExpiryDate: Date;

  @Column({ nullable: true })
  notes: string;

  @ManyToOne(() => DeviceType, (deviceType) => deviceType.devices)
  @JoinColumn({ name: 'deviceTypeId' })
  deviceType: DeviceType;

  @Column()
  deviceTypeId: string;

  @ManyToOne(() => DeviceStatus, (deviceStatus) => deviceStatus.devices)
  @JoinColumn({ name: 'statusId' })
  status: DeviceStatus;

  @Column()
  statusId: string;

  @OneToMany(() => DeviceAssignment, (assignment) => assignment.device)
  assignments: DeviceAssignment[];

  @OneToMany(() => DeviceTransaction, (transaction) => transaction.device)
  transactions: DeviceTransaction[];

  @OneToMany(() => DeviceMaintenance, (maintenance) => maintenance.device)
  maintenanceRecords: DeviceMaintenance[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}