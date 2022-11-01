import { Injectable, OnModuleInit } from '@nestjs/common';
import { CHAINS, PAYMENT_SENDER_ACCOUNTS } from '../shared/constants';
import { ChainIdEnum } from '../shared/enums';
import { EthersService } from '../shared/services/ethers.service';
import paymentSenderAbi from '../shared/abi/payment-sender.abi.json';
import path from 'path';
import fs from 'fs/promises';
import { configService } from '../shared/config.server';
import {
  ReleasedEventInterface,
  StoredReleasedEventInterface,
} from './released-event.interfaces';
import { formatReleasedEvent, getNextFileName } from './released-event.helpers';
import {
  EVENTS_PER_FILE,
  RELEASED_EVENT,
  STORAGE_ROOT_DIR_PATH,
} from './released-event.constants';
import { FileService } from '../shared/services/file.service';
import { Queue } from '../shared/helpers/queue.helper';

@Injectable()
export class ReleasedEventService implements OnModuleInit {
  onModuleInit() {
    this.trackEvent(ChainIdEnum.BSC_TEST);
  }

  private async trackEvent(chianId: ChainIdEnum) {
    const q = new Queue();

    const storageDir = path.join(STORAGE_ROOT_DIR_PATH, String(chianId));

    const startFromBlock = await this.getLastEventBlock(storageDir);

    const skippedEvents = await this.getSkippedEvents(chianId, startFromBlock);

    q.push(
      ...skippedEvents.map(
        (event) => () => this.appendEvent(storageDir, event),
      ),
    );

    const provider = EthersService.useRpcWsProvider(CHAINS[chianId].rpcWs);

    const paymentSender = EthersService.useContract(
      PAYMENT_SENDER_ACCOUNTS[chianId],
      paymentSenderAbi,
      provider,
    );

    paymentSender.on(
      RELEASED_EVENT,
      (payee, nonce, amount, event: ReleasedEventInterface) => {
        q.push(() => this.appendEvent(storageDir, event));
      },
    );
  }

  private async getSkippedEvents(chianId: ChainIdEnum, startFromBlock: number) {
    const provider = EthersService.useRpcProvider(CHAINS[chianId].rpc);

    const paymentSender = EthersService.useContract(
      PAYMENT_SENDER_ACCOUNTS[chianId],
      paymentSenderAbi,
      provider,
    );

    const events = await paymentSender.queryFilter(
      RELEASED_EVENT,
      startFromBlock,
    );

    return events as unknown as ReleasedEventInterface;
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