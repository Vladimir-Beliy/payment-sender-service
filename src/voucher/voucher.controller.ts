import {
  Body,
  Controller,
  HttpCode,
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
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe(configService.getValidationOptions(true)))
  @Post('/create')
  async createVoucher(
    @Body() { chainId, payeeAccount, amount }: CreateVoucherDto,
  ): Promise<CreatedVoucherDto> {
    return this._voucherService.create(chainId, payeeAccount, amount);
  }
}
