import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BookingState, PaymentStatus, UnitStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { HOLD_RELEASE_QUEUE, HOLD_RELEASE_JOB } from './booking.constants';

@Injectable()
export class BookingService {
  private readonly holdHours: number;

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(HOLD_RELEASE_QUEUE) private readonly holdQueue: Queue,
  ) {
    this.holdHours = process.env.BOOKING_HOLD_HOURS ? Number(process.env.BOOKING_HOLD_HOURS) : 48;
  }

  async create(dto: CreateBookingDto) {
    const unit = await this.prisma.unit.findUnique({ where: { id: dto.unitId } });
    if (!unit) throw new NotFoundException('Unit not found');
    if (unit.status !== UnitStatus.available) {
      throw new ConflictException(`Unit is not available (current status: ${unit.status})`);
    }
    return this.prisma.booking.create({
      data: {
        unitId: dto.unitId,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        state: BookingState.draft,
      },
    });
  }

  list(state?: BookingState) {
    return this.prisma.booking.findMany({
      where: state ? { state } : undefined,
      include: { unit: true, payments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { unit: true, payments: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  /**
   * draft -> payment_pending. Atomic: lock the unit row, verify it is still
   * available, flip it to held, start the hold timer. Locking here (rather
   * than at draft creation) is what lets two sales reps race a call center
   * lead into the same unit and have only one of them win the hold.
   */
  async requestPayment(id: string) {
    const holdExpiresAt = new Date(Date.now() + this.holdHours * 60 * 60 * 1000);

    const booking = await this.prisma.$transaction(async (tx) => {
      const current = await tx.booking.findUnique({ where: { id } });
      if (!current) throw new NotFoundException('Booking not found');
      if (current.state !== BookingState.draft) {
        throw new ConflictException(`Cannot request payment from state '${current.state}'`);
      }

      const lockedUnits = await tx.$queryRaw<{ id: string; status: UnitStatus }[]>`
        SELECT id, status FROM units WHERE id = ${current.unitId} FOR UPDATE
      `;
      const unit = lockedUnits[0];
      if (!unit) throw new NotFoundException('Unit not found');
      if (unit.status !== UnitStatus.available) {
        throw new ConflictException(`Unit is not available (current status: ${unit.status})`);
      }

      await tx.unit.update({ where: { id: unit.id }, data: { status: UnitStatus.held } });
      return tx.booking.update({
        where: { id },
        data: { state: BookingState.payment_pending, holdExpiresAt },
      });
    });

    await this.holdQueue.add(
      HOLD_RELEASE_JOB,
      { bookingId: booking.id },
      { jobId: booking.id, delay: this.holdHours * 60 * 60 * 1000 },
    );

    return booking;
  }

  /** Records a payment attempt against a booking in payment_pending. Always starts pending — clearing is a separate step driven by the gateway callback. */
  async recordPayment(id: string, dto: CreatePaymentDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.state !== BookingState.payment_pending) {
      throw new ConflictException(`Cannot record payment in state '${booking.state}'`);
    }
    return this.prisma.payment.create({
      data: {
        bookingId: id,
        amount: dto.amount,
        method: dto.method,
        reference: dto.reference,
        status: PaymentStatus.pending,
      },
    });
  }

  /**
   * payment_pending -> confirmed. Called by the payment gateway webhook once
   * a token payment clears. Flips the unit to booked and cancels the
   * pending auto-release job.
   */
  async clearPayment(bookingId: string, paymentId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment || payment.bookingId !== bookingId) throw new NotFoundException('Payment not found');
    if (payment.status !== PaymentStatus.pending) {
      throw new ConflictException(`Payment already ${payment.status}`);
    }

    const booking = await this.prisma.$transaction(async (tx) => {
      const current = await tx.booking.findUnique({ where: { id: bookingId } });
      if (!current) throw new NotFoundException('Booking not found');
      if (current.state !== BookingState.payment_pending) {
        throw new ConflictException(`Cannot clear payment in state '${current.state}'`);
      }

      await tx.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.cleared, clearedAt: new Date() },
      });
      await tx.unit.update({ where: { id: current.unitId }, data: { status: UnitStatus.booked } });
      return tx.booking.update({
        where: { id: bookingId },
        data: { state: BookingState.confirmed },
      });
    });

    const job = await this.holdQueue.getJob(bookingId);
    if (job) await job.remove();

    return booking;
  }

  /** confirmed -> agreement_signed. Commission booking in Finance is triggered off this transition downstream. */
  async signAgreement(id: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.state !== BookingState.confirmed) {
      throw new ConflictException(`Cannot sign agreement from state '${booking.state}'`);
    }
    return this.prisma.booking.update({
      where: { id },
      data: { state: BookingState.agreement_signed, agreementSignedAt: new Date() },
    });
  }

  /**
   * -> cancelled (terminal, allowed from any non-cancelled state). Releases
   * the unit back to available. Refunding any cleared token payment is a
   * Finance-owned process outside this service's write-path — this only
   * unblocks the unit and closes the booking.
   */
  async cancel(id: string, dto: CancelBookingDto) {
    const booking = await this.prisma.$transaction(async (tx) => {
      const current = await tx.booking.findUnique({ where: { id } });
      if (!current) throw new NotFoundException('Booking not found');
      if (current.state === BookingState.cancelled) {
        throw new ConflictException('Booking already cancelled');
      }

      if (current.state === BookingState.payment_pending || current.state === BookingState.confirmed) {
        await tx.unit.update({ where: { id: current.unitId }, data: { status: UnitStatus.available } });
      }

      return tx.booking.update({
        where: { id },
        data: {
          state: BookingState.cancelled,
          cancelledAt: new Date(),
          cancelReason: dto.reason,
        },
      });
    });

    const job = await this.holdQueue.getJob(id);
    if (job) await job.remove();

    return booking;
  }
}
