import EventEmitter from 'events';

type Job = () => Promise<void>;

export class Queue extends EventEmitter {
  private q: (() => Promise<void>)[] = [];

  private flag = true;

  push(...job: Job[]) {
    this.q.push(...job);

    if (this.flag) {
      this.run();
    }
  }

  private async run() {
    this.flag = false;

    for (const job of this.q) {
      await job();
    }

    this.q = [];

    this.flag = true;
  }
}
