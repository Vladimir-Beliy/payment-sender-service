import { Injectable } from '@nestjs/common';
import { configService } from '../shared/config.server';
import {
  CHAINS,
  PAYMENT_SENDER_ACCOUNTS,
  PAYMENT_SENDER_DOMAINS,
} from '../shared/constants';
import { ChainIdEnum } from '../shared/enums';
import { EthersService } from '../shared/services/ethers.service';
import { VOUCHER_TYPE } from './voucher.constants';
import { CreateVoucherInterface } from './voucher.interfaces';
import paymentSenderAbi from '../shared/abi/payment-sender.abi.json';
import { BigNumber } from 'ethers';

@Injectable()
export class VoucherService {
  private readonly VOUCHER_SIGNER =
    configService.getCustomKey('VOUCHER_SIGNER');

  async create(
    chainId: ChainIdEnum,
    payeeAccount: string,
    amount: string,
  ): Promise<CreateVoucherInterface> {
    const provider = EthersService.useRpcProvider(CHAINS[chainId].rpc);

    const paymentSender = EthersService.useContract(
      PAYMENT_SENDER_ACCOUNTS[chainId],
      paymentSenderAbi,
      provider,
    );

    const nonceBN: BigNumber = await paymentSender.nonce(payeeAccount);
    const nonce = nonceBN.toString();

    const voucher = await EthersService.signTypedData(
      this.VOUCHER_SIGNER,
      PAYMENT_SENDER_DOMAINS[chainId],
      VOUCHER_TYPE,
      {
        payee: payeeAccount,
        nonce,
        amount,
      },
    );

    return {
      payee: payeeAccount,
      nonce,
      amount,
      voucher,
    };
  }
}
