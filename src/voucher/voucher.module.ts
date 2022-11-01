import { Module } from '@nestjs/common';
import { VoucherController } from './voucher.controller';
import { VoucherService } from './voucher.service';

@Module({
  providers: [VoucherService],
  controllers: [VoucherController],
})
export class VoucherModule {}
