import fs from 'fs/promises';
import path from 'path';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { BigNumber } from 'ethers';
import { EthersService } from '../shared/services/ethers.service';
import { FileService } from '../shared/services/file.service';
import { configService } from '../shared/config.server';
import {
  AppendJobInterface,
  ReleasedEventInterface,
} from './released-event.interfaces';
import {
  RELEASED_EVENT,
  STORAGE_ROOT_DIR_PATH,
} from './released-event.constants';
import { formatReleasedEvent } from './released-event.helpers';
import { CHAINS, PAYMENT_SENDER_ACCOUNTS } from '../shared/constants';
import { ChainIdEnum } from '../shared/enums';
import paymentSenderAbi from '../shared/abi/payment-sender.abi.json';

@Injectable()
export class ReleasedEventService implements OnModuleInit {
  private readonly logger = new Logger('ReleasedEventService');

  constructor(
    @InjectQueue('released-event')
    private queue: Queue<AppendJobInterface>,
  ) {}

  onModuleInit() {
    this.trackEvent(ChainIdEnum.BSC_TEST);
  }

  private async trackEvent(chainId: ChainIdEnum) {
    const storageDir = this.getStoreDir(chainId);
    const startFromBlock = await this.getLastEventBlock(storageDir);
    const provider = EthersService.useRpcProvider(CHAINS[chainId].rpc);
    const paymentSender = EthersService.useContract(
      PAYMENT_SENDER_ACCOUNTS[chainId],
      paymentSenderAbi,
      provider,
    );

    let latestBlock = await provider.getBlockNumber();
    let currentBlock = startFromBlock;

    while (currentBlock <= latestBlock) {
      const formBlock = currentBlock;
      const toBlock = currentBlock + EthersService.BLOCKS_PER_REQUEST;

      this.logger.warn(
        `Getting past events, blocks range: ${formBlock} - ${toBlock} ...`,
      );

      const pastEvents = await paymentSender.queryFilter(
        RELEASED_EVENT,
        formBlock,
        toBlock,
      );

      this.queue.addBulk(
        pastEvents.map((event) => ({
          name: 'append-event',
          data: {
            storageDirPath: storageDir,
            event: formatReleasedEvent(event),
          },
        })),
      );

      currentBlock = toBlock + 1;

      if (currentBlock > latestBlock) {
        latestBlock = await provider.getBlockNumber();
      }
    }

    this.logger.log(`All past events are got`);

    const providerWs = EthersService.useRpcWsProvider(CHAINS[chainId].rpcWs);

    const paymentSenderWs = EthersService.useContract(
      PAYMENT_SENDER_ACCOUNTS[chainId],
      paymentSenderAbi,
      providerWs,
    );

    paymentSenderWs.on(
      RELEASED_EVENT,
      (payee, nonce: BigNumber, amount: BigNumber, event) => {
        this.queue.add('append-event', {
          storageDirPath: storageDir,
          event: formatReleasedEvent(event),
        });

        this.logger.warn(
          `${RELEASED_EVENT} - payee: ${payee}, nonce: ${nonce.toString()} amount: ${amount.toString()}`,
        );
      },
    );
  }

  private getStoreDir(chainId: ChainIdEnum) {
    return path.join(STORAGE_ROOT_DIR_PATH, String(chainId));
  }

  private async getLastEventBlock(storageDirPath: string) {
    const startBlock = Number(configService.getCustomKey('START_BLOCK'));
    const lastFilePath = await FileService.getLastFilePath(storageDirPath);

    if (!lastFilePath) {
      return startBlock;
    }

    const lastFile = await fs.readFile(lastFilePath);
    let prevEvents;

    try {
      prevEvents =
        FileService.parseJSONFile<ReleasedEventInterface[]>(lastFile);
    } catch (e) {
      return startBlock;
    }

    if (prevEvents.length === 0) {
      return startBlock;
    }

    const lastEvent = prevEvents[prevEvents.length - 1];

    return lastEvent.blockNumber;
  }
}
