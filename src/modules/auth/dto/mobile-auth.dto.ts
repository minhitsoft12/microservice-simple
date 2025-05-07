import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MobileAuthDto {
  @ApiProperty({
    description: 'Google ID token from mobile authentication',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOWdkazcifQ...',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;

  @ApiProperty({
    description: 'The platform of the mobile device (ios or android)',
    example: 'android',
    required: false,
  })
  @IsString()
  platform?: string;

  @ApiProperty({
    description: 'Device identifier',
    example: 'device-id-12345',
    required: false,
  })
  @IsString()
  deviceId?: string;
}
