import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { BookingState } from '@prisma/client';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.bookingService.create(dto);
  }

  @Get()
  list(@Query('state') state?: BookingState) {
    return this.bookingService.list(state);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.bookingService.get(id);
  }

  @Post(':id/request-payment')
  requestPayment(@Param('id') id: string) {
    return this.bookingService.requestPayment(id);
  }

  @Post(':id/payments')
  recordPayment(@Param('id') id: string, @Body() dto: CreatePaymentDto) {
    return this.bookingService.recordPayment(id, dto);
  }

  @Post(':id/payments/:paymentId/clear')
  clearPayment(@Param('id') id: string, @Param('paymentId') paymentId: string) {
    return this.bookingService.clearPayment(id, paymentId);
  }

  @Post(':id/sign-agreement')
  signAgreement(@Param('id') id: string) {
    return this.bookingService.signAgreement(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @Body() dto: CancelBookingDto) {
    return this.bookingService.cancel(id, dto);
  }
}
