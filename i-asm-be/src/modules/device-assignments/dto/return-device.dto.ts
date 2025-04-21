import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ReturnDeviceDto {
  @IsOptional()
  @IsString()
  returnNotes?: string;

  @IsNotEmpty()
  @IsString()
  returnedBy: string; // ID of the user processing the return
}