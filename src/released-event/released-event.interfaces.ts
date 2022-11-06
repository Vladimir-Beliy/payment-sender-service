export interface ReleasedEventInterface {
  blockNumber: number;
  transactionHash: string;
  payee: string;
  nonce: string;
  amount: string;
}

export interface AppendJobInterface {
  storageDirPath: string;
  event: ReleasedEventInterface;
}
