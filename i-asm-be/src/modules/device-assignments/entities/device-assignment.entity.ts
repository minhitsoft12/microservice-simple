import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Device } from '@/modules/devices/entities/device.entity';

@Entity('device_assignments')
export class DeviceAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Device, (device) => device.assignments)
  @JoinColumn({ name: 'deviceId' })
  device: Device;

  @Column()
  deviceId: string;

  @Column({ length: 100 })
  userId: string; // From User Service

  @Column({ type: 'timestamp' })
  assignedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  returnedAt: Date;

  @Column({ nullable: true })
  assignmentNotes: string;

  @Column({ nullable: true })
  returnNotes: string;

  @Column({ default: true })
  isActive: boolean; // false when returned

  @Column({ nullable: true })
  assignedBy: string; // User ID who performed the assignment

  @Column({ nullable: true })
  returnedBy: string; // User ID who processed the return

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}