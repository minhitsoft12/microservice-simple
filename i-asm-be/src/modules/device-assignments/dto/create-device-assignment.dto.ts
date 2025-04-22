import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateDeviceAssignmentDto {
  @IsNotEmpty()
  @IsString()
  deviceId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  assignmentNotes?: string;

  @IsNotEmpty()
  @IsString()
  assignedBy: string;
}