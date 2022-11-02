import { ethers } from 'ethers';
import { Provider } from '@ethersproject/abstract-provider';
import { ContractInterface } from '@ethersproject/contracts';

export class EthersService {
  static readonly BLOCKS_PER_REQUEST = 5000;

  static useWallet(privateKey: string, provider = null) {
    return new ethers.Wallet(privateKey, provider);
  }

  static useRpcProvider(rpcUrl: string) {
    return new ethers.providers.JsonRpcProvider(rpcUrl);
  }

  static useRpcWsProvider(rpcWsUrl: string) {
    return new ethers.providers.WebSocketProvider(rpcWsUrl);
  }

  static useContract(
    account: string,
    abi: ContractInterface,
    provider: Provider,
  ) {
    return new ethers.Contract(account, abi, provider);
  }
}
