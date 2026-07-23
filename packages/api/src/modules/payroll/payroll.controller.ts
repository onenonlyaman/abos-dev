import { Controller, Get, Post, Body } from '@nestjs/common';
import { PayrollService } from './payroll.service';

@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Get('attendance')
  getAttendance() {
    return this.payrollService.getAttendance();
  }

  @Post('attendance')
  createAttendance(@Body() body: any) {
    return this.payrollService.createAttendance(body);
  }

  @Get('leaves')
  getLeaves() {
    return this.payrollService.getLeaves();
  }

  @Post('leaves')
  createLeave(@Body() body: any) {
    return this.payrollService.createLeave(body);
  }

  @Get('disbursals')
  getPayrollDisbursals() {
    return this.payrollService.getPayrollDisbursals();
  }

  @Post('disbursals')
  createPayrollDisbursal(@Body() body: any) {
    return this.payrollService.createPayrollDisbursal(body);
  }

  @Get('jobs')
  getJobPostings() {
    return this.payrollService.getJobPostings();
  }

  @Post('jobs')
  createJobPosting(@Body() body: any) {
    return this.payrollService.createJobPosting(body);
  }

  @Get('reviews')
  getPerformanceReviews() {
    return this.payrollService.getPerformanceReviews();
  }

  @Post('reviews')
  createPerformanceReview(@Body() body: any) {
    return this.payrollService.createPerformanceReview(body);
  }
}
