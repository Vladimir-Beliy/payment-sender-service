import {
  Body,
  Controller,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { configService } from '../shared/config.server';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { CreatedVoucherDto } from './dto/created-voucher.dto';
import { VoucherService } from './voucher.service';

@ApiTags('voucher')
@Controller('/voucher')
export class VoucherController {
  constructor(private readonly _voucherService: VoucherService) {}

  @ApiOperation({
    summary: 'Generated payment voucher',
    description: 'Generated payment voucher',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Voucher with base data',
    type: CreatedVoucherDto,
  })
  @UsePipes(new ValidationPipe(configService.getValidationOptions(true)))
  @Post('/create')
  async createVoucher(
    @Body() { chianId, payeeAccount, amount }: CreateVoucherDto,
  ): Promise<CreatedVoucherDto> {
    return this._voucherService.createVoucher(chianId, payeeAccount, amount);
  }
}
