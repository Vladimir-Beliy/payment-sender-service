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
  async createVoucher(
    chianId: ChainIdEnum,
    payeeAccount: string,
    amount: string,
  ): Promise<CreateVoucherInterface> {
    const voucherSigner = EthersService.useWallet(
      configService.getCustomKey('VOUCHER_SIGNER'),
    );

    const provider = EthersService.useRpcProvider(CHAINS[chianId].rpc);

    const paymentSender = EthersService.useContract(
      PAYMENT_SENDER_ACCOUNTS[chianId],
      paymentSenderAbi,
      provider,
    );

    const nonceBN: BigNumber = await paymentSender.nonce(payeeAccount);
    const nonce = nonceBN.toString();

    const voucher = await voucherSigner._signTypedData(
      PAYMENT_SENDER_DOMAINS[chianId],
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
