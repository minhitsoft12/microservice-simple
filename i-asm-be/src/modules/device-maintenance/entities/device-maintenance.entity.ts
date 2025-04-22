import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Device } from '@/modules/devices/entities/device.entity';

export enum MaintenanceType {
  REPAIR = 'repair',
  UPGRADE = 'upgrade',
  ROUTINE = 'routine',
  INSPECTION = 'inspection',
  OTHER = 'other',
}

export enum MaintenanceStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('device_maintenance')
export class DeviceMaintenance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Device, (device) => device.maintenanceRecords)
  @JoinColumn({ name: 'deviceId' })
  device: Device;

  @Column()
  deviceId: string;

  @Column({
    type: 'enum',
    enum: MaintenanceType,
    default: MaintenanceType.OTHER,
  })
  maintenanceType: MaintenanceType;

  @Column({
    type: 'enum',
    enum: MaintenanceStatus,
    default: MaintenanceStatus.SCHEDULED,
  })
  status: MaintenanceStatus;

  @Column({ type: 'timestamp' })
  scheduledDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedDate: Date;

  @Column({ nullable: true })
  performedBy: string; // Could be internal staff ID or external vendor

  @Column({ nullable: true })
  cost: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  results: string;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}