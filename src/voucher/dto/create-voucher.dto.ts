import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { ChainIdEnum } from '../../shared/enums';
import { IsAccountAddress } from '../../shared/decorators/account-address-validation.decorator';
import { IsWei } from '../../shared/decorators/wei-validation.decorator copy';

export class CreateVoucherDto {
  @ApiProperty({
    description: 'Chain ID',
    required: true,
    example: ChainIdEnum.BSC_TEST,
    enum: Object.values(ChainIdEnum),
  })
  @IsEnum(ChainIdEnum)
  chainId: ChainIdEnum;

  @ApiProperty({
    description: 'Payee account',
    required: true,
    example: '0x1111111111111111111111111111111111111111',
    type: String,
  })
  @IsAccountAddress()
  @Transform(({ value }) => value.toLowerCase())
  payeeAccount: string;

  @ApiProperty({
    description: 'Payment amount',
    required: true,
    example: '1000000000000000000',
    type: String,
  })
  @IsWei()
  @Transform(({ value }) => String(value))
  amount: string;
}
