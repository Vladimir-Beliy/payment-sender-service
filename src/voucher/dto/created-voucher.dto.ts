import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IsWei } from '../../shared/decorators/wei-validation.decorator copy';

export class CreatedVoucherDto {
  @ApiProperty({
    description: 'Payee account',
    required: true,
    example: '0x1111111111111111111111111111111111111111',
    type: String,
  })
  @IsString()
  payee: string;

  @ApiProperty({
    description: 'Payee nonce',
    required: true,
    example: '1',
    type: Number,
  })
  @IsString()
  nonce: string;

  @ApiProperty({
    description: 'Payment amount',
    required: true,
    example: '1000000000000000000',
    type: String,
  })
  @IsWei()
  amount: string;

  @ApiProperty({
    description: 'Payment voucher',
    required: true,
    example: '0x1f1f1f... 65 bytes',
    type: String,
  })
  @IsString()
  voucher: string;
}
