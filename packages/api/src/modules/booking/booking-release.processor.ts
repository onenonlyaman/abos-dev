import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { BookingState, UnitStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { HOLD_RELEASE_QUEUE } from './booking.constants';

/**
 * Fires when a booking's 48h hold window expires. If the booking is still
 * sitting in payment_pending (token never cleared), the unit reverts to
 * available and the booking is closed out as auto-cancelled.
 */
@Processor(HOLD_RELEASE_QUEUE)
export class BookingReleaseProcessor extends WorkerHost {
  private readonly logger = new Logger(BookingReleaseProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<{ bookingId: string }>) {
    const { bookingId } = job.data;

    await this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({ where: { id: bookingId } });
      if (!booking || booking.state !== BookingState.payment_pending) return;

      await tx.unit.update({ where: { id: booking.unitId }, data: { status: UnitStatus.available } });
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          state: BookingState.cancelled,
          cancelledAt: new Date(),
          cancelReason: 'auto-release: hold window expired before payment cleared',
        },
      });
    });

    this.logger.log(`Hold released for booking ${bookingId}`);
  }
}
