import {
  HttpException,
  HttpStatus,
  INestApplication,
  ValidationPipeOptions,
} from '@nestjs/common';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

dotenv.config();

export class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  getPort(): number {
    return Number(this.getValue('PORT'));
  }

  getCustomKey(key: string): string {
    return this.getValue(key);
  }

  getValidationOptions(transform?: true): ValidationPipeOptions {
    const options: ValidationPipeOptions = {
      whitelist: true,
      validateCustomDecorators: true,
    };

    if (transform) {
      return {
        ...options,
        transform: true,
        stopAtFirstError: false,
        forbidNonWhitelisted: false,
        transformOptions: {
          enableImplicitConversion: true,
          exposeDefaultValues: true,
        },
      };
    }

    return options;
  }

  configureApp(app: INestApplication): void {
    const documentBuilderOptions = new DocumentBuilder().build();
    const document = SwaggerModule.createDocument(app, documentBuilderOptions);

    SwaggerModule.setup('/docs', app, document);
  }

  private getValue(key: string): string {
    const value = this.env[key];

    if (!value) {
      throw new HttpException(
        `validation:error. config error - missing env.${key}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return value;
  }
}

const configService = new ConfigService(process.env);

export { configService };
