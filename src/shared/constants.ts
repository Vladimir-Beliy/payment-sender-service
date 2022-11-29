import { ChainIdEnum } from './enums';
import { Chain } from './interfaces';

export const CHAINS: Record<ChainIdEnum, Chain> = {
  [ChainIdEnum.BSC_TEST]: {
    rpc:
      'https://few-cold-vineyard.bsc-testnet.discover.quiknode.pro/ff5e350007dfaa34a7ea4d9ba487bcbfbd86c579/',
    rpcWs:
      'wss://few-cold-vineyard.bsc-testnet.discover.quiknode.pro/ff5e350007dfaa34a7ea4d9ba487bcbfbd86c579/',
  },
  [ChainIdEnum.LOCAL]: {
    rpc: 'http://localhost:8545',
    rpcWs: 'ws://localhost:8545',
  },
};

export const PAYMENT_SENDER_ACCOUNTS: Record<ChainIdEnum, string> = {
  [ChainIdEnum.BSC_TEST]: '0xf3eae947ba80f4213304dc5bf0554a4c92a3fe73',
  [ChainIdEnum.LOCAL]: '0x3619911Efe44e217E9ed2978d602a3199Fd7164f',
};

export const PAYMENT_SENDER_DOMAINS = {
  [ChainIdEnum.BSC_TEST]: {
    name: 'Payment Sender',
    version: '1',
    chainId: ChainIdEnum.BSC_TEST,
    verifyingContract: PAYMENT_SENDER_ACCOUNTS[ChainIdEnum.BSC_TEST],
  },
  [ChainIdEnum.LOCAL]: {
    name: 'Payment Sender',
    version: '1',
    chainId: ChainIdEnum.LOCAL,
    verifyingContract: PAYMENT_SENDER_ACCOUNTS[ChainIdEnum.LOCAL],
  },
};
