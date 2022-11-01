import { BigNumber } from 'ethers';

export interface ReleasedEventInterface {
  blockNumber: number;
  transactionHash: string;
  args: [string, BigNumber, BigNumber];
  [k: string]: any;
}

export interface StoredReleasedEventInterface {
  blockNumber: number;
  transactionHash: string;
  payee: string;
  nonce: string;
  amount: string;
}
