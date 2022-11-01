import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ReleasedEventModule } from './released-event/released-event.module';
import { VoucherModule } from './voucher/voucher.module';

@Module({
  imports: [VoucherModule, ReleasedEventModule],
  controllers: [AppController],
})
export class AppModule {}
