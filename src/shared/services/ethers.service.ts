import { ethers, TypedDataDomain, TypedDataField } from 'ethers';
import { Provider } from '@ethersproject/abstract-provider';
import { ContractInterface } from '@ethersproject/contracts';

export class EthersService {
  static readonly BLOCKS_PER_REQUEST = 5000;

  static useWallet(privateKey: string, provider = null) {
    return new ethers.Wallet(privateKey, provider);
  }

  static async signTypedData(
    privateKey: string,
    domain: TypedDataDomain,
    types: Record<string, Array<TypedDataField>>,
    value: Record<string, any>,
  ) {
    const wallet = EthersService.useWallet(privateKey);

    return wallet._signTypedData(domain, types, value);
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
