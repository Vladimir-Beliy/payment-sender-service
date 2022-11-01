import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configService } from './shared/config.server';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  configService.configureApp(app);

  await app.listen(configService.getPort());
  const logger = new Logger();

  logger.log('Application started');
}
bootstrap();
