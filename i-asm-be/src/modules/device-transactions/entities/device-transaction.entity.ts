import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Device } from '@/modules/devices/entities/device.entity';

export enum TransactionType {
  PURCHASE = 'purchase',
  ASSIGNMENT = 'assignment',
  RETURN = 'return',
  MAINTENANCE = 'maintenance',
  DISPOSAL = 'disposal',
  STATUS_CHANGE = 'status_change',
  OTHER = 'other',
}

@Entity('device_transactions')
export class DeviceTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Device, (device) => device.transactions)
  @JoinColumn({ name: 'deviceId' })
  device: Device;

  @Column()
  deviceId: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.OTHER,
  })
  transactionType: TransactionType;

  @Column({ nullable: true })
  userId: string; // User related to this transaction (if applicable)

  @Column({ nullable: true })
  performedBy: string; // User ID who performed the transaction

  @Column({ nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Additional transaction data

  @CreateDateColumn()
  createdAt: Date;
}