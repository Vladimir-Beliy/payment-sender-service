import fs from 'fs/promises';
import path from 'path';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { BigNumber } from 'ethers';
import { EthersService } from '../shared/services/ethers.service';
import { FileService } from '../shared/services/file.service';
import { configService } from '../shared/config.server';
import {
  ReleasedEventInterface,
  StoredReleasedEventInterface,
} from './released-event.interfaces';
import {
  EVENTS_PER_FILE,
  RELEASED_EVENT,
  STORAGE_ROOT_DIR_PATH,
} from './released-event.constants';
import { formatReleasedEvent, getNextFileName } from './released-event.helpers';
import { Queue } from '../shared/helpers/queue.helper';
import { CHAINS, PAYMENT_SENDER_ACCOUNTS } from '../shared/constants';
import { ChainIdEnum } from '../shared/enums';
import paymentSenderAbi from '../shared/abi/payment-sender.abi.json';

const logger = new Logger('ReleasedEventService');

@Injectable()
export class ReleasedEventService implements OnModuleInit {
  onModuleInit() {
    this.trackEvent(ChainIdEnum.BSC_TEST);
  }

  private async trackEvent(chainId: ChainIdEnum) {
    const q = new Queue();

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

      logger.warn(
        `Getting past events, blocks range: ${formBlock} - ${toBlock} ...`,
      );

      const pastEvents: any[] = await paymentSender.queryFilter(
        RELEASED_EVENT,
        formBlock,
        toBlock,
      );

      q.push(
        ...pastEvents.map((event) => () => this.appendEvent(storageDir, event)),
      );

      currentBlock = toBlock + 1;

      if (currentBlock > latestBlock) {
        latestBlock = await provider.getBlockNumber();
      }
    }

    logger.warn(`All past events are got`);

    const providerWs = EthersService.useRpcWsProvider(CHAINS[chainId].rpcWs);

    const paymentSenderWs = EthersService.useContract(
      PAYMENT_SENDER_ACCOUNTS[chainId],
      paymentSenderAbi,
      providerWs,
    );

    paymentSenderWs.on(
      RELEASED_EVENT,
      (
        payee,
        nonce: BigNumber,
        amount: BigNumber,
        event: ReleasedEventInterface,
      ) => {
        q.push(() => this.appendEvent(storageDir, event));

        logger.warn(
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
        FileService.parseJSONFile<StoredReleasedEventInterface[]>(lastFile);
    } catch (e) {
      return startBlock;
    }

    if (prevEvents.length === 0) {
      return startBlock;
    }

    const lastEvent = prevEvents[prevEvents.length - 1];

    return lastEvent.blockNumber;
  }

  private async appendEvent(
    storageDirPath: string,
    event: ReleasedEventInterface,
  ) {
    let dir: string[];

    try {
      dir = await fs.readdir(storageDirPath);
    } catch (e) {
      await fs.mkdir(storageDirPath);
      dir = await fs.readdir(storageDirPath);
    }

    const lastFileName =
      dir.length === 0 ? `${RELEASED_EVENT}-1.json` : dir[dir.length - 1];
    const lastFilePath = path.join(storageDirPath, lastFileName);
    const lastFile = await fs.readFile(lastFilePath, { flag: 'a+' });

    let events: StoredReleasedEventInterface[];

    try {
      events =
        FileService.parseJSONFile<StoredReleasedEventInterface[]>(lastFile);
    } catch (e) {
      events = [];
    }

    const formattedEvent = formatReleasedEvent(event);

    const alreadyStored = events.find(
      (e) =>
        e.payee === formattedEvent.payee && e.nonce === formattedEvent.nonce,
    );

    if (alreadyStored) {
      return;
    }

    let fileName = lastFileName;

    if (events.length >= EVENTS_PER_FILE) {
      events = [];
      fileName = getNextFileName(lastFileName);
    }

    events.push(formattedEvent);

    const filePath = path.join(storageDirPath, fileName);

    await fs.writeFile(filePath, JSON.stringify(events, null, 2));
  }
}
