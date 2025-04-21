import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';
import {Device} from '@/modules/devices/entities/device.entity';

@Entity('device_types')
export class DeviceType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({length: 100, unique: true})
  name: string; // Laptop, Desktop, Mobile, Tablet, etc.

  @Column({nullable: true})
  description: string;

  @Column({default: true})
  isActive: boolean;

  @OneToMany(() => Device, (device) => device.deviceType)
  devices: Device[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}