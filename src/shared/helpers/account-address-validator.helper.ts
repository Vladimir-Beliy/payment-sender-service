import * as WAValidator from 'wallet-address-validator';

export class AccountAddressValidator {
  static validate(wallet: string): boolean {
    return WAValidator.validate(wallet, 'ETH');
  }
}
