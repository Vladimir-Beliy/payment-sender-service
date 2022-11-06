import fs from 'fs/promises';
import path from 'path';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import {
  AppendJobInterface,
  ReleasedEventInterface,
} from './released-event.interfaces';
import { EVENTS_PER_FILE, RELEASED_EVENT } from './released-event.constants';
import { FileService } from '../shared/services/file.service';
import { getNextFileName } from './released-event.helpers';

@Processor('released-event')
export class ReleasedEventProcessor {
  @Process('append-event')
  async appendEvent(job: Job<AppendJobInterface>) {
    const { storageDirPath, event } = job.data;

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

    let events: ReleasedEventInterface[];

    try {
      events = FileService.parseJSONFile<ReleasedEventInterface[]>(lastFile);
    } catch (e) {
      events = [];
    }

    const alreadyStored = events.find(
      (e) => e.payee === event.payee && e.nonce === event.nonce,
    );

    if (alreadyStored) {
      return;
    }

    let fileName = lastFileName;

    if (events.length >= EVENTS_PER_FILE) {
      events = [];
      fileName = getNextFileName(lastFileName);
    }

    events.push(event);

    const filePath = path.join(storageDirPath, fileName);

    await fs.writeFile(filePath, JSON.stringify(events, null, 2));
  }
}
