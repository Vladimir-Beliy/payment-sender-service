import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ReleasedEventProcessor } from './released-event.processor';
import { ReleasedEventService } from './released-event.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'released-event',
    }),
  ],
  providers: [ReleasedEventService, ReleasedEventProcessor],
})
export class ReleasedEventModule {}
