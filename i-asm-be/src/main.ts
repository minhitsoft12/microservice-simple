import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // TCP Microservice configuration
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: configService.get('HOST', 'localhost'),
      port: configService.get('PORT', 3001),
    },
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.startAllMicroservices();
  // await app.listen(configService.get('HTTP_PORT', 3000));
  // console.log(`Device Management Service is running on port ${configService.get('HTTP_PORT', 3000)}`);
}
void bootstrap();