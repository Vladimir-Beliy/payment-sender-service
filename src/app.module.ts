import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { ReleasedEventModule } from './released-event/released-event.module';
import { VoucherModule } from './voucher/voucher.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    VoucherModule,
    ReleasedEventModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
