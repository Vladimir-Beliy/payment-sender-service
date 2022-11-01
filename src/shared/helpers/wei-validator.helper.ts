import { BigNumber } from 'ethers';

export class WeiValidator {
  static validate(value: string | number): boolean {
    try {
      BigNumber.from(value);
      return true;
    } catch (e) {
      return false;
    }
  }
}
