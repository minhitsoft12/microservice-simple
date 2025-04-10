import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ProxyController } from './proxy/proxy.controller';
import { ProxyService } from './proxy/proxy.service';
import {SERVICE_NAMES} from "@shared/constants/service-names.constant";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [ProxyController],
  providers: [
    ProxyService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: SERVICE_NAMES.AUTH_SERVICE,
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('AUTH_SERVICE_HOST', 'localhost'),
            port: configService.get('AUTH_SERVICE_PORT', 3010),
          },
        });
      },
      inject: [ConfigService],
    },
    {
      provide: SERVICE_NAMES.USER_SERVICE,
      useFactory: (configService: ConfigService) => {
        const userServiceUrl = configService.get('USER_SERVICE_URL');
        return { url: userServiceUrl };
      },
      inject: [ConfigService],
    }
  ],
})
export class AppModule {}