import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global middleware
  app.use(helmet());
  app.use(compression());
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
  );

  await app.listen(3000);
  console.log(`API Gateway is running on port 3000`);
}

bootstrap();