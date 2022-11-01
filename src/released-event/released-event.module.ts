import { Module } from '@nestjs/common';
import { ReleasedEventService } from './released-event.service';

@Module({
  providers: [ReleasedEventService],
})
export class ReleasedEventModule {}
