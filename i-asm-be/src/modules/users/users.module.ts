import {Module} from '@nestjs/common';
import {ClientsModule, Transport} from '@nestjs/microservices';
import {UsersService} from '@/modules/users/users.service';
import {SERVICE_NAMES} from "@dym-vietnam/internal-shared";
import {ConfigModule, ConfigService} from "@nestjs/config";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: SERVICE_NAMES.USER_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('USER_SERVICE_HOST', 'user-service'),
            port: configService.get('USER_SERVICE_PORT', 4001),
          },
        }),
      },
    ]),
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {
}