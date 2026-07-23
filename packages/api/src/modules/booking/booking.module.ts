import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { BookingReleaseProcessor } from './booking-release.processor';
import { HOLD_RELEASE_QUEUE } from './booking.constants';

@Module({
  imports: [BullModule.registerQueue({ name: HOLD_RELEASE_QUEUE })],
  controllers: [BookingController],
  providers: [BookingService, BookingReleaseProcessor],
})
export class BookingModule {}
